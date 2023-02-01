import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// routes import
import authRoutes from "./routes/authRoutes.js";
import batchesRoutes from "./routes/batchesRoutes.js";
import studentsRoutes from "./routes/studentRoutes.js";
import feeRoutes from "./routes/feesRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// import middlewares
import databaseConfig from "./config/db.js";

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//ORIGIN CONFIG
const corsOptions = {
  origin: [
    "http://localhost:4000",
    "http://localhost:3000", 
    "https://www.sistfms.me" , 
    "https://sistfms.me", 
    "https://api.sistfms.me", 
    "https://cbtutorial.com", 
    "https://www.cbtutorial.com"],
  credentials: true,
};

//CORS MIDDLEWARE
app.use(cors(corsOptions));

// ROUTES
app.use("/api/", databaseConfig, authRoutes);
app.use("/api/stats" , databaseConfig, statsRoutes);
app.use("/api/batches", databaseConfig, batchesRoutes);
app.use("/api/students", databaseConfig, studentsRoutes);
app.use("/api/fees", databaseConfig, feeRoutes);
app.use("/api/departments", databaseConfig, departmentRoutes);
app.use("/api/payments", databaseConfig, paymentRoutes);

app.use(express.static(path.join(__dirname, "build")));
// app.use(express.static("build"));
app.get("*", (req, res) => res.sendFile(path.resolve(__dirname, "build", "index.html")));

export default app;
