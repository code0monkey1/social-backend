import supertest from "supertest";
import app from "../../src/app";
import {
    clearDb,
    createAccessToken,
    createUser,
    deleteUser,
    getUserById,
    userData,
} from "../testHelpers";
import { db } from "../../src/utils/db";
import User from "../../src/models/user.model";
const api = supertest(app);
const BASE_URL = "/users";

describe("PUT /users/:userId/follow", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterEach(async () => {
        await clearDb();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json response ", async () => {
            const userId = 12;
            await api
                .put(`${BASE_URL}/${userId}/follow`)
                .expect("Content-Type", /json/);
        });

        //DONE:should return 200 , with the followed users id, in the followed list
        it("should have the followed userId, in the FOLLOWED list", async () => {
            const user = await createUser(userData);
            const userToFollow = await createUser({
                ...userData,
                email: "secondUser@gmail.com",
            });

            const accessToken = await createAccessToken(user);

            await api
                .put(`${BASE_URL}/${userToFollow._id}/follow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            const savedUser = await getUserById(user._id.toString());

            const received = savedUser.following!;
            const expected = userToFollow._id;

            expect(received).toContainEqual(expected);

            expect(received.length).toBe(1);
        });

        //DONE: should have the userId, in the FOLLOWERS list of the followed user;
        it("should have the userId, in the FOLLOWERS list of the followed user", async () => {
            const user = await createUser(userData);
            const userToFollow = await createUser({
                ...userData,
                email: "secondUser@gmail.com",
            });

            const accessToken = await createAccessToken(user);

            await api
                .put(`${BASE_URL}/${userToFollow._id}/follow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            const followedUser = await getUserById(userToFollow._id.toString());
            const received = followedUser.followers!;
            const expected = user._id;

            expect(received).toContainEqual(expected);
        });

        //DONE : should not follow , if the the target user is already followed

        it("should not follow , if the user is already followed", async () => {
            const user = await createUser(userData);

            const userToFollow = await createUser({
                ...userData,
                email: "secondUser@gmail.com",
            });
            const accessToken = await createAccessToken(user);

            const savedUser = await User.findById(user._id.toString());

            savedUser!.following!.push(userToFollow._id.toString());

            await savedUser!.save();

            await api
                .put(`${BASE_URL}/${userToFollow._id}/follow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(200);

            expect(savedUser!.following).toHaveLength(1);
        });
    });

    describe("unhappy path", () => {
        //DONE:should return 401 unauthorized access,when no auth token
        it("should return 401 unauthorized access,when no auth token", async () => {
            const userToFollow = await createUser({
                ...userData,
                email: "secondUser@gmail.com",
            });

            await api
                .put(`${BASE_URL}/${userToFollow._id}/follow`)
                .expect("Content-Type", /json/)
                .expect(401);
        });

        //DONE:should return 404 , when user to follow does not exist
        it("should return 404 , when user to follow does not exist", async () => {
            const savedUser = await createUser(userData);

            const userToFollow = await createUser({
                ...userData,
                email: "secondUser@gmail.com",
            });

            await deleteUser(userToFollow._id.toString());

            const accessToken = await createAccessToken(savedUser);

            await api
                .put(`${BASE_URL}/${userToFollow._id.toString()}/follow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect("Content-Type", /json/)
                .expect(404);

            expect(savedUser.following).toHaveLength(0);
        });
    });
});
