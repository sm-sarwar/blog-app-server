import { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helper/paginationSortingHelper";
import { UserRoles } from "../../middlewares/auth";


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


        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query)

        const result = await postService.getPost({
            search: search as string,
            tags,
            isFeatured,
            status,
            authorId,
            page,
            limit,
            skip,
            sortBy,
            sortOrder
        });
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching posts",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            throw new Error("Post ID is required");
        }
        const result = await postService.getPostById(postId as string);
        res.status(200).json(result);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching post",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}


const createPost = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error)
    }
}


const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const result = await postService.getMyPosts(user.id);
        res.status(200).json(result);


    } catch (error) {
        res.status(500).json({
            message: "Error fetching my posts",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

const updateMyPosts = async (req: Request, res: Response) => {
    try {

        const user = req.user;

        const isAdmin = user?.role === "ADMIN"

        const { postId } = req.params
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        const result = await postService.updateMyPost(user.id, postId as string, req.body, isAdmin);
        res.status(200).json(result);


    } catch (error) {
        res.status(500).json({
            message: "Error updating my post",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}

const deleteMyPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        const isAdmin = user?.role === UserRoles.ADMIN

        if (!user) {
            throw new Error("Unauthorized");
        }



        const { postId } = req.params;

        const result = await postService.deleteMyPost(user.id as string, postId as string, isAdmin)
        res.status(200).json({
            message: "Post deleted successfully",
            data: result
        })

    } catch (error) {
        res.status(500).json({
            message: "Error deleting my post",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}


const getStats = async (req: Request, res: Response) => {
    try {

        const result = await postService.getStats()
        res.status(200).json({
            message: "Stats fetched successfully",
            data: result
        })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching stats",
            detail: error instanceof Error ? error.message : "Unknown error"
        })
    }
}



export const postController = {
    createPost,
    getPost,
    getPostById,
    getMyPosts,
    updateMyPosts,
    deleteMyPost,
    getStats
}