import express from 'express';
import { commentController } from './comment.controller';
import auth, { UserRoles } from '../../middlewares/auth';

const router =express.Router()

router.post("/", 
    auth(UserRoles.USER, UserRoles.ADMIN),
    commentController.createComment
)


router.get("/:commentId",
    auth(UserRoles.USER, UserRoles.ADMIN),
    commentController.getCommentsById
)

router.get("/author/:authorId",
    auth(UserRoles.USER, UserRoles.ADMIN),
    commentController.getCommentsByAuthorId
)
router.delete("/:commentId",
    auth(UserRoles.USER, UserRoles.ADMIN),
    commentController.deleteComment
)
router.patch("/:commentId",
    auth(UserRoles.USER, UserRoles.ADMIN),
    commentController.updateComment
)

router.patch("/:commentId/moderate",
    auth(UserRoles.ADMIN),
    commentController.moderateComment
)





export const commentRouter = router;