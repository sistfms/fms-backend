import jwt from 'jsonwebtoken';

export const generateToken = email => {
    return jwt.sign({ email }, process.env.JWT_SECRET, { 
        expiresIn: '30d'
     });
}

export const getCustomJwtToken = (data, expiry) => {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: expiry,
    });
}

export const verifyAndDecodeToken = async token => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}