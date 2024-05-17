/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { hasAuthorization } from "../middleware/hasAuthorization";
import multer from "multer";
import { makeUserController } from "../factories/controllers/user/user-controller-factory";
import { parseImage } from "../middleware/parseImage";

const route = Router();

const userController = makeUserController();

const upload = multer({ dest: "uploads/" });

// const userService = makeUserService();

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

route.put("/:userId/follow", authenticate, userController.follow);

export default route;
