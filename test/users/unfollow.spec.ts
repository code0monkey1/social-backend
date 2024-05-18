import { db } from "./../../src/utils/db";
import {
    addFollower,
    addFollowing,
    clearDb,
    createAccessToken,
    createUser,
    deletedUserId,
    getUserById,
    userData,
} from "./../testHelpers/index";
import supertest from "supertest";
import app from "../../src/app";

const api = supertest(app);

describe("/users/:userId/unfollow", () => {
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
        it("should return a json response", async () => {
            await api.patch("/users/1/unfollow").expect("Content-Type", /json/);
        });

        it("should remove the followed userId from the following list", async () => {
            const user = await createUser(userData);

            const followedUser = await createUser({
                ...userData,
                email: "followed_user@gmail.com",
            });

            await addFollowing(user, followedUser);

            const accessToken = await createAccessToken(user);

            await api
                .patch(`/users/${followedUser._id.toString()}/unfollow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            const modifiedUser = await getUserById(user._id.toString());

            expect(
                modifiedUser.following?.map((f) => f.toString()),
            ).not.toContain(followedUser._id.toString());
        });
        it("should remove the userId from the followers list of the followed user", async () => {
            const user = await createUser(userData);

            const followedUser = await createUser({
                ...userData,
                email: "followed_user@gmail.com",
            });

            await addFollower(user, followedUser);

            const accessToken = await createAccessToken(user);

            expect(followedUser.followers?.map((f) => f.toString())).toContain(
                user._id.toString(),
            );

            await api
                .patch(`/users/${followedUser._id.toString()}/unfollow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            const modifiedFollowedUser = await getUserById(
                followedUser._id.toString(),
            );

            expect(
                modifiedFollowedUser.followers?.map((f) => f.toString()),
            ).not.toContain(user._id.toString());
        });
    });

    describe("unhappy path", () => {
        it("should return 401 in case auth token is not provided", async () => {
            await api.patch("/users/1/unfollow").expect(401);
        });

        it("should return 404 , if the user being unfollowed does not exist", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);

            await api
                .patch(`/users/${deletedUserId}/unfollow`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });
});
