/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { makeAuthController } from "../factories/controllers/auth/auth-controller-factory";

import registerValidator from "../validators/register-validator";
import loginValidator from "../validators/login-validator";
import authenticate from "../middleware/authenticate";
import parseRefreshToken from "../middleware/parseRefreshToken";
import validateRefreshToken from "../middleware/validateRefreshToken";

const route = Router();

const authController = makeAuthController();

route.post("/register", registerValidator, authController.register);

route.post("/login", loginValidator, authController.login);

route.post("/logout", authenticate, parseRefreshToken, authController.logout);

route.get("/self", authenticate, authController.self);

route.post("/refresh", validateRefreshToken, authController.refresh);

export default route;
