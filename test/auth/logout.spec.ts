import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import RefreshToken from "../../src/models/refresh.token.model";
import bcrypt from "bcrypt";
import { UserRepository } from "../../src/repositories/UserRepository";
import { RefreshTokenRepository } from "../../src/repositories/RefreshTokenRepository";
import jwt from "jsonwebtoken";
import { Config } from "../../src/config";

import User from "../../src/models/user.model";
const api = supertest(app);
const BASE_URL = "/auth/logout";
const userRepository = new UserRepository();
const refreshTokenRepository = new RefreshTokenRepository();

describe("POST /auth/logout", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterEach(async () => {
        // delete all users created
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });

    afterAll(async () => {
        // disconnect db
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return status json response", async () => {
            await api.post(BASE_URL).expect("Content-Type", /json/);
        });

        it("should delete refreshToken reference of the current user from the database", async () => {
            //arrange
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testing_right",
            };
            const hashedPassword = await bcrypt.hash(user.password, 10);

            const newUser = await userRepository.create({
                name: user.name,
                email: user.email,
                hashedPassword,
            });

            // save the userId in the database
            const userId = newUser._id.toString();

            const accessToken = jwt.sign({ userId }, Config.JWT_SECRET!, {
                expiresIn: "1h",
            });
            // create a refresh token entry to be saved

            const refreshToken = await createRefreshToken(userId);

            const refreshTokensBefore = await refreshTokenRepository.findAll();

            await api
                .post(BASE_URL)
                .set("Cookie", [
                    `accessToken=${accessToken}; refreshToken=${refreshToken};`,
                ])
                .expect(200);

            const refreshTokensAfter = await refreshTokenRepository.findAll();

            assertRefreshTokenWasDeleted(
                refreshTokensBefore,
                refreshTokensAfter,
            );
        });
    });

    describe("unhappy path", () => {
        it("should return 401 unauthorized , in case an token is not supplied", async () => {
            //send refresh token
            await api.post(BASE_URL).expect(401);
        });
    });
});

async function createRefreshToken(userId: string) {
    const refreshTokenEntry = await refreshTokenRepository.createRefreshToken({
        user: userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    const refreshToken = jwt.sign(
        { userId, refreshTokenId: refreshTokenEntry._id.toString() },
        Config.JWT_SECRET!,
        {
            expiresIn: "1y",
        },
    );
    return refreshToken;
}

async function assertRefreshTokenWasDeleted(
    tokensBefore: any,
    tokensAfter: any,
) {
    expect(tokensBefore.length).toBe(1);
    expect(tokensAfter.length).toBe(0);
}
