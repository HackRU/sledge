import {Database} from "./Database";

export const isTable = (db: Database, maybeTable: string): boolean => {
    const tables = db.all<{name: string}>("SELECT name FROM sqlite_master WHERE type=\"table\"", []);
    return tables.map(table => table.name).includes(maybeTable);
}

export const hasColumn = (db: Database, table: string, column: string): boolean => {
    const columns = db.all<{cid: number, name: string, type: string, notnull: number, dflt_value: any, pk: number}>(`PRAGMA table_info("${table}")`, []);
    return columns.map(columnObj => columnObj.name).includes(column);
}
