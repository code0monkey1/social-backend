import { postUpdateValidator } from "./../validators/post-update-validator";
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PostService } from "./../services/PostService";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { postValidator } from "../validators/post-validator";
import { hasAuthorization } from "../middleware/hasAuthorization";
import { PostController } from "../controllers/PostController";
import { PostRepository } from "../repositories/PostRepository";
import multer from "multer";
import { parseImage } from "../middleware/parseImage";
import { hasPostMutationAuth } from "../middleware/hasPostMutationAuth";

const route = Router();
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 16 * 1024 * 1024, //16mb
    },
});

const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

route.post(
    "/:userId/posts",
    authenticate,
    hasAuthorization,
    upload.single("file"),
    parseImage,
    postValidator,
    postController.createPost,
);

route.patch(
    "/:userId/posts/:postId",
    authenticate,
    hasAuthorization,
    upload.single("file"),
    parseImage,
    postUpdateValidator,
    hasPostMutationAuth,
    postController.updatePost,
);

route.delete(
    "/:userId/posts/:postId",
    authenticate,
    hasAuthorization,
    hasPostMutationAuth,
    postController.deletePost,
);

export default route;
