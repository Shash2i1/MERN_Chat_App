import {io, app, server} from "./lib/socket.js"
import express from "express"
import authRoute from "./routes/auth.route.js" 
import messageRoute from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors"
import path from "path"

dotenv.config({
    path: "./.env"
})
 
const __dirname = path.resolve();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded())

app.use(cookieParser())

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) =>{
        res.sendFile(path.join(__dirname, "../frontend","dist","index.html"))
    })
}

server.listen(process.env.PORT, () =>{
    console.log(`server is running on ${process.env.PORT}`);
    connectDB();
})