/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUserController } from "./../factories/controllers/user-controller-factory";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { hasUserMutationAuth } from "../middleware/hasUserMutationAuth";
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

router.get(
    "/:userId",
    authenticate,
    hasUserMutationAuth,
    userController.findById,
);

router.patch(
    "/:userId",
    authenticate,
    hasUserMutationAuth,
    upload.single("file"),
    parseImage,
    userController.updateById,
);

router.get("/", authenticate, userController.findAll);

router.delete(
    "/:userId",
    authenticate,
    hasUserMutationAuth,
    userController.deleteById,
);

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

export default router;
