import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const protect = asyncHandler( async (req, res, next) => {
    let token;
    const conn = req.mysql.promise();
    if(req.cookies.token){
        try{
            token = req.cookies.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            let [userInfo] = await conn.query(`SELECT * FROM users WHERE email = ?`, [decoded.email]);
            req.user = {
              email: userInfo[0].email,
              name: userInfo[0].name,
              role: userInfo[0].role,
            }
            next();
        } catch (err) {
            console.log(err);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if(!token){
        res.status(401);
        throw new Error('Not authorized, no token');
    }

});

const admin = (req, res, next) => {
    if(req.user && req.user.role === 'ADMIN'){
        next();
    }else{
        res.status(401);
        throw new Error('Not Authorized as an admin');
    }
}

export { protect, admin };