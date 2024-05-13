import jwt from "jsonwebtoken";
import { Config } from "../../src/config";
import { hash } from "bcrypt";
import { UserRepository } from "../../src/repositories/UserRepository";
import { RefreshTokenRepository } from "../../src/repositories/RefreshTokenRepository";
import { Response } from "supertest";
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

export async function createAccessToken(user: any) {
    return await jwt.sign(
        {
            userId: user._id.toString(),
        },
        Config.JWT_SECRET!,
        {
            expiresIn: "1h",
        },
    );
}

export async function createUser(user: any) {
    return await userRepository.create({
        ...user,
        hashedPassword: await hash(user.password, 10),
    });
}

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
    const refreshTokenEntry = await refreshTokenRepository.createRefreshToken({
        user: userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    return refreshTokenEntry;
}

export async function shouldHaveValidTokensInCookies(response: Response) {
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

export async function shouldBeDifferentRefreshTokens(
    response: Response,
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
