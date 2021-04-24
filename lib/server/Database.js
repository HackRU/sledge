"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
/**
 * Manages persistent data.
 *
 * This class acts largely as a wrapper around better-sqlite3, allowing you to run queries.
 */
class Database {
    constructor(datadir) {
        this.datadir = datadir;
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
    prepare(source) {
        return this.internalPrepare(source);
    }
    /**
     * Wrapper over better-sqlite3's prepare
     * @param source sql code
     */
    internalPrepare(source) {
        try {
            return this.sql.prepare(source);
        }
        catch (e) {
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
    isInTransaction() {
        return this.inTransaction;
    }
    /**
     * Creates and immediately calls run on a prepared statement. Returns the last created row id.
     */
    run(stmt, bindParameters) {
        let prepared = this.internalPrepare(stmt);
        let result = prepared.run(bindParameters);
        if (typeof result.lastInsertRowid !== "number") {
            // Large rowids (which shouldn't happen) get returned
            // as bigints
            throw new Error("Bad lastInsertRowid");
        }
        return result.lastInsertRowid;
    }
    runMany(stmt, bindParameters) {
        let prepared = this.internalPrepare(stmt);
        let inserted = [];
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
    get(stmt, bindParameters) {
        let prepared = this.internalPrepare(stmt);
        return prepared.get(bindParameters);
    }
    /**
     * Creates an immediately calls all on a prepared statement.
     */
    all(stmt, bindParameters) {
        let prepared = this.internalPrepare(stmt);
        return prepared.all(bindParameters);
    }
    /**
     * Open the Sqlite3 database file, or create if it doesn't exist
     */
    openDatabase() {
        if (this.datadir === ":memory:") {
            this.sql = new better_sqlite3_1.default(":memory:");
            return false;
        }
        let dbPath = path_1.resolve(this.datadir, "sledge.db");
        try {
            fs_1.mkdirSync(this.datadir);
        }
        catch (err) {
            if (err.code !== "EEXIST") {
                throw err;
            }
        }
        let exists = fs_1.existsSync(dbPath);
        this.sql = new better_sqlite3_1.default(dbPath);
        return exists;
    }
    /**
     * Initialize the tables
     */
    initTables() {
        let schemaFile = path_1.resolve(__dirname, "../../schema.sql");
        let schemaText = fs_1.readFileSync(schemaFile, "utf8");
        this.sql.exec(schemaText);
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map