import { Request, Response } from "express";
import { CommentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        req.body.authorId = user?.id;
        const result = await CommentService.createComment(req.body)
        res.status(201).json({
            success: true,
            data: result
        })

    } catch (error) {
        res.status(500).json({
            message: "Error creating comment",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

export const commentController = {
    createComment
}