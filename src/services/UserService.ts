import createHttpError from "http-errors";
import { UserRepository } from "../repositories/UserRepository";
import { EncryptionService } from "./EncryptionService";
import { PhotoType, UserRoles, UserType } from "../models/user.model";
import { PopulatedUser } from "../controllers/UserController";
import { randomBytes } from "crypto";
export class UserService {
    constructor(
        private readonly encryptionService: EncryptionService,
        private readonly userRepository: UserRepository,
    ) {}

    async findById(id: string) {
        return await this.userRepository.findById(id);
    }

    async createUser(
        name: string,
        email: string,
        password: string,
        role: UserRoles,
    ) {
        const hashedPassword = await this.encryptionService.hash(password);

        const user = await this.userRepository.create({
            name,
            email,
            hashedPassword,
            role,
        });

        return user;
    }

    async deleteById(userId: string) {
        await this.userRepository.deleteById(userId);
    }

    async findAll() {
        return await this.userRepository.findAll();
    }

    async findByIdAndUpdate(
        userId: string,
        payload: Omit<Partial<UserType>, "password">,
    ) {
        const user = await this.userRepository.findByIdAndUpdate(
            userId,
            payload,
        );

        return user;
    }
    getGuestDetails() {
        const guest_name = randomBytes(4).toString("hex");
        const guest_email = `${guest_name}@guest_email.com`;
        const guest_password = guest_name;

        return { guest_name, guest_email, guest_password };
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
        const { avatar } = (await this.userRepository.findById(userId)) as {
            avatar: PhotoType;
        };

        return avatar;
    }

    async addFollowing(userId: string, followId: string) {
        await this.userRepository.addFollowing(userId, followId);
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

        await this.userRepository.addFollower(followId, userId);
    };

    removeFollowing = async (userId: string, followId: string) => {
        await this.userRepository.removeFollowing(userId, followId);
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

    getRecommendations = async (user: PopulatedUser) => {
        const followingUsers = user.following?.map((f) => f.id) as string[];

        followingUsers.push(user.id);

        const recommendedUsers =
            await this.userRepository.getUserRecommendations(followingUsers);

        return recommendedUsers;
    };

    getPosts = async (userId: string) => {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw createHttpError(404, `User with id ${userId} not found`);
        }
        return {};
    };
}
