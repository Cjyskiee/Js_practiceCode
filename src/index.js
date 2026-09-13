import 'dotenv/config';
import express from 'express';
import notesRoutes from "./routes/notes.routes.js";
import authRoutes from  "./routes/auth.Routes.js";


const app = express();

app.use(express.json());

app.use('/notes', notesRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.EXPRESS_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));