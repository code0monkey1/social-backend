/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { makeSelfController } from "../factories/controllers/self-controller-factory";
import { makeFetchUser } from "../factories/middleware/fetch-user-factory";

const router = Router();

const selfController = makeSelfController();
const fetchUser = makeFetchUser();

router.get("/", authenticate, fetchUser, selfController.self);

export default router;
