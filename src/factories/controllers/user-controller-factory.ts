import { UserController } from "../../controllers/UserController";
import { makeTokenService } from "../services/token-service-factory";
import { makeUserService } from "../services/user-service-factory";

export const makeUserController = () => {
    const userService = makeUserService();
    const tokenService = makeTokenService();

    return new UserController(userService, tokenService);
};
