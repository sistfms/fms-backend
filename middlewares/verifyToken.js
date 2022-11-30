import jwt from "jsonwebtoken";

//MIDDLEWARE FOR VERIFYING ENDPOINTS
//VERIFIES THE ACCESS TOKEN SENT FROM FRONTEND
//IF AUTHORISED WILL CALL NEXT() METHOD
export const verifyAccessToken = (req, res, next) => {
  let token = req.headers?.authorization?.split(" ")[1] || null;
  if (token !== null) {
    jwt.verify(token, process.env.JWTSECRET, (err, user) => {
      if (err) {
        console.log(err);
        return res.status(401).send("invalid token");
      } else {
        next();
      }
    });
  } else {
    return res.status(401).send("unauthorised");
  }
};
//MIDDLEWARE FOR VERIFYING REFRESH ENDPOINT (/refresh)
//VERIFIES THE ACCESS TOKEN SENT FROM FRONTEND
//IF AUTHORISED WILL CREATE NEW ACCESS AND REFRESH TOKEN
export const verifyRefreshToken = (req, res, next) => {
  let token;
  if (req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
      delete user.iat;
      delete user.exp;
      if (err) {
        if (err.message === "jwt expired") {
          return res.status(401).send("Session Expired");
        }
        return res.status(401).send();
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    return res.status(401).send("unauthorised");
  }
};
