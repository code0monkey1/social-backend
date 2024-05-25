import { postUpdateValidator } from "./../validators/post-update-validator";
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PostService } from "./../services/PostService";
import { NextFunction, Response, Router, Request } from "express";
import authenticate from "../middleware/authenticate";
import { postValidator } from "../validators/post-validator";
import { PostController } from "../controllers/PostController";
import { PostRepository } from "../repositories/PostRepository";
import multer from "multer";
import { parseImage } from "../middleware/parseImage";
import { hasPostMutationAuth } from "../middleware/hasPostMutationAuth";
import { commentValidator } from "../validators/comment-validator";

const router = Router();
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 16 * 1024 * 1024, //16mb
    },
});

const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

router.post(
    "/",
    authenticate,
    upload.single("file"),
    parseImage,
    postValidator,
    postController.createPost,
);

router.patch(
    "/:postId",
    authenticate,
    upload.single("file"),
    parseImage,
    postUpdateValidator,
    hasPostMutationAuth,
    postController.updatePost,
);

router.delete(
    "/:postId",
    authenticate,
    hasPostMutationAuth,
    postController.deletePost,
);

router.get(
    "/:postId/photo",
    (req: Request, res: Response, next: NextFunction) => {
        try {
            res.json();
        } catch (e) {
            next(e);
        }
    },
);

//comments

router.put(
    "/:postId/comment",
    authenticate,
    commentValidator,
    postController.comment,
);

router.put("/:postId/uncomment", authenticate, postController.uncomment);

//likes

router.put("/:postId/like", authenticate, postController.like);

router.put("/:postId/unlike", authenticate, postController.unlike);

export default router;
