import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import {
    createAccessToken,
    createUser,
    deleteUser,
    userData,
} from "../testHelpers";
const api = supertest(app);
const BASE_URL = "/self";

describe("GET /self", () => {
    beforeEach(async () => {
        await db.clear();
    });
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should get the user by auth userId in the request", async () => {
            const savedUser = await createUser(userData);
            const accessToken = await createAccessToken(savedUser);

            const response = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(response.body.name).toBe(userData.name);
        });
        it("should return json response", async () => {
            await api.get(BASE_URL).expect("Content-Type", /json/);
        });
    });

    describe("sad path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            await api.get(BASE_URL).expect(401);
        });
        it("should return 404 when user does not exist", async () => {
            const createdUser = await createUser(userData);

            const accessToken = await createAccessToken(createdUser);

            await deleteUser(createdUser._id.toString());

            await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
        it("should return 401 if accessToken is invalid", async () => {
            const accessToken = "kjkjskjdkfj";

            await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(401);
        });

        it("should return 401 if accessToken is expired", async () => {
            const createdUser = await createUser(userData);
            const accessToken = await createAccessToken(createdUser, 1);

            await new Promise((resolve) => setTimeout(resolve, 1000));
            await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(401);
        });
    });
});
