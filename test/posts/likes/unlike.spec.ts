import supertest from "supertest";
import app from "../../../src/app";
import { db } from "../../../src/utils/db";
import {
    createAccessToken,
    createPost,
    createUser,
    deletePost,
    userData,
} from "../../testHelpers";
import Post from "../../../src/models/post.model";

const api = supertest(app);

describe("PUT /posts/:postId/unlike", () => {
    beforeAll(async () => {
        await db.connect();
    });
    beforeEach(async () => {
        await db.clear();
    });
    afterAll(async () => {
        await db.disconnect();
    });

    describe("happy path", () => {
        it("should return json data", async () => {
            const postId = "1";
            const BASE_URL = getBaseUrl(postId);

            await api.put(BASE_URL).expect("Content-Type", /json/);
        });

        it("should return status 200 and allow user to unlike a post", async () => {
            const user = await createUser(userData);

            const otherUser = await createUser({
                ...userData,
                email: "other_user@gmail.com",
            });

            const post = await createPost({
                postedBy: user._id.toString(),
                text: "original_text",
            });

            await Post.findByIdAndUpdate(
                post._id.toString(),
                { $addToSet: { likes: otherUser._id.toString() } },
                { new: true },
            );

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken(otherUser);

            const response = await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(response.body.likes.length).toBe(0);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const postId = "1";
            const BASE_URL = getBaseUrl(postId);

            await api.put(BASE_URL).expect(401);
        });

        it("should return 404 if post with given postId does not exist", async () => {
            const user = await createUser(userData);

            const post = await createPost({
                postedBy: user._id.toString(),
                text: "original_text",
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken(user);

            await deletePost(post._id.toString());

            await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
    });
});

const getBaseUrl = (postId: string) => {
    const BASE_URL = `/posts/${postId}/unlike`;
    return BASE_URL;
};
