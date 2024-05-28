/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import authenticate from "../middleware/authenticate";
import { makeSelfController } from "../factories/controllers/self-controller-factory";

const router = Router();

const selfController = makeSelfController();

router.get("/", authenticate, selfController.self);

export default router;
