/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { makeAuthController } from "../factories/controllers/auth-controller-factory";
import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";
import authenticate from "../middleware/authenticate";
import parseRefreshToken from "../middleware/parseRefreshToken";
import validateRefreshToken from "../middleware/validateRefreshToken";

const router = Router();

const authController = makeAuthController();

router.post("/register", registerValidator, authController.register);

// guest route

router.post("/login", loginValidator, authController.login);

router.post("/logout", authenticate, parseRefreshToken, authController.logout);

router.post("/refresh", validateRefreshToken, authController.refresh);

export default router;
