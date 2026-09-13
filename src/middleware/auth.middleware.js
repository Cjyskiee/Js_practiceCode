import jwt from 'jsonwebtoken';


function verifyToken(req, res, next) {

    const header = req.headers.authorization; // for authorization in token

    if (!header) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "No token provided" });  // no token provided
    }
    try {
    
        const payload = jwt.verify(token, process.env.JWT_SECRET); //verify the token through jwt_secret
        req.user = payload; //send to user.
        next();
    } catch (err){
        console.error(err);
        return res.status(401).json({ error: "Invalid or Token expired" });
    }

};  

export default verifyToken;