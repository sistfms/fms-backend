import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// routes import
import authRoutes from "./routes/authRoutes.js";

// import middlewares
import databaseConfig from "./config/db.js";

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//ORIGIN CONFIG
const corsOptions = {
  origin: ["http://localhost:4000", "https://sistfms.me"],
  credentials: true,
};

//CORS MIDDLEWARE
app.use(cors(corsOptions));

// ROUTES
app.use("/", databaseConfig, authRoutes);

app.get("/", (req, res) => res.send(`BACKEND SERVER IS RUNNING`));

export default app;
