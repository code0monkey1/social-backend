/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { postUpdateValidator } from "./../validators/post-update-validator";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { postValidator } from "../validators/post-validator";
import multer from "multer";
import { parseImage } from "../middleware/parseImage";
import { isPoster } from "../middleware/isPoster";
import { commentValidator } from "../validators/comment-validator";
import { makePostController } from "../factories/controllers/post-controller-factory";
import { makeUserController } from "../factories/controllers/user-controller-factory";

const router = Router();
const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 16 * 1024 * 1024, //16mb
    },
});

const postController = makePostController();
const userController = makeUserController();

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
    isPoster,
    postController.updatePost,
);

router.delete("/:postId", authenticate, isPoster, postController.deletePost);

router.get("/:postId/photo", authenticate, postController.photo);

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

// user posts

router.get("/by/user/:userId", authenticate, postController.getUserPosts);

// user feed

router.get("/feed/user/:userId", authenticate, postController.getFeed);

// common middleware triggered at the start of all postId routes

router.param("postId", postController.getPostById);

router.param("userId", userController.findById);

export default router;
