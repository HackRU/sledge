import {mkdirSync, readFileSync, existsSync} from "fs";
import {resolve} from "path";

import Sqlite3 from "better-sqlite3";

/**
 * Manages persistent data.
 *
 * This class acts largely as a wrapper around better-sqlite3, allowing you to run queries.
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
   * @deprecated Use run, runMany, get and all instead.
   */
  prepare(source: string): Statement {
    return this.internalPrepare(source);
  }

  /**
   * Wrapper over better-sqlite3's prepare
   * @param source sql code
   */
  private internalPrepare(source: string): Statement {
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
    let prepared = this.internalPrepare(stmt);
    let result = prepared.run(bindParameters);
    if (typeof result.lastInsertRowid !== "number") {
      // Large rowids (which shouldn't happen) get returned
      // as bigints
      throw new Error("Bad lastInsertRowid");
    }
    return result.lastInsertRowid;
  }

  runMany(stmt: string, bindParameters: any[]): any[] {
    let prepared = this.internalPrepare(stmt);
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
    let prepared = this.internalPrepare(stmt);
    return prepared.get(bindParameters);
  }

  /**
   * Creates an immediately calls all on a prepared statement.
   */
  all<A>(stmt: string, bindParameters: any): Array<A> {
    let prepared = this.internalPrepare(stmt);
    return prepared.all(bindParameters);
  }

  /**
   * Open the Sqlite3 database file, or create if it doesn't exist
   */
  private openDatabase() {
    if (this.datadir === ":memory:") {
      this.sql = new Sqlite3(":memory:");
      return false;
    }

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
