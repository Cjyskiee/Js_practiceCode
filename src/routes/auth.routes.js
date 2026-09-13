import bcrypt from 'bcrypt';
import express from 'express';
import dbpool from '../config/database.js';
import jwt from 'jsonwebtoken';



const router = express.Router();


router.post('/register', async (req, res) => {

    const { username, password } = req.body; 

    if(!username || !password){ // check if both are filled up
        return res.status(400).json({ error: "Username Or password is required!!" });
    }
    try {

        const existCheck = await dbpool.query( 
            'SELECT * FROM users WHERE username = $1', [username]
        );
        if (existCheck.rows.length === 1) { // existance of same username the user input
            return res.status(409).json({ error: "Username already taken" })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const register = await dbpool.query( // create account
            'INSERT INTO users (username, password_hashed) VALUES ($1, $2) RETURNING *', [username, hashedPassword]
        );
        console.log(`Succefully created account ${username}`);
        const newUser = register.rows[0]; // for calling safe response.
        res.status(201).json({ id: newUser.id, username: newUser.username }); // only the id and username can be called
    } catch (err){
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }

});

router.post('/login', async (req, res) => {

    const { username, password } = req.body;
    if(!username || !password){ // check if both are filled up
        return res.status(400).json({ error: "Username Or password is required!!" });
    }

    try {

        const existUser = await dbpool.query( 
            'SELECT * FROM users WHERE username = $1', [username]
        );
        if (existUser.rows.length === 0) { // existance of user.
            return res.status(409).json({ error: "No User has found" });
        }
        const userpass = existUser.rows[0];
        const verifyPassword = await bcrypt.compare(password, userpass.password_hashed)
        if (!verifyPassword){
            return res.status(401).json({ error: "Invalid username or password!" })
        }
        const token = jwt.sign(
            { id: userpass.id, username: userpass.username },  // payload — data embedded in the token
            process.env.JWT_SECRET,                             // secret key used to sign it
            { expiresIn: '1h' }                                  // token expires after 1 hour
        );
        res.status(200).json({
            Sucessful: true,
            token: token,
        })
        console.log(`Succefully login!! ${username}`);
    } catch (err){
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }

})

export default router;