import { UserRepository } from "./../../src/repositories/UserRepository";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import RefreshToken from "../../src/models/refresh.token.model";
import User from "../../src/models/user.model";
import {
    createRefreshToken,
    createUser,
    persistRefreshToken,
    shouldBeDifferentRefreshTokens,
    shouldHaveValidTokensInCookies,
} from "./helper";
import { RefreshTokenRepository } from "../../src/repositories/RefreshTokenRepository";

const api = supertest(app);
const BASE_URL = "/auth/refresh";

describe("POST /auth/refresh", () => {
    afterEach(async () => {
        await User.deleteMany({});
        await RefreshToken.deleteMany({});
    });

    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json response ", async () => {
            await api.post(BASE_URL).expect("Content-Type", /json/);
        });
        it("should return a new accessToken and refreshToken", async () => {
            //create a user
            const user = {
                name: "test",
                email: "test@gmail",
                password: "testfhsr",
            };
            const savedUser = await createUser(user);

            //create a refresh token
            const prevRefreshToken = await createRefreshToken(
                savedUser._id.toString(),
            );
            //send refresh token
            const response = await api
                .post(BASE_URL)
                .set("Cookie", [`refreshToken=${prevRefreshToken}`])
                .expect(200);

            expect(shouldHaveValidTokensInCookies(response)).toBeTruthy();

            expect(
                shouldBeDifferentRefreshTokens(response, prevRefreshToken),
            ).toBeTruthy();
        });

        it("should delete the previous refreshToken", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "testfhsr",
            };
            const savedUser = await createUser(user);

            //create a refresh token
            const persistedRefreshToken = await persistRefreshToken(
                savedUser._id.toString(),
            );

            const refreshToken = await createRefreshToken(
                savedUser._id.toString(),
                persistedRefreshToken._id.toString(),
            );

            //send refresh token
            await api
                .post(BASE_URL)
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .expect(200);
            const refreshTokenRepository = new RefreshTokenRepository();

            const savedRefreshToken =
                await refreshTokenRepository.findByRefreshIdAndUserId(
                    persistedRefreshToken._id.toString(),
                    savedUser._id.toString(),
                );

            expect(savedRefreshToken).toBeNull();
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if refreshToken is not supplied in header", async () => {
            //send refresh token , but no auth token

            await api.post(BASE_URL).expect(401);
        });

        it("should return 401 status if refreshToken is not in db", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "testfhsr",
            };
            const savedUser = await createUser(user);
            const refreshToken = await createRefreshToken(
                savedUser._id.toString(),
            );

            //delete refresh token from db
            await RefreshToken.deleteMany();

            //attach deleted refresh token in cookie

            await api
                .post(BASE_URL)
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .expect(401);
        });

        it("should return 404 status if user with given refreshToken does not exist", async () => {
            const user = {
                name: "test",
                email: "test@gmail",
                password: "testfhsr",
            };
            const savedUser = await createUser(user);

            const refreshToken = await createRefreshToken(
                savedUser._id.toString(),
            );

            // delete user from db
            const userRepository = new UserRepository();
            await userRepository.deleteById(savedUser._id.toString());

            await api
                .post(BASE_URL)
                .set("Cookie", [`refreshToken=${refreshToken}`])
                .expect(404);
        });
    });
});
