import { UserRepository } from "../../src/repositories/UserRepository";
const userRepository = new UserRepository();
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import { Config } from "../../src/config";
import { RefreshTokenRepository } from "../../src/repositories/RefreshTokenRepository";
import RefreshToken from "../../src/models/refresh.token.model";
import User, { UserType } from "../../src/models/user.model";
const refreshTokenRepository = new RefreshTokenRepository();
import Post, { PostType } from "../../src/models/post.model";
export async function createUser(user: any) {
    return userRepository.create({
        ...user,
        hashedPassword: await hash(user.password, 10),
    });
}

export async function createAccessToken(user: any, ttlInMs = 1000 * 60 * 60) {
    return await jwt.sign(
        {
            userId: user._id.toString(),
        },
        Config.JWT_SECRET!,
        {
            expiresIn: ttlInMs,
        },
    );
}
export async function createPost(updateBody: Partial<PostType>) {
    const post = await Post.create(updateBody);
    return post;
}

export async function findAllPosts() {
    return await Post.find({});
}

export async function shouldBeDifferentRefreshTokens(
    response: any,
    prevRefreshToken: string,
) {
    interface Headers {
        ["set-cookie"]: string[];
    }
    let refreshToken = "";

    const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

    cookies.forEach((c) => {
        if (c.startsWith("refreshToken="))
            refreshToken = c.split(";")[0].split("=")[1];
    });

    expect(refreshToken).toBeTruthy();
    expect(prevRefreshToken).toBeTruthy();

    expect(refreshToken).not.toBe(prevRefreshToken);
}

export const isJwt = (token: string) => {
    // Regular expression to match the JWT token format
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    // Check if the token matches the JWT token format
    return jwtRegex.test(token);
};
export async function shouldHaveValidTokensInCookies(response: any) {
    interface Headers {
        ["set-cookie"]: string[];
    }

    let accessToken = "";
    let refreshToken = "";

    // assert
    expect(response.headers["set-cookie"]).toBeDefined();

    const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

    cookies.forEach((c) => {
        if (c.startsWith("accessToken="))
            accessToken = c.split(";")[0].split("=")[1];

        if (c.startsWith("refreshToken="))
            refreshToken = c.split(";")[0].split("=")[1];
    });

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    expect(isJwt(accessToken)).toBeTruthy();
    expect(isJwt(refreshToken)).toBeTruthy();
}

export const DELETED_USER_ID = "6647ba93ab53630b4aa7ee38";

export async function createRefreshToken(
    userId: string,
    refreshTokenId?: string,
) {
    const refreshTokenEntry = await refreshTokenRepository.createRefreshToken({
        user: userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    const refreshToken = jwt.sign(
        {
            userId,
            refreshTokenId: refreshTokenId || refreshTokenEntry._id.toString(),
        },
        Config.JWT_SECRET!,
        {
            expiresIn: "1y",
        },
    );
    return refreshToken;
}

export async function persistRefreshToken(userId: string) {
    return await refreshTokenRepository.createRefreshToken({
        user: userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });
}

export async function deleteUser(userId: string) {
    return await User.findByIdAndDelete(userId);
}

export const accessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NjNmMGY1Mzc5YWIxMDBjZGQ1Nzg4MmUiLCJpYXQiOjE3MTU0MDg3MjN9.LvqCZLdhkKL9DqYFXZbJZlF9BWKMQ_MBIn7D3DM-Wt4";

export const userData = {
    name: "test",
    email: "test@gmail.com",
    password: "testing_right",
};

export async function getSavedRefreshToken(
    persistedRefreshToken: string,
    savedRefreshToken: string,
) {
    return await refreshTokenRepository.findByRefreshIdAndUserId(
        persistedRefreshToken,
        savedRefreshToken,
    );
}

export async function deleteRefreshTokens() {
    await RefreshToken.deleteMany({});
}

export async function getUserById(userId: string): Promise<UserType> {
    return (await User.findById(userId)) as UserType;
}

export async function getPostById(postId: string) {
    return await Post.findById(postId);
}

export async function getAllUsers() {
    return await User.find({});
}

export async function getAllRefreshTokens() {
    return await RefreshToken.find({});
}

export async function assertRefreshTokenWasDeleted(
    tokensBefore: any,
    tokensAfter: any,
) {
    expect(tokensBefore.length).toBe(1);
    expect(tokensAfter.length).toBe(0);
}

export async function assertIsUserPassword(
    plainPassword: string,
    hashedPassword: string,
) {
    expect(hashedPassword).toBeDefined();
    expect(await compare(plainPassword, hashedPassword)).toBeTruthy();
}

export async function updateUserAvatar(userId: string, avatar: any) {
    await User.findByIdAndUpdate(userId, { avatar });
}

export async function removeFollowing(userId: string, followingId: string) {
    const user = await User.findById(userId);

    const newFollowing = user?.following?.filter((f) => f !== followingId);

    user!.following = newFollowing;

    await user?.save();
}

export async function addFollowing(user: any, followedUser: any) {
    user.following = user.following?.concat(followedUser._id.toString());

    await user!.save();
}

export async function addFollower(user: any, followedUser: any) {
    followedUser.followers = followedUser?.followers?.concat(
        user._id.toString(),
    );

    await followedUser.save();
}
