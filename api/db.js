import mysql2 from "mysql2";

export const db=mysql2.createConnection({
    host:"localhost",
    port:"3306",
    user:"root",
    password:"Makkar@123",
    database:"fse2024",
})