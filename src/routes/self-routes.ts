/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { makeSelfController } from "../factories/controllers/self-controller-factory";

const route = Router();

const selfController = makeSelfController();

route.get("/", authenticate, selfController.self);

route.get(
    "/avatar",
    authenticate,
    selfController.avatar,
    selfController.defaultAvatar,
);

export default route;
