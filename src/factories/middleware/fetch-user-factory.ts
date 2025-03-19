import { fetchUser } from "../../middleware/fetchUser";
import { UserRepository } from "../../repositories/UserRepository";
import { EncryptionService } from "../../services/EncryptionService";
import { UserService } from "../../services/UserService";

export const makeFetchUser = () => {
  const encriptionService = new EncryptionService();
  const userRepository = new UserRepository();
  const userService = new UserService(encriptionService, userRepository);

  return fetchUser(userService);
};
