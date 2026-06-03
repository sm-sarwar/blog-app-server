import { CommentStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"

const createComment = async (payload: {
    content: string,
    authorId: string,
    postId: string,
    parentId?: string
}) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    if (payload.parentId) {
        await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        })
    }
    return await prisma.comment.create({
        data: payload
    })
}


const getCommentsById = async (commentId: string) => {
    return await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }

    })
}

const getCommentsByAuthorId = async (id: string) => {
    return await prisma.comment.findMany({
        where: {
            authorId: id
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })
}

const deleteComment = async (commentId: string, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Comment not found or you don't have permission to delete this comment")
    }

    return await prisma.comment.delete({
        where: {
            id: commentData.id
        }
    })

}


const updateComment = async (commentId: string, authorId: string, data: { content?: string, status?: CommentStatus }) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    })

    if (!commentData) {
        throw new Error("Comment not found or you don't have permission to update this comment")
    }

    return await prisma.comment.update({
        where: {
            id: commentData.id
        },
        data: data
    })
}


const moderateComment = async (commentId: string, data: { status: CommentStatus }) => {

    const commentData = await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        select: {
            id: true,
            status: true
        }
    })

    if (!commentData) {
        throw new Error("Comment not found")
    }

    if (commentData.status === data.status) {
        throw new Error(`Comment is already in ${data.status} status`)
    }

    return await prisma.comment.update({
        where: {
            id: commentId
        },
        data
    })
}


export const CommentService = {
    createComment,
    getCommentsById,
    getCommentsByAuthorId,
    deleteComment,
    updateComment,
    moderateComment
}