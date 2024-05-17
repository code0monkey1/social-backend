/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { makeUserService } from "../factories/services/user-service-factory";
import { SelfController } from "../controllers/self/SelfController";

const route = Router();
const userService = makeUserService();

const selfController = new SelfController(userService);

route.get("/", authenticate, selfController.self);

route.get(
    "/avatar",
    authenticate,
    selfController.avatar,
    selfController.defaultAvatar,
);

export default route;
