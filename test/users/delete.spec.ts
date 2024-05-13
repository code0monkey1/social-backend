import { hash } from "bcrypt";
import supertest from "supertest";
import app from "../../src/app";
import { UserRepository } from "../../src/repositories/UserRepository";
const api = supertest(app);
const BASE_URL = "/users";
const userId = "663f0f5379ab100cdd57882e";
let userRepository: UserRepository;
let refreshTokenRepository: RefreshTokenRepository;
import User from "../../src/models/user.model";
import RefreshToken from "../../src/models/refresh.token.model";
import { db } from "../../src/utils/db";
import { Config } from "../../src/config";
import jwt from "jsonwebtoken";
import { RefreshTokenRepository } from "../../src/repositories/RefreshTokenRepository";

describe("DELETE /:userId", () => {
    beforeAll(async () => {
        userRepository = new UserRepository();
        refreshTokenRepository = new RefreshTokenRepository();
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });

    describe("happy path", () => {
        it("should return json response with status code 200", async () => {
            await api
                .delete(BASE_URL + `/${userId}`)
                .expect("Content-Type", /json/);
        });

        it("should delete the user from the database", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            const usersBefore = await userRepository.findAll();

            await api
                .delete(BASE_URL + `/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(204);

            const usersAfter = await userRepository.findAll();

            expect(usersAfter).toHaveLength(usersBefore.length - 1);
        });

        it("should delete associated user refreshTokens from the database", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            await persistRefreshToken(createdUser._id.toString());

            const tokensBefore =
                (await refreshTokenRepository.findAll()) as any;

            await api
                .delete(BASE_URL + `/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(204);

            expect(
                refreshTokensOfUserWereDeleted(
                    createdUser._id.toString(),
                    tokensBefore,
                ),
            ).toBeTruthy();
        });
    });

    describe("un-happy path", () => {
        it("should return 401 when auth not provided", async () => {
            await api.delete(BASE_URL + `/${userId}`).expect(401);
        });

        it("should return 401 when auth userId not authorized to delete user", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            await api
                .delete(BASE_URL + `/${userId}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(401);
        });

        it("should return 404 when user does not exist", async () => {
            const user = {
                name: "test",
                email: "test@gmail.com",
                password: "testfhsr",
            };

            const createdUser = await createUser(user);

            const accessToken = await createAccessToken(createdUser);

            await userRepository.deleteById(createdUser._id.toString());

            await api
                .delete(BASE_URL + `/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });
});

async function createUser(user: any) {
    return await userRepository.create({
        ...user,
        hashedPassword: await hash(user.password, 10),
    });
}

async function createAccessToken(user: any) {
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

async function persistRefreshToken(user: string, years_to_persist = 1) {
    //persist jwt  , should have user and expiry time
    const YEARS = 1000 * 60 * 60 * 24 * 365 * years_to_persist;

    return await refreshTokenRepository.createRefreshToken({
        user,
        expiresAt: new Date(Date.now() + YEARS),
    });
}

async function refreshTokensOfUserWereDeleted(
    userId: string,
    tokensBefore: [{ user: string }],
) {
    expect(tokensBefore).toHaveLength(1);
    expect(tokensBefore.some((token) => token.user.toString() == userId));

    const tokensAfter = await refreshTokenRepository.findAll();
    expect(tokensAfter.every((token) => token.user.toString() !== userId));

    expect(tokensAfter).toHaveLength(0);
}
