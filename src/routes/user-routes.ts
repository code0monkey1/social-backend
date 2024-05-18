/* eslint-disable @typescript-eslint/no-misused-promises */
import { makeUserController } from "./../factories/controllers/user-controller-factory";
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { hasAuthorization } from "../middleware/hasAuthorization";
import multer from "multer";
import { parseImage } from "../middleware/parseImage";

const route = Router();

const userController = makeUserController();

const upload = multer({ dest: "uploads/" });

route.get("/:userId", authenticate, hasAuthorization, userController.findById);

route.patch(
    "/:userId",
    authenticate,
    hasAuthorization,
    upload.single("file"),
    parseImage,
    userController.updateById,
);

route.get("/", authenticate, userController.findAll);

route.delete(
    "/:userId",
    authenticate,
    hasAuthorization,
    userController.deleteById,
);

route.patch(
    "/:userId/follow",
    authenticate,
    userController.addFollowing,
    userController.addFollower,
);

route.patch(
    "/:userId/unfollow",
    authenticate,
    userController.removeFollowing,
    userController.removeFollower,
);

export default route;
