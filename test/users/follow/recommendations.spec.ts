import { addFollowing, createAccessToken } from "../../testHelpers/index";
import { db } from "../../../src/utils/db";
import request from "supertest";
import { createUser, userData } from "../../testHelpers";
import app from "../../../src/app";
const api = request(app);
let userId;
const BASE_URL = `/users/${userId}/recommendations`;

describe("GET /users/:userId/recommendations", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterEach(async () => {
        await db.clear();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            userId = 1;
            await api.get(BASE_URL).expect("Content-Type", /json/);
        });

        it("should return a list of recommendations that are not in the following list", async () => {
            const user = await createUser(userData);

            const followingUser = await createUser({
                ...userData,
                email: "following_user@gmail.com",
            });

            const anotherUser = await createUser({
                ...userData,
                email: "another_user@gmail.com",
            });

            const accessToken = await createAccessToken(user);

            addFollowing(user, followingUser);
            userId = user._id.toString();

            expect(user.following?.map((f) => f.toString())).toContain(
                followingUser._id.toString(),
            );

            const response = await api
                .get(`${BASE_URL}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body.map((u: any) => u.id)).not.toContain(
                followingUser._id.toString(),
            );
            expect(response.body.map((u: any) => u.id)).toContain(
                anotherUser._id.toString(),
            );
            expect(response.body.length).toBe(1);
        });

        it("should not include the user in the recommendations list ", async () => {
            const user = await createUser(userData);

            const followingUser = await createUser({
                ...userData,
                email: "following_user@gmail.com",
            });

            await createUser({
                ...userData,
                email: "another_user@gmail.com",
            });

            const accessToken = await createAccessToken(user);

            addFollowing(user, followingUser);
            userId = user._id.toString();

            expect(user.following?.map((f) => f.toString())).toContain(
                followingUser._id.toString(),
            );

            const response = await api
                .get(`${BASE_URL}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body.map((u: any) => u.id)).not.toContain(
                user._id.toString(),
            );

            expect(response.body.map((u: any) => u.id)).not.toContain(
                followingUser._id.toString(),
            );
            expect(response.body.length).toBe(1);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const userId = 1;
            await api.get(`${BASE_URL}`).expect(401);
        });
    });
});
