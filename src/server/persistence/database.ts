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
        +"judgeId INTEGER NOT NULL,"
        +"FOREIGN KEY(judgeId) REFERENCES Judge(id),"
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

  // TODO: AddX should probably return Row<X> with the generated id filled out

  addHack(hack : Hack) {
    let stmt = this.sql.prepare(
      "INSERT INTO Hack(name, description, location, active)"
        +"VALUES (?,?,?,?);");

    stmt.run([hack.name, hack.description, hack.location, hack.active]);
  }

  addJudge(judge : Judge) {
    let stmt = this.sql.prepare(
      "INSERT INTO Judge(name, email, active)"
        +"VALUES (?,?,?);");

    stmt.run([judge.name, judge.email, judge.active]);
  }

  addToken(token : Token) {
    let stmt = this.sql.prepare(
      "INSERT INTO Token(secret, privilege)"
        +"VALUES (?,?);");

    stmt.run([token.secret, token.privilege])
  }

  addSuperlative(superlative : Superlative) {
    let stmt = this.sql.prepare(
      "INSERT INTO Superlative(name)"
        +"VALUES (?);");

    stmt.run([superlative.name]);
  }

  addCategory(category : Category) {
    let stmt = this.sql.prepare(
      "INSERT INTO Category(name)"
        +"VALUES (?);");

    stmt.run([category.name]);
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
        +"?, ?, ?)"
    );

    stmt.run([
      rating.judgeId, rating.hackId,
      rating.judgeId, rating.hackId, rating.rating
    ]);
  }

  ////////////////////
  // Table Population

  areHacksPopulated() : Boolean {
    let stmt = this.sql.prepare("SELECT * FROM hacks;");
    return !!stmt.pluck().get();
  }

}
