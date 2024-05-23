import { postUpdateValidator } from "./../validators/post-update-validator";
/* eslint-disable @typescript-eslint/no-misused-promises */
import { PostService } from "./../services/PostService";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { postValidator } from "../validators/post-validator";
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
    "/",
    authenticate,
    upload.single("file"),
    parseImage,
    postValidator,
    postController.createPost,
);

route.patch(
    "/:postId",
    authenticate,
    upload.single("file"),
    parseImage,
    postUpdateValidator,
    hasPostMutationAuth,
    postController.updatePost,
);

route.delete(
    "/:postId",
    authenticate,
    hasPostMutationAuth,
    postController.deletePost,
);

route.get(
    "/:postId/photo",
    authenticate,
    hasPostMutationAuth,
    postController.deletePost,
);

export default route;
