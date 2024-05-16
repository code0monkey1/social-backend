import createHttpError from "http-errors";
import { UserRepository } from "../repositories/UserRepository";
import { EncryptionService } from "./EncryptionService";
import { PhotoType, UserType } from "../models/user.model";
import fs from "fs";

export class UserService {
    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly userRepository: UserRepository,
    ) {}

    async findByIdAndUpdateAvatar(
        userId: string,
        filePath: string,
        contentType: string,
    ) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        user.avatar = {
            data: filePath,
            contentType,
        } as unknown as PhotoType;

        //delete file
        fs.unlinkSync(filePath);

        const savedUser = await user.save();

        return savedUser;
    }
    async findUserById(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        const { email, name, about, _id } = user;

        return { email, name, about, _id };
    }

    async createUser(name: string, email: string, password: string) {
        const hashedPassword = await this.encryptionService.hash(password);

        const user = await this.userRepository.create({
            name,
            email,
            hashedPassword,
        });

        return user;
    }

    async deleteById(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        await this.userRepository.deleteById(userId);
    }

    async findAll() {
        const users = await this.userRepository.findAll();
        return users.map((user: UserType) => {
            return {
                name: user.name,
            };
        });
    }

    async findById(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }
        return user;
    }

    async findByIdAndUpdate(
        userId: string,
        payload: Omit<Partial<UserType>, "password">,
    ) {
        const user = await this.userRepository.update(userId, payload);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }
        return user;
    }

    async findByEmailAndPassword(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);

        const validUser =
            user &&
            (await this.encryptionService.compare(
                password,
                user?.hashedPassword,
            ));

        if (!validUser) {
            const error = createHttpError(400, "Email or Password Invalid");
            throw error;
        }

        return user;
    }

    async getUserAvatar(userId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        const { avatar } = (await this.userRepository.findById(userId)) as {
            avatar: PhotoType;
        };

        return avatar;
    }
}
