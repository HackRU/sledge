import {mkdirSync, readFileSync, existsSync} from "fs";
import {resolve} from "path";

import Sqlite3 from "better-sqlite3";
import integer from "integer";

/**
 * Manages persistent data
 */
export class Database {
  private sql: any;
  private inTransaction: boolean;

  private beginStmt;
  private commitStmt;
  private rollbackStmt;

  constructor(private datadir: string) {
    let existed = this.openDatabase();
    if (!existed) {
      this.initTables();
    }

    this.inTransaction = false;
    this.beginStmt = this.sql.prepare("BEGIN;");
    this.commitStmt = this.sql.prepare("END;");
    this.rollbackStmt = this.sql.prepare("ROLLBACK;");
  }

  /**
   * Create a Statement
   */
  prepare(source: string): Statement {
    try {
      return this.sql.prepare(source);
    } catch (e) {
      console.warn("Error during prepare.");
      console.warn(source);
      throw e;
    }
  }

  /**
   * Start a Transaction
   */
  begin() {
    this.inTransaction = true;
    this.beginStmt.run();
  }

  /**
   * Rollback a Transaction
   */
  rollback() {
    this.inTransaction = false;
    this.rollbackStmt.run();
  }

  /**
   * End and commit a Transaction
   */
  commit() {
    this.inTransaction = false;
    this.commitStmt.run();
  }

  /**
   * Based on begin and commit calls, returns if we are currently in a transaction
   */
  isInTransaction(): boolean {
    return this.inTransaction;
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

    let exists = existsSync(dbPath);
    this.sql = new Sqlite3(dbPath);

    return exists;
  }

  /**
   * Initialize the tables
   */
  private initTables() {
    let schemaFile = resolve(__dirname, "../../schema.sql");
    let schemaText = readFileSync(schemaFile, "utf8");
    this.sql.exec(schemaText);
  }
}

export type Statement = Sqlite3.Statement;
