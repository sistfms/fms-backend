import express from "express";

const app = express();

app.get("/", (req, res) => res.send(`BACKEND SERVER IS RUNNING`));

export default app;
