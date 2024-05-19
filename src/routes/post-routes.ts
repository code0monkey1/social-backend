/* eslint-disable @typescript-eslint/no-misused-promises */
import { PostService } from "./../services/PostService";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import postValidator from "../validators/post-validator";
import { hasAuthorization } from "../middleware/hasAuthorization";
import { PostController } from "../controllers/PostController";
import { PostRepository } from "../repositories/PostRepository";

const route = Router();

const postRepository = new PostRepository();
const postService = new PostService(postRepository);
const postController = new PostController(postService);

route.post(
    "/:userId/posts",
    authenticate,
    hasAuthorization,
    postValidator,
    postController.createPost,
);

export default route;
