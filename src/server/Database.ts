import {mkdirSync, readFileSync} from "fs";
import {resolve} from "path";

import {
  default as Sqlite3,
} from "better-sqlite3";
import integer from "integer";

/**
 * Manages persistent data
 */
export class Database {
  private sql: Sqlite3;

  private beginStmt;
  private commitStmt;
  private rollbackStmt;

  constructor(private datadir: string) {
    this.openDatabase();
    this.initTables();
    this.initData();

    this.beginStmt = this.sql.prepare("BEGIN;");
    this.commitStmt = this.sql.prepare("END;");
    this.rollbackStmt = this.sql.prepare("ROLLBACK;");
  }

  prepare = (source: string) => this.sql.prepare(source);

  /**
   * Start a Transaction
   */
  begin() {
    this.beginStmt.run();
  }

  /**
   * Rollback a Transaction
   */
  rollback() {
    this.rollbackStmt.run();
  }

  /**
   * End and commit a Transaction
   */
  commit() {
    this.commitStmt.run();
  }

  /**
   * Open the Sqlite3 database file, or create if it doesn't exist
   */
  private openDatabase() {
    let dbPath = resolve(this.datadir, "sledge.db");
    try {
      mkdirSync(this.datadir);
    } catch (err) {
      if (err.code !== "EEXIST") {
        throw err;
      }
    }

    this.sql = new Sqlite3(dbPath);
  }

  /**
   * Initialize the tables
   */
  private initTables() {
    let schemaFile = resolve(__dirname, "../../schema.sql");
    let schemaText = readFileSync(schemaFile, "utf8");
    this.sql.exec(schemaText);
  }

  /**
   * Initializes data if necessary to maintain invariants
   */
  private initData() {
    // We must always have a row in the Status table
    let hasStatus = !!this.sql.prepare("SELECT 1 FROM Status;").get();
    if (!hasStatus) {
      this.sql
        .prepare("INSERT INTO Status(timestamp, phase) VALUES(?,1);")
        .run(integer(Date.now()));
    }

    // We must always have an overall prize
    let hasOverall = !!this.sql
      .prepare("SELECT 1 from Prize WHERE isOverall=1;").get();
    if (!hasOverall) {
      this.sql
        .prepare("INSERT INTO Prize(name, isOverall) VALUES('Overall', 1);")
        .run();
    }
  }
}
