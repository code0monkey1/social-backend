import logger from "../../config/logger";
import { AuthController } from "../../controllers/AuthController";
import { makeTokenService } from "../services/token-service-factory";
import { makeUserService } from "../services/user-service-factory";

export const makeAuthController = () => {
    const tokenService = makeTokenService();
    const userService = makeUserService();

    return new AuthController(tokenService, userService, logger);
};
