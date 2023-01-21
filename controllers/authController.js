import jwt from "jsonwebtoken";
import moment from "moment";
import bcrypt from "bcryptjs";
import {generateToken, getCustomJwtToken, verifyAndDecodeToken} from "../utils/generateToken.js";
import sendEmail from "../config/mail.js";


export const loginController = async (req, res) => {
  const {email, password} = req.body;
  const conn = req.mysql.promise();
  try{
    let [userInfo] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if(userInfo.length === 0){
      return res.status(401).json({message: "Invalid Credentials"});
    }else{
      userInfo = userInfo[0];
      if (userInfo.status  !== 'ACTIVE'){
        return res.status(401).json({
          status: 401,
          message: "Your account is not active."
        });
      }
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
    let [newUser] = await conn.query(`INSERT INTO users (name, email, \`password\`, \`role\`) VALUES (?, ?, ?, ?)`, [name, email, hashedPassword, role]);
    
    let emailVerificationToken = getCustomJwtToken({
      id: newUser.insertId,
      type: "emailVerification",
    }, "1d");

    sendEmail({
      to: email,
      subject: "Please verify your email",
      content: `
      <h1>SIST FMS</h1>
      <h4>Hi ${name}</h4>
      <p>Thank you for registering with us. Please click on the link below to verify your email.</p>
      <a href="${process.env.BACKEND_URL}/verifyAccount?token=${emailVerificationToken}">Verify Email</a>
      <p>Regards,</p>
      <p>Team SIST FMS</p>
      `
    })
    return res.status(201).json({
      user: {
        id: newUser.insertId,
        name: name,
        email: email,
        role: role
      },
      message: "User created successfully"
    });
  } catch(err){
    console.log(err);
    return res.status(500).json({message: "Internal Server error"});
  }
};

// @PATH: /verifyAccount?token=:token
// @METHOD: GET
// @DESC: Verify user account
export const verifyAccountController = async (req, res) => {
  const {token} = req.query;
  try {
    const decodedToken = await verifyAndDecodeToken(token);
    console.log("decoded token", decodedToken);
    if(decodedToken){
      if(decodedToken.type === "emailVerification"){
        let conn = req.mysql.promise();
        try{
          let [user] = await conn.query(`SELECT * FROM users WHERE id = ?`, [decodedToken.id]);
          if(user.length > 0){
            user = user[0];
            if(user.email_verified === 1){
              return res.status(400).json({
                status: 400,
                message: "User already verified"
              });
            }else{
              await conn.query(`UPDATE users SET email_verified = 1, status='ACTIVE' WHERE id = ?`, [decodedToken.id]);
              return res.status(200).json({
                status: 200,
                message: "User verified successfully"
              });
            }
          }else{
            return res.status(400).json({
              status: 400,
              message: "Invalid token"
            });
          }
        }catch(err){
          console.log(err);
          return res.status(500).json({
            status: 500,
            message: "Internal Server error"
          });
        }
      }else{
        return res.status(400).json({
          status: 400,
          message: "Invalid token"});
      }
    }else{
      return res.status(400).json({
        status: 400,
        message: "Invalid token"
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Internal Server error"
    });
  }
}
