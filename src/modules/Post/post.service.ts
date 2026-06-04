import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { UserRoles } from "../../middlewares/auth";


const getPost = async ({
    search,
    tags = [],
    isFeatured,
    status,
    authorId,
    page,
    limit,
    skip,
    sortBy,
    sortOrder
}: {
    search?: string,
    tags?: string[],
    isFeatured: boolean | undefined,
    status: PostStatus | undefined,
    authorId: string | undefined,
    page: number,
    limit: number,
    skip: number,
    sortBy: string
    sortOrder: string
}) => {

    const searchCondition: PostWhereInput[] = []

    if (search) {
        searchCondition.push(
            {
                OR: [
                    {
                        title: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        content: {
                            contains: search as string,
                            mode: "insensitive"
                        }
                    },
                    {
                        tags: {
                            has: search as string
                        }
                    }
                ]
            }
        )
    }


    if (tags.length > 0) {
        searchCondition.push(
            {
                tags: {
                    hasEvery: tags as string[]
                }
            }
        )
    }

    if (typeof isFeatured === "boolean") {
        searchCondition.push({
            isFeatured
        })
    }

    if (status) {
        searchCondition.push({
            status
        })
    }

    if (authorId) {
        searchCondition.push({
            authorId
        })
    }



    const result = await prisma.post.findMany({
        take: limit,
        skip,
        where: {
            AND: searchCondition
        },
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    const totalCount = await prisma.post.count({
        where: {
            AND: searchCondition
        }
    })

    return {
        data: result,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

const createPost = async (data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}

const getPostById = async (postId: string) => {

    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        })
        const postData = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    include: {
                        replies: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: {
                                createdAt: "asc"
                            },
                            include: {
                                replies: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: {
                                        createdAt: "asc"
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        })
        return postData;
    })
}


const getMyPosts = async (authorId: string) => {

    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId,
            status: "ACTIVE"
        },
        select: {
            id: true
        }
    })



    const result = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    comments: true
                }
            }
        }
    })

    const totalCount = await prisma.post.aggregate({

        where: {
            authorId
        },
        _count: {
            id: true
        }
    })
    return {
        data: result,
        total: totalCount
    };
}

const updateMyPost = async (authorId: string, postId: string, data: Partial<Post>, isAdmin: boolean) => {
    const postData = await prisma.post.findFirst({
        where: {
            id: postId
        }
    })

    if (!postData) {
        throw new Error("Post not found");
    }

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("Unauthorized");

    }

    if (!isAdmin) {
        delete data.isFeatured;
    }

    return await prisma.post.update({
        where: {
            id: postData.id
        },
        data
    })
}

const deleteMyPost = async (authorId: string, postId: string, isAdmin: boolean) => {
    const postData = await prisma.post.findFirstOrThrow({
        where: {
            id: postId
        },
        select: {
            id: true,
            authorId: true
        }
    })

    if (!isAdmin && (postData.authorId !== authorId)) {
        throw new Error("Unauthorized");
    }

    return await prisma.post.delete({
        where: {
            id: postData.id
        }
    })

}


const getStats = async () => {
    return await prisma.$transaction(async (tx) => {

        const [totalPosts, totalPublishedPosts, totalDraftPosts, totalArchivedPosts, totalComments, approvedComments, rejectedComments, totalUser, totalAdminCount, totalUserCount, totalViews] = await Promise.all([
            await tx.post.count(),
            await tx.post.count({ where: { status: PostStatus.PUBLISHED } }),
            await tx.post.count({ where: { status: PostStatus.DRAFT } }),
            await tx.post.count({ where: { status: PostStatus.ARCHIVED } }),
            await tx.comment.count(),
            await tx.comment.count({ where: { status: CommentStatus.APPROVED } }),
            await tx.comment.count({ where: { status: CommentStatus.REJECTED } }),
            await tx.user.count(),
            await tx.user.count({ where: { role: UserRoles.ADMIN } }),
            await tx.user.count({ where: { role: UserRoles.USER } }),
            await tx.post.aggregate({ _sum : { views: true}}).then(res => res._sum.views || 0)
        ])
        return {
            totalPosts,
            totalPublishedPosts,
            totalDraftPosts,
            totalArchivedPosts,
            totalComments,
            approvedComments,
            rejectedComments,
            totalUser,
            totalAdminCount,
            totalUserCount,
            totalViews
        }
    })
}

export const postService = {
    createPost,
    getPost,
    getPostById,
    getMyPosts,
    updateMyPost,
    deleteMyPost,
    getStats
}