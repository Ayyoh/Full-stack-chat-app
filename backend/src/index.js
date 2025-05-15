import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js'
import { connectDB } from './config/db.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './utils/socket.js'

import path from 'path';

dotenv.config();

const __dirname = path.resolve();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }))
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
      });
}

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
    connectDB();
    console.log(`Running on Port ${PORT}`);
});