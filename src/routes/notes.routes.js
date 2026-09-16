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
        return res.status(400).json({ error: "Note does not exist!!" });
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


router.patch("/:id", verifyToken, async (req, res) => {

    const { id } = req.params;  
    const { title, context } = req.body;
    const updateField = [];
    const valueField = [];
    if(title){
       updateField.push(`title = $${updateField.length + 1}`); //append the value "title = $1" to the array
       valueField.push(title); // add the value of the title
    }
    if(context){
        updateField.push(`context = $${updateField.length + 1}`);
        valueField.push(context);
    }

    
    if (updateField.length === 0) {
        return res.status(400).json({ error: "No fields provided to update" });

    }
    try {
        const userID = req.user.id;  
        valueField.push(id);
        valueField.push(userID);

        const setName_SQL = updateField.join(', '); // will join the array into a single string

        const userIdPlaceholder = `$${valueField.length}`; 
        const idPlaceholder = `$${valueField.length - 1}`; 

        const $query = 
            `UPDATE notes SET ${setName_SQL} WHERE user_id = ${userIdPlaceholder} AND id = ${idPlaceholder} RETURNING *`;

        const patchUpdate = await dbpool.query($query, valueField);

        if(patchUpdate.rows.length === 0){
            return res.status(404).json({ error: "Note not found" });
        }
        
        res.json(patchUpdate.rows[0]);
        console.log("Succefully Updated!!")
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error!" });
    }
})

router.get('/', verifyToken, async (req, res) => {


    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);  // nothing goes bug even if input is negative
    const maxLimit = Math.max(1, parseInt(limit, 10) || 10);

    const limitNum = Math.min(maxLimit, 100);

    const offset = (pageNum - 1) * limitNum;

    try {
        const userID = req.user.id;

        const getNotes = await dbpool.query(
            'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3', [userID, offset, limitNum]);
            
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