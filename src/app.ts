import express from "express";
import { postRouter } from "./modules/Post/post.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"

const app = express();


app.use(cors({
    origin: process.env.APP_URL,
    credentials: true
}))

app.use(express.json());


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/posts", postRouter)

app.get ("/", (req, res)=>{
    res.send("Hello World Now I'm teaching Prisma!");
})

export default app;