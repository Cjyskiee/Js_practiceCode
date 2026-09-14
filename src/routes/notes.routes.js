import express from 'express';
import dbpool from '../config/database.js';
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
    console.log('Headers:', req.headers['content-type']);
    console.log('Body:', req.body);

    const { title, context } = req.body;
    if(!title){
        return res.status(400).json({ error: 'Title is required!!'});
    }

    try {
        const userID = req.user.id;
        const postNote = await dbpool.query(
            'INSERT INTO notes (title, context, user_id) VALUES ($1, $2, $3) RETURNING *', [title, context, userID]
        );
        console.log(`Succefully created Note ${title}`);
        res.status(201).json(postNote.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }

})

router.put('/:id', verifyToken, async (req, res) => {

    const{ id } = req.params;
    const{ title, context } = req.body;
    if (!id){
        return res.status(400).json({ error: "Id does not exist!!" });
    }

    try {
        const userID = req.user.id;
        const putUpdate = await dbpool.query(
            'UPDATE notes SET title = $1, context = $2 WHERE user_id = $3 AND id = $4 RETURNING *', [title, context, userID, id]
        );
        if (putUpdate.rows.length === 0) {
            return res.status(404).json({error: "Note not found."});
        }
        res.json(putUpdate.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get('/', verifyToken, async (req, res) => {

    try {
        const userID = req.user.id;
        const getNotes = await dbpool.query(
            'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC', [userID]);
            res.json(getNotes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }

});

router.get('/:id', verifyToken,  async (req, res) => {

    const { id } = req.params;

    try {
        const userID = req.user.id;
         const getNoteId =  await dbpool.query(
            'SELECT * FROM notes WHERE user_id = $1 AND id = $2', [userID, id]
        );
        if (getNoteId.rows.length === 0){
            return res.status(404).json({ error: "Note not found" });
        }
        res.json(getNoteId.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {

    const { id } = req.params;

    try {
        const userID = req.user.id;
        const deleteNote = await dbpool.query(
            'DELETE FROM notes WHERE user_id = $1 AND id = $2 RETURNING *', [userID, id]
        );
        if(deleteNote.rows.length === 0){
            return res.status(404).json({ error: "Note not found" });
        }
        res.json({ message: "Note Succefully Deleted", note : deleteNote.rows[0]});

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server Error" });
    }

});

export default router;