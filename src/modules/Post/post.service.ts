import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


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
        where : {
            id : authorId,
            status : "ACTIVE"
        },
        select : {
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
        include : {
            _count : {
                select : {
                    comments : true
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
        data : result,
        total : totalCount
    };
}

export const postService = {
    createPost,
    getPost,
    getPostById,
    getMyPosts
}