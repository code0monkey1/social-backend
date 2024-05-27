/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUserController } from "./../factories/controllers/user-controller-factory";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { isUser } from "../middleware/isUser";
import multer from "multer";
import { parseImage } from "../middleware/parseImage";

const router = Router();

const userController = makeUserController();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 16 * 1024 * 1024, //16mb
    },
});

router.patch(
    "/:userId",
    authenticate,
    isUser,
    upload.single("file"),
    parseImage,
    userController.updateById,
);

router.get("/", authenticate, userController.findAll);

router.delete("/:userId", authenticate, isUser, userController.deleteById);

// follow routes

router.patch(
    "/:userId/follow",
    authenticate,
    userController.addFollowing,
    userController.addFollower,
);

router.patch(
    "/:userId/unfollow",
    authenticate,
    userController.removeFollowing,
    userController.removeFollower,
);

// user follow recommendations

router.get(
    "/:userId/recommendations",
    authenticate,
    userController.recommendations,
);

// user posts

router.get("/:userId/posts", authenticate, userController.getPosts);

// common middleware triggered at the start of all userId routes

router.param("userId", userController.findById);

export default router;
