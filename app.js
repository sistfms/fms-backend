import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// routes import
import authRoutes from "./routes/authRoutes.js";
import batchesRoutes from "./routes/batchesRoutes.js";

// import middlewares
import databaseConfig from "./config/db.js";

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//ORIGIN CONFIG
const corsOptions = {
  origin: ["http://localhost:4000", "https://sistfms.me", "https://api.sistfms.me", "http://www.sistfms.me" , "http://localhost:3000", "https://goldfish-app-ppmo4.ondigitalocean.app"],
  credentials: true,
};

//CORS MIDDLEWARE
app.use(cors(corsOptions));

// ROUTES
app.use("/", databaseConfig, authRoutes);
app.use("/batches", databaseConfig, batchesRoutes);

app.get("/", (req, res) => res.send(`BACKEND SERVER IS RUNNING`));

export default app;
