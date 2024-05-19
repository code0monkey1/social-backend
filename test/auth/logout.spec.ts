import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";

import {
    assertRefreshTokenWasDeleted,
    createAccessToken,
    createRefreshToken,
    createUser,
    getAllRefreshTokens,
    userData,
} from "../testHelpers";

const api = supertest(app);
const BASE_URL = "/auth/logout";

describe("POST /auth/logout", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterEach(async () => {
        // delete all users created
        await db.clear();
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
            const newUser = await createUser(userData);

            // save the userId in the database
            const userId = newUser._id.toString();

            const accessToken = await createAccessToken(newUser);
            // create a refresh token entry to be saved

            const refreshToken = await createRefreshToken(userId);

            const refreshTokensBefore = await getAllRefreshTokens();

            await api
                .post(BASE_URL)
                .set("Cookie", [
                    `accessToken=${accessToken}; refreshToken=${refreshToken};`,
                ])
                .expect(200);

            const refreshTokensAfter = await getAllRefreshTokens();

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
