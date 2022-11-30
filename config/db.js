import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const mysqlConnectionCache = new Map(); //FOR CACHING DBCONNECTIONS

const databaseConfig = (req, res, next) => {
  try {
    let dbname = process.env.DBNAME;
    const mysql = getSqlConnection(dbname);
    req.mysql = mysql;
    next();
  } catch (error) {
    res.status(500).send("Database configuration error");
    console.log(error);
  }
};

const getSqlConnection = (dbname) => {
  let mysqlConnection = mysqlConnectionCache.get(dbname);
  
  //IF NO EXISTING CONNECTION NEED TO CREATE DBCONNECTION
  if (!mysqlConnection) {
    mysqlConnection = mysql.createPool({
      host: process.env.HOST,
      port: 3306,
      user: process.env.USER,
      password: process.env.PASSWORD,
      database: dbname,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });

    mysqlConnectionCache.set(dbname, mysqlConnection);
  }

  return mysqlConnection;
};

export { getSqlConnection };

export default databaseConfig;
