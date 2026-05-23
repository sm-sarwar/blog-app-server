import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";


const getPost = async (req: Request, res: Response) => {
    try {
        const { search } = req.query
        // console.log("Search value:", search)
        const tags = req.query.tags ? (req.query.tags as string).split(",") : []

        // console.log(tags)

        const isFeatured = req.query.isFeatured ?
            req.query.isFeatured === "true"
                ? true
                : req.query.isFeatured === "false"
                    ? false
                    : undefined
            : undefined;
        // console.log({isFeatured})

        const status = req.query.status as PostStatus | undefined
        // console.log(status)

        const authorId = req.query.authorId as string | undefined
        // console.log(authorId)

        const result = await postService.getPost({ search: search as string, tags, isFeatured, status, authorId });
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching posts",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}




const createPost = async (req: Request, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        // console.log(req.user);
        const result = await postService.createPost(req.body, req.user?.id);
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error creating post",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}


export const postController = {
    createPost,
    getPost
}