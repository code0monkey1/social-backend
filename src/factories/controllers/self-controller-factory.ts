import logger from "../../config/logger";
import { SelfController } from "../../controllers/SelfController";
import { makeUserService } from "../services/user-service-factory";

export const makeSelfController = () => {
  const userService = makeUserService();

  return new SelfController(userService, logger);
};
