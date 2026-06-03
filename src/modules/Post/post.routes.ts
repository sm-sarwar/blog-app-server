import express from "express";
import { postController } from "./post.controller";
import auth, { UserRoles } from "../../middlewares/auth";
const router = express.Router();



router.get("/", postController.getPost)

router.get("/my-posts",
    auth(UserRoles.USER, UserRoles.ADMIN),
    postController.getMyPosts);

router.post("/",
    auth(UserRoles.USER, UserRoles.ADMIN),
    postController.createPost);

router.get("/:postId", postController.getPostById);

export const postRouter = router;