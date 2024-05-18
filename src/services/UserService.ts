import createHttpError from "http-errors";
import { UserRepository } from "../repositories/UserRepository";
import { EncryptionService } from "./EncryptionService";
import { PhotoType, UserType } from "../models/user.model";
import fs from "fs";
import logger from "../config/logger";

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

        fs.unlink(filePath, (err) => {
            if (err instanceof Error) {
                logger.error(err);
            }
            throw createHttpError(400, "Invalid file type");
        });

        const savedUser = await user.save();

        return savedUser;
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

        await user?.populate("followers", "_id name");

        await user?.populate("following", "_id name");

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
        const user = await this.userRepository.findByIdAndUpdate(
            userId,
            payload,
        );

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

    async addFollowing(userId: string, followId: string) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        if (!user.following) {
            user.following = [];
        }

        if (!user.following?.includes(followId)) {
            user.following?.push(followId);
        }

        await user.save();
    }

    addFollower = async (userId: string, followId: string) => {
        const userToFollow = await this.userRepository.findById(followId);

        if (!userToFollow) {
            const error = createHttpError(
                404,
                `User with ${userId} does not exist`,
            );
            throw error;
        }

        if (!userToFollow.followers) {
            userToFollow.followers = [];
        }

        if (!userToFollow.followers?.includes(userId)) {
            userToFollow.followers?.push(userId);
        }
        await userToFollow.save();
    };

    removeFollowing = async (userId: string, followId: string) => {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw createHttpError(404, `User with id ${userId} not found`);
        }

        const modifiedFollowers = user.following?.filter((f) => f != followId);

        user.following = modifiedFollowers;

        await user.save();
    };

    removeFollower = async (userId: string, followId: string) => {
        const followingUser = await this.userRepository.findById(followId);

        if (!followingUser) {
            throw createHttpError(404, `User with id ${followId} not found`);
        }

        followingUser.followers = followingUser.followers?.filter(
            (f) => f != userId,
        );

        await followingUser.save();
    };

    getRecommendations = async (userId: string) => {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw createHttpError(404, `User with id ${userId} not found`);
        }

        if (!user.following) {
            user.following = [];
        }

        const followingUsers = user.following?.concat(userId);

        const recommendedUsers =
            await this.userRepository.getUserRecommendations(followingUsers);

        return recommendedUsers;
    };
}
