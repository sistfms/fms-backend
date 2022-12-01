import jwt from "jsonwebtoken";
import moment from "moment";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";


export const loginController = async (req, res) => {
  const {email, password} = req.body;
  const conn = req.mysql.promise();
  try{
    let [userInfo] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if(userInfo.length === 0){
      return res.status(401).json({message: "Invalid Credentials"});
    }else{
      userInfo = userInfo[0];
      const isMatch = await bcrypt.compare(password, userInfo.password);
      if(!isMatch){
        return res.status(401).json({message: "Invalid Credentials"});
      }else{
        const token = generateToken(userInfo.email);
        res.cookie('token', token, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000, sameSite: "none", secure: true });
        return res.status(200).send({
          email: userInfo.email,
          name: userInfo.name,
          role: userInfo.role,
          token: token
        });
      }
    }

  } catch (err){
    res.status(500).send("Server Error");
    console.log(err);
  }
};

export const logoutController = async (req, res) => {
  res.cookie('token', '', {httpOnly: true, maxAge: 0});
  res.send('Success');
}

export const refreshController = async (req, res) => {
  const token = req.cookies.token;
  if(token && jwt.verify(token, process.env.JWT_SECRET)){
    let [userInfo] = await req.mysql.promise().query(`SELECT * FROM users WHERE email = ?`, [req.user.email]);
    if (userInfo.length > 0){
     userInfo = userInfo[0];
     res.json({
        email: userInfo.email,
        name: userInfo.name,
        role: userInfo.role,
     });
    }else{
      res.status(401).json({message: "Invalid Credentials"});
    }
  }else{
    res.status(401).json({message: "Invalid Credentials"});
  }
}

export const registerUserController = async (req, res) => {
  const {name, email, password} = req.body;
  let role = "ADMIN";
  let conn = req.mysql.promise();
  try {
    let [existingUser] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if(existingUser.length > 0){
      return res.status(400).json({message: "User already exists"});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let [newUser] = await conn.query(`INSERT INTO users (name, email, password, \`role\`) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, role]);
    return res.status(201).json({message: "User created successfully"});
  } catch(err){
    console.log(err);
    return res.status(500).json({message: "Internal Server error"});
  }
}
