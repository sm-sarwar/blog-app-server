import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";


const getPost = async ({
    search,
    tags = [],
    isFeatured,
    status,
    authorId
}: {
    search?: string,
    tags?: string[],
    isFeatured : boolean | undefined,
    status : PostStatus | undefined,
    authorId: string | undefined
}) => {

    const searchCondition : PostWhereInput []= []

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

    if(status) {
        searchCondition.push({
            status
        })
    }

    if(authorId) {
        searchCondition.push({
            authorId
        })
    }

    const result = await prisma.post.findMany({
        where: {
            AND: searchCondition
        }
    });
    return result;
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


export const postService = {
    createPost,
    getPost
}