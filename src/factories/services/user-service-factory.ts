import { UserRepository } from "../../repositories/UserRepository";
import { EncryptionService } from "../../services/EncryptionService";
import { UserService } from "../../services/UserService";

export const makeUserService = () => {
    const encryptionService = new EncryptionService();
    const userRepository = new UserRepository();
    return new UserService(encryptionService, userRepository);
};
