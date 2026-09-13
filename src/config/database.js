import dotenv from 'dotenv'; 
import { Pool } from 'pg';

dotenv.config();


const dbpool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

dbpool.connect()
    .then(client => {
        console.log("Connected to postgres!")
        client.release();
    })
    .catch(err => console.error('Connection error:', err.stack));

export default dbpool;
