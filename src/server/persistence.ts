import {mkdirSync} from "fs";
import {resolve} from "path";
import Sqlite3 from "better-sqlite3";

import {
  Hack, Judge, Token, JudgeHack, Superlative, SuperlativeHack,
  SuperlativePlacement, HackNoshow, Category, Rating, Row
} from "../protocol/database.js";

export class DatabaseConnection {
  private sql : Sqlite3;

  constructor(private datadir: string) {
    this.openDatabase();
    this.initTables();
  }

  private openDatabase() {
    let dbpath = resolve(this.datadir, "sledge.db");
    try {
      mkdirSync(this.datadir);
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }

    this.sql = new Sqlite3(dbpath);
  }

  private initTables() {
    // Note about conventions:
    //  The convention for table and column names is a little different from
    //  before to improve interoperability with Javascript. Table names should
    //  be singular PascalCase and column names should be camelCase. Each table
    //  should have two corresponding interfaces in protocol/database.ts with
    //  matching names and column names should match names of interface members.

    // Note:
    //  The documentation for each table is found in protocol/database.ts.
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Hack ("
        +"id INTEGER NOT NULL,"
        +"name TEXT NOT NULL,"
        +"description TEXT NOT NULL,"
        +"location INTEGER NOT NULL,"
        +"active INTEGER NOT NULL,"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Judge ("
        +"id INTEGER NOT NULL,"
        +"name TEXT NOT NULL,"
        +"email TEXT NOT NULL,"
        +"active INTEGER NOT NULL,"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Token ("
        +"id INTEGER NOT NULL,"
        +"secret TEXT NOT NULL,"
        +"privilege INTEGER NOT NULL,"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS JudgeHack ("
        +"id INTEGER NOT NULL,"
        +"judgeId INTEGER NOT NULL,"
        +"hackId INTEGER NOT NULL,"
        +"priority INTEGER NOT NULL,"
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
        +"FOREIGN KEY(hackId) REFERENCES Hack(id),"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Superlative ("
        +"id INTEGER NOT NULL,"
        +"name TEXT NOT NULL,"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS SuperlativeHack ("
        +"id INTEGER NOT NULL,"
        +"hackId INTEGER NOT NULL,"
        +"superlativeId INTEGER NOT NULL,"
        +"FOREIGN KEY(hackId) REFERENCES Hack(id),"
        +"FOREIGN KEY(superlativeId) REFERENCES Superlative(id),"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS SuperlativePlacement ("
        +"id INTEGER NOT NULL,"
        +"judgeId INTEGER NOT NULL,"
        +"superlativeId INTEGER NOT NULL,"
        +"firstChoiceId INTEGER NOT NULL,"
        +"secondChoiceId INTEGER NOT NULL,"
        // We can't have a foreign key constraint for choices, because
        // 0 represents none chosen
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS HackNoshow ("
        +"id INTEGER NOT NULL,"
        +"judgeId INTEGER NOT NULL,"
        +"hackId INTEGER NOT NULL,"
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
        +"FOREIGN KEY(hackId) REFERENCES Hack(id),"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Category ("
        +"id INTEGER NOT NULL,"
        +"name TEXT NOT NULL,"
        +"PRIMARY KEY(id)"
      +");");
    this.sql.exec(
      "CREATE TABLE IF NOT EXISTS Rating ("
        +"id INTEGER NOT NULL,"
        +"judgeId INTEGER NOT NULL,"
        +"hackId INTEGER NOT NULL,"
        +"categoryId INTEGER NOT NULL,"
        +"rating INTEGER NOT NULL,"
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
        +"FOREIGN KEY(hackId) REFERENCES Hack(id),"
        +"FOREIGN KEY(categoryId) REFERENCES Category(id),"
        +"PRIMARY KEY(id)"
      +");");
  }

  ////////////////////
  // Adding Rows

  addHack(hack : Hack): Row<Hack> {
    let stmt = this.sql.prepare(
      "INSERT INTO Hack(name, description, location, active)"
        +"VALUES ($name, $description, $location, $active);");

    let r = stmt.run(hack);

    return {
      ...hack,
      id: r.lastInsertROWID as number
    };
  }

  addJudge(judge : Judge): Row<Judge> {
    let stmt = this.sql.prepare(
      "INSERT INTO Judge(name, email, active)"
        +"VALUES ($name, $email, $active);");

    let r = stmt.run(judge);

    return {
      ...judge,
      id: r.lastInsertROWID as number
    };
  }

  addJudgeHack(judgeHack: JudgeHack): Row<JudgeHack> {
    let stmt = this.sql.prepare(
      "INSERT INTO JudgeHack(judgeId, hackId, priority)"
        +"VALUES ($judgeId, $hackId, $priority);");

    let r = stmt.run(judgeHack);

    return {
      ...judgeHack,
      id: r.lastInsertROWID as number
    };
  }

  addToken(token : Token): Row<Token> {
    let stmt = this.sql.prepare(
      "INSERT INTO Token(secret, privilege)"
        +"VALUES ($secret, $privilege);");

    let r = stmt.run(token);

    return {
      ...token,
      id: r.lastInsertROWID as number
    };
  }

  addSuperlative(superlative : Superlative): Row<Superlative> {
    let stmt = this.sql.prepare(
      "INSERT INTO Superlative(name)"
        +"VALUES ($name);");

    let r = stmt.run(superlative);

    return {
      ...superlative,
      id: r.lastInsertROWID as number
    };
  }

  addSuperlativeHack(superlativeHack: SuperlativeHack): Row<SuperlativeHack> {
    let stmt = this.sql.prepare(
      "INSERT INTO SuperlativeHack(hackId, superlativeId)"
        +"VALUES ($hackId, $superlativeId);");

    let r = stmt.run(superlativeHack);

    return {
      ...superlativeHack,
      id: r.lastInsertROWID as number
    };
  }

  addCategory(category : Category): Row<Category> {
    let stmt = this.sql.prepare(
      "INSERT INTO Category(name)"
        +"VALUES ($name);");

    let r = stmt.run(category);

    return {
      ...category,
      id: r.lastInsertROWID as number
    };
  }

  ////////////////////
  // Change Rows

  changeSuperlativePlacement(placement : SuperlativePlacement) {
    let stmt = this.sql.prepare(
      "INSERT OR REPLACE INTO SuperlativePlacement"
        +"(id, judgeId, superlativeId, firstChoiceId, secondChoiceId)"
      +"VALUES ("
        +"(SELECT id "
          +"FROM SuperlativePlacement "
          +"WHERE judgeId=$judgeId AND superlativeId=$superlativeId),"
      +"$judgeId, $superlativeId, $firstChoiceId, $secondChoiceId);");

    stmt.run(placement);
  }

  changeJudgeHackPriority(d: {judgeId: number, hackId: number, newPriority: number}) {
    let stmt = this.sql.prepare(
      "INSERT OR REPLACE INTO JudgeHack"
        +"(id, judgeId, hackId, priority)"
      +"VALUES ("
        +"(SELECT id FROM JudgeHack WHERE judgeId=$judgeId AND hackId=$hackId),"
      +"$judgeId, $hackId, $newPriority);");

    stmt.run(d);
  }

  changeRating(rating : Rating) {
    let stmt = this.sql.prepare(
      "INSERT OR REPLACE INTO Rating"
        +"(id, judgeId, hackId, categoryId, rating)"
      +"VALUES ("
        +"(SELECT id FROM Rating WHERE judgeId=? AND hackId=? AND categoryId=?),"
        +"?, ?, ?, ?);"
    );

    stmt.run([
      rating.judgeId, rating.hackId, rating.categoryId,
      rating.judgeId, rating.hackId, rating.categoryId, rating.rating
    ]);
  }

  /** Returns if hack existed */
  modifyHack(id: number, hack: Partial<Hack>): boolean {
    let existsStmt = this.sql.prepare(
      "SELECT 1 FROM Hack WHERE id=?;");
    if (!existsStmt.get([id]))
      return false;
    if (hack.name != null)
      this.sql.prepare(
        "UPDATE Hack SET name=? WHERE id=?;").run([hack.name, id]);
    if (hack.description != null)
      this.sql.prepare(
        "UPDATE Hack SET description=? WHERE id=?;").run([hack.description, id]);
    if (hack.location != null)
      this.sql.prepare(
        "UPDATE Hack SET location=? WHERE id=?;").run([hack.location, id]);
    if (hack.active != null)
      this.sql.prepare(
        "UPDATE Hack SET active=? WHERE id=?;").run([hack.active, id]);
    return true;
  }

  ////////////////////
  // Getting Tables

  getAllHacks(): Array<Row<Hack>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM Hack;");

    return stmt.all();
  }

  getAllJudges(): Array<Row<Judge>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM Judge;");

    return stmt.all();
  }

  getAllSuperlatives(): Array<Row<Superlative>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM Superlative;");

    return stmt.all();
  }

  getAllSuperlativeHacks(): Array<Row<SuperlativeHack>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM SuperlativeHack;");

    return stmt.all();
  }

  getAllCategories(): Array<Row<Category>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM Category;");

    return stmt.all();
  }

  ////////////////////
  // Get Reformatted Data

  getJudgeHackMatrix(): number[][] {
    let stmt = this.sql.prepare(
      "SELECT * FROM JudgeHack");

    let judgesCount = this.getJudgesCount();
    let hacksCount = this.getHacksCount();

    let r: number[][] = [];
    for (let i=0;i<judgesCount;i++) {
      let h: number[] = [];
      for (let j=0;j<hacksCount;j++) {
        h.push(0);
      }
      r.push(h);
    }

    let all = stmt.all();

    for (let row of all) {
      r[row.judgeId-1][row.hackId-1] = row.priority;
    }

    return r;
  }

  getRatingsOfJudge(judgeId: number): number[][] {
    let stmt = this.sql.prepare(
      "SELECT * FROM Rating WHERE judgeId=?;");

    let categoriesCount = this.getCategoriesCount();
    let hacksCount = this.getHacksCount();

    let r: number[][] = [];
    for (let i=0;i<hacksCount;i++) {
      let h: number[] = [];
      for (let j=0;j<categoriesCount;j++) {
        h.push(0);
      }
      r.push(h);
    }

    let all: Array<Row<Rating>> = stmt.all(judgeId);

    for (let row of all) {
      r[row.hackId-1][row.categoryId-1] = row.rating;
    }

    return r;
  }

  getRatingsOfAllJudges(): number[][][] {
    let judgesCount = this.getJudgesCount();
    let hacksCount = this.getHacksCount();
    let categoriesCount = this.getCategoriesCount();

    let ratings: number[][][] = [];
    for (let i=0;i<judgesCount;i++) {
      let r: number[][] = [];
      for (let j=0;j<hacksCount;j++) {
        let h: number[] = [];
        for (let k=0;k<categoriesCount;k++) {
          h.push(0);
        }
        r.push(h);
      }
      ratings.push(r);
    }

    let stmt = this.sql.prepare(
      "SELECT * FROM Rating;");
    let all: Array<Row<Rating>> = stmt.all();
    for (let r of all) {
      ratings[r.judgeId-1][r.hackId-1][r.categoryId-1] = r.rating;
    }

    return ratings;
  }

  getHackIdsOfJudge(judgeId: number): number[] {
    let stmt = this.sql.prepare(
      "SELECT hackId FROM JudgeHack "
        +"WHERE "
          +"judgeId=? AND priority>0 "
        +"ORDER BY "
          +"priority ASC,"
          +"hackId ASC;");

    return stmt.all([judgeId]).map(jh => jh.hackId);
  }

  /**
   */
  getSuperlativePlacementsOfJudge(judgeId: number): Array<SuperlativePlacement> {
    let stmt = this.sql.prepare(
      "SELECT * "
        +"FROM SuperlativePlacement "
        +"WHERE "
          +"judgeId=$judgeId "
        +"ORDER BY "
          +"superlativeId ASC;");

    let all: Array<SuperlativePlacement> = stmt.all({judgeId});
    let placements: Array<SuperlativePlacement> = new Array(this.getSuperlativesCount());

    for (let p of all) {
      placements[p.superlativeId-1] = p;
    }

    for (let i=0;i<placements.length;i++) {
      if (!placements[i]) {
        placements[i] = {
          superlativeId: 0,
          judgeId: -1,
          firstChoiceId: 0,
          secondChoiceId: 0
        };
      }
    }

    return placements;
  }

  getAllSuperlativePlacementsMatrix(): Array<Array<SuperlativePlacement>> {
    let stmt = this.sql.prepare(
      "SELECT * FROM SuperlativePlacement;");
    let all: Array<SuperlativePlacement> = stmt.all();

    let hacksCount = this.getHacksCount();

    let r: Array<Array<SuperlativePlacement>> = new Array(this.getJudgesCount());
    for (let i=0;i<r.length;i++) {
      r[i] = new Array(hacksCount);
    }

    for (let s of all) {
      r[s.judgeId-1][s.superlativeId-1] = s;
    }

    for (let i=0;i<r.length;i++) {
      for (let j=0;j<r[i].length;j++) {
        if (!r[i][j]) {
          r[i][j] = {
            judgeId: i+1,
            superlativeId: j+1,
            firstChoiceId: 0,
            secondChoiceId: 0
          };
        }
      }
    }

    return r;
  }

  ////////////////////
  // Get Single Rows

  getTokenBySecret(secret: string): Token | undefined {
    let stmt = this.sql.prepare(
      "SELECT * FROM Token WHERE secret=?;");

    let r = stmt.get([secret]);

    return r;
  }

  ////////////////////
  // Table Population

  areHacksPopulated() : Boolean {
    let stmt = this.sql.prepare("SELECT * FROM Hack;");
    return !!stmt.pluck().get();
  }

  getJudgesCount(): number {
    let stmt = this.sql.prepare(
      "SELECT id FROM Judge ORDER BY id DESC LIMIT 1;");
    let row = stmt.get();
    return row ? row.id : 0;
  }

  getHacksCount(): number {
    let stmt = this.sql.prepare(
      "SELECT id FROM Hack ORDER BY id DESC LIMIT 1;");
    let row = stmt.get();
    return row ? row.id : 0;
  }

  getCategoriesCount(): number {
    let stmt = this.sql.prepare(
      "SELECT id FROM Category ORDER BY id DESC LIMIT 1;");
    let row = stmt.get();
    return row ? row.id : 0;
  }

  getSuperlativesCount(): number {
    let stmt = this.sql.prepare(
      "SELECT id FROM Superlative ORDER BY id DESC LIMIT 1;");
    let row = stmt.get();
    return row ? row.id : 0;
  }

}
