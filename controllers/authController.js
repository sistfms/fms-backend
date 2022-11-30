import jwt from "jsonwebtoken";
import moment from "moment";

import { getSqlConnection } from "../config/db.js";

export const loginController = async (req, res) => {
  res.send("login");
};

export const logoutController = async (req, res) => {
  let conn = req.mysql.promise();
  try {
    let [userInfo] = await conn.query(`SELECT * FROM users`);
    console.log(userInfo);
  } catch(err){
    console.log(err);
  }
  res.send("logout");
}

export const refreshController = async (req, res) => {
  res.send("refresh");
}
