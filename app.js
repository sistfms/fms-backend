import express from "express";

const app = express();

app.get("/", (req, res) => res.send(`BACKEND SERVER IS RUNNING ON PORT ${process.env.PORT}`));

export default app;
