import dotenv from "dotenv";
import mariadb from "mariadb";

dotenv.config();

export const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    multipleStatements: true,
    connectionLimit: 30
})
