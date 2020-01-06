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

  private beginStmt: Statement;
  private commitStmt: Statement;
  private rollbackStmt: Statement;

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
   * Creates and immediately calls run on a prepared statement. Returns the last created row id.
   */
  run(stmt: string, bindParameters: any): number {
    let prepared = this.prepare(stmt);
    let result = prepared.run(bindParameters);
    if (typeof result.lastInsertRowid !== "number") {
      throw new Error("Bad lastInsertRowid");
    }
    return result.lastInsertRowid;
  }

  runMany(stmt: string, bindParameters: any[]): any[] {
    let prepared = this.prepare(stmt);
    let inserted: Array<number> = [];
    for (let params of bindParameters) {
      const rowId = prepared.run(params).lastInsertRowid;
      if (typeof rowId !== "number") {
        throw new Error("Bad lastInsertRowid");
      }
      inserted.push(rowId);
    }
    return inserted;
  }

  /**
   * Creates and immediately calls get on a prepared statement. Returns the result.
   */
  get<A>(stmt: string, bindParameters: any): A {
    let prepared = this.prepare(stmt);
    return prepared.get(bindParameters);
  }

  /**
   * Creates an immediately calls all on a prepared statement.
   */
  all<A>(stmt: string, bindParameters: any): Array<A> {
    let prepared = this.prepare(stmt);
    return prepared.all(bindParameters);
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
