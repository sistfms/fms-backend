import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

// routes import
import authRoutes from "./routes/authRoutes.js";
import batchesRoutes from "./routes/batchesRoutes.js";
import studentsRoutes from "./routes/studentRoutes.js";
import feeRoutes from "./routes/feesRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

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
app.use("/api/", databaseConfig, authRoutes);
app.use("/api/batches", databaseConfig, batchesRoutes);
app.use("/api/students", databaseConfig, studentsRoutes);
app.use("/api/fees", databaseConfig, feeRoutes);
app.use("/api/departments", databaseConfig, departmentRoutes);
app.use("/api/payments", databaseConfig, paymentRoutes);

app.get("/", (req, res) => res.send(`BACKEND SERVER IS RUNNING`));

export default app;
