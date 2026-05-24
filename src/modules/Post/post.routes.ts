import express from "express";
import { postController } from "./post.controller";
import auth, { UserRoles } from "../../middlewares/auth";
const router = express.Router();



router.get("/",postController.getPost)

router.post("/", 
    auth(UserRoles.USER,UserRoles.ADMIN), 
    postController.createPost);

export const postRouter = router;