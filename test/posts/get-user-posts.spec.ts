import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import {
    DELETED_USER_ID,
    createAccessToken,
    createUser,
    userData,
} from "../testHelpers";

const api = supertest(app);
describe("GET /users/:userId/posts", () => {
    beforeAll(async () => {
        await db.connect();
    });

    beforeEach(async () => {
        await db.clear();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {});

    describe("unhappy path", () => {
        it("should return 401 if auth token is missing", async () => {
            const savedUser = await createUser(userData);

            const userId = savedUser._id.toString();

            await api.get(`/users/${userId}/posts`).expect(401);
        });
        it("should return status 404 if user with given userId does not exist", async () => {
            const userId = DELETED_USER_ID;

            const accessToken = await createAccessToken({ _id: userId });

            await api
                .get(`/users/${userId}/posts`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });
});
