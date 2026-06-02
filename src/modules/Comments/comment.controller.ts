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

const getCommentsById = async (req: Request, res: Response) =>{
    try {
        const {commentId} = req.params;
        const result = await CommentService.getCommentsById(commentId as string)
        res.status(200).json({
            success: true,
            data: result
        })

    } catch( error) {
        res.status (500).json ({
            message: "Error fetching comment",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}


const getCommentsByAuthorId = async (req: Request, res: Response) =>{
    try {
        const {authorId} = req.params;
        const result = await CommentService.getCommentsByAuthorId(authorId as string)
        res.status(200).json({
            success: true,
            data: result
        })

    } catch( error) {
        res.status (500).json ({
            message: "Error fetching comment",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

const deleteComment = async ( req: Request, res: Response) =>{
     try {

        const user = req.user;
        const {commentId} = req.params;

        const result = await CommentService.deleteComment(commentId as string, user?.id as string)
        res.status(200).json({
            success: true,
            data: result
        })

     } catch ( error) {
        res.status (500).json ({
            message: "Error deleting comment",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
     }
}

const updateComment = async ( req: Request, res: Response) =>{
     try {

        const user = req.user;
        const {commentId} = req.params;

        const result = await CommentService.updateComment(commentId as string, user?.id as string, req.body)
        res.status(200).json({
            success: true,
            data: result
        })

     } catch ( error) {
        res.status (500).json ({
            message: "Error updating comment",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
     }
}

export const commentController = {
    createComment,
    getCommentsById,
    getCommentsByAuthorId,
    deleteComment,
    updateComment
}