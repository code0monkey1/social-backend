/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUserController } from "./../factories/controllers/user-controller-factory";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { hasAuthorization } from "../middleware/hasAuthorization";
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

router.get("/:userId", authenticate, hasAuthorization, userController.findById);

router.patch(
    "/:userId",
    authenticate,
    hasAuthorization,
    upload.single("file"),
    parseImage,
    userController.updateById,
);

router.get("/", authenticate, userController.findAll);

router.delete(
    "/:userId",
    authenticate,
    hasAuthorization,
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
