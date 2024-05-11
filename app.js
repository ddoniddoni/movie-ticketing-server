import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import reserveRoutes from './api/reserve/reserveController.js';
import userRoutes from "./api/user/userController.js";
import moviesRoutes from "./api/movies/movieController.js";
import profileRoutes from "./api/mypage/myPageController.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/reservations', reserveRoutes);
app.use('/api/user', userRoutes);
app.use('/api', moviesRoutes);
app.use("/api/profile", profileRoutes)
dotenv.config();

const PORT = process.env.SERVER_PORT || 5000;

app.listen(PORT, (res) => {
    console.log(`running on port ${PORT}`);
})