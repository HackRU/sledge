import {mkdirSync} from "fs";
import {resolve} from "path";
import Sqlite3 from "better-sqlite3";

import {
  Hack, Judge, Token, JudgeHack, Superlative, SuperlativeHack,
  SuperlativePlacement, HackNoshow, Category, Rating, Row
} from "../../protocol/database.js";

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
        +"FOREIGN KEY(hackId) REFERENCES Hacks(id),"
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
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
        +"FOREIGN KEY(firstChoiceId) REFERENCES Hack(id),"
        +"FOREIGN KEY(secondChoiceId) REFERENCES Hack(id),"
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
        +"VALUES (?,?,?,?);");

    let r = stmt.run([hack.name, hack.description, hack.location, hack.active]);

    return {
      ...hack,
      id: r.lastInsertROWID as number
    };
  }

  addJudge(judge : Judge): Row<Judge> {
    let stmt = this.sql.prepare(
      "INSERT INTO Judge(name, email, active)"
        +"VALUES (?,?,?);");

    let r = stmt.run([judge.name, judge.email, judge.active]);

    return {
      ...judge,
      id: r.lastInsertROWID as number
    };
  }

  addJudgeHack(judgeHack: JudgeHack): Row<JudgeHack> {
    let stmt = this.sql.prepare(
      "INSERT INTO JudgeHack(judgeId, hackId, priority)"
        +"VALUES (?,?,?);");

    let r = stmt.run([judgeHack.judgeId, judgeHack.hackId, judgeHack.priority]);

    return {
      ...judgeHack,
      id: r.lastInsertROWID as number
    };
  }

  addToken(token : Token): Row<Token> {
    let stmt = this.sql.prepare(
      "INSERT INTO Token(secret, privilege)"
        +"VALUES (?,?);");

    let r = stmt.run([token.secret, token.privilege]);

    return {
      ...token,
      id: r.lastInsertROWID as number
    };
  }

  addSuperlative(superlative : Superlative): Row<Superlative> {
    let stmt = this.sql.prepare(
      "INSERT INTO Superlative(name)"
        +"VALUES (?);");

    let r = stmt.run([superlative.name]);

    return {
      ...superlative,
      id: r.lastInsertROWID as number
    };
  }

  addSuperlativeHack(superlativeHack: SuperlativeHack): Row<SuperlativeHack> {
    let stmt = this.sql.prepare(
      "INSERT INTO SuperlativeHack(hackId, superlativeId)"
        +"VALUES (?,?);");

    let r = stmt.run([superlativeHack.hackId, superlativeHack.superlativeId]);

    return {
      ...superlativeHack,
      id: r.lastInsertROWID as number
    };
  }

  addCategory(category : Category): Row<Category> {
    let stmt = this.sql.prepare(
      "INSERT INTO Category(name)"
        +"VALUES (?);");

    let r = stmt.run([category.name]);

    return {
      ...category,
      id: r.lastInsertROWID as number
    };
  }

  ////////////////////
  // Change Rows

  changeSuperlativePlacement(placement : SuperlativePlacement) {
    let stmt = this.sql.prepare(
      "INSERT INTO SuperlativePlacement"
        +"(id, judgeId, superlativeId, firstChoice, secondChoice)"
      +"VALUES ("
        +"(SELECT id FROM SuperlativePlacement WHERE judgeId=? AND superlativeId = ?),"
      +"?, ?, ?, ?);");

    stmt.run([
      placement.judgeId, placement.superlativeId,
      placement.judgeId, placement.superlativeId,
      placement.firstChoiceId, placement.secondChoiceId
    ]);
  }

  changeRating(rating : Rating) {
    let stmt = this.sql.prepare(
      "INSERT INTO Rating"
        +"(id, judgeId, hackId, rating)"
      +"VALUES ("
        +"(SELECT id FROM Rating WHERE judgeId=? AND hackId=?),"
        +"?, ?, ?);"
    );

    stmt.run([
      rating.judgeId, rating.hackId,
      rating.judgeId, rating.hackId, rating.rating
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
  // Get Single Rows

  getTokenBySecret(secret: string): Token | undefined {
    let stmt = this.sql.prepare(
      "SELECT * FROM Token WHERE secret=?;");

    return stmt.pluck().get([secret]);
  }

  ////////////////////
  // Table Population

  areHacksPopulated() : Boolean {
    let stmt = this.sql.prepare("SELECT * FROM hacks;");
    return !!stmt.pluck().get();
  }

}
