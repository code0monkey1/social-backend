import {
    createAccessToken,
    createUser,
    deleteUser,
    userData,
} from "../testHelpers";

import supertest from "supertest";
import { db } from "../../src/utils/db";
import app from "../../src/app";
const api = supertest(app);

const BASE_URL = "/users";
describe("GET /users/:userId", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        await db.clear();
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const userId = "1";
            await api.get(`${BASE_URL}/${userId}`).expect(401);
        });

        it("should return 401 if accessToken is invalid", async () => {
            const savedUser = await createUser(userData);

            await api
                .get(`${BASE_URL}/${savedUser._id.toString()}`)
                .set("Cookie", [`accessToken=234`])
                .expect(401);
        });

        it("should return 401 if accessToken is expired", async () => {
            const savedUser = await createUser(userData);

            const accessToken = createAccessToken(savedUser, 100);
            await api
                .get(`${BASE_URL}/${savedUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(401);
        });

        it("should return 404 when user does not exist", async () => {
            const createdUser = await createUser(userData);

            const accessToken = await createAccessToken(createdUser);

            await deleteUser(createdUser._id.toString());

            await api
                .get(`${BASE_URL}/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            const userId = "1";
            await api
                .get(`${BASE_URL}/${userId}`)
                .expect("Content-Type", /json/);
        });

        it("should return status 200 and get the user by userId in the request", async () => {
            const createdUser = await createUser(userData);

            const accessToken = await createAccessToken(createdUser);

            const response = await api
                .get(`${BASE_URL}/${createdUser._id.toString()}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(response.body.name).toBe(userData.name);
            expect(response.body.email).toBe(userData.email);
        });
    });
});
