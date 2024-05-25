import supertest from "supertest";
import app from "../../../src/app";
import { db } from "../../../src/utils/db";
import {
    createUser,
    userData,
    createPost,
    deletePost,
    createAccessToken,
    DELETED_USER_ID,
} from "../../testHelpers";
import Post from "../../../src/models/post.model";

const api = supertest(app);

describe("PUT /posts/:postId/uncomment", () => {
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
        // should return json data

        it("should return json response", async () => {
            await api.put(getBaseUrl("1")).expect("Content-Type", /json/);
        });

        it("should remove the comment from the post", async () => {
            const user = await createUser(userData);

            const post = await createPost({
                text: "original_text",
                postedBy: user._id.toString(),
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken(user);

            const comment = {
                text: "my first comment",
                postedBy: user._id.toString(),
            };

            const savedPost = await Post.findByIdAndUpdate(
                post._id.toString(),
                { $push: { comments: comment } },
                { new: true },
            );

            expect(savedPost?.comments.length).toBe(1);
            expect(savedPost?.comments[0].text).toBe(comment.text);

            const response = await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    commentId: savedPost?.comments[0]._id.toString(),
                })
                .expect(200);

            expect(
                response.body.comments.some(
                    (c: any) =>
                        c._id.toString() ===
                        savedPost?.comments[0]._id.toString(),
                ),
            ).toBeFalsy();
            expect(response.body.comments.length).toBe(0);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if no accessToken is provided", async () => {
            const BASE_URL = getBaseUrl("1");

            await api.put(BASE_URL).expect(401);
        });
        it("should return 404 if post with given postId does not exist", async () => {
            const user = await createUser(userData);

            const post = await createPost({
                text: "original_text",
                postedBy: user._id.toString(),
            });

            await deletePost(post._id.toString());

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken(user);

            await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(404);
        });
        it("should return 403 if user is not authorized to delete comment", async () => {
            const user = await createUser(userData);

            const post = await createPost({
                text: "original_text",
                postedBy: user._id.toString(),
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken(user);

            const comment = {
                text: "my first comment",
                postedBy: DELETED_USER_ID,
            };

            const savedComment = await Post.findByIdAndUpdate(
                post._id.toString(),
                { $push: { comments: comment } },
                { new: true },
            );

            await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    commentId: savedComment?.comments[0]._id.toString(),
                })
                .expect(403);
        });
        it("should return 404 if comment with given commentId does not exist", async () => {
            const user = await createUser(userData);

            const post = await createPost({
                text: "original_text",
                postedBy: user._id.toString(),
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            const accessToken = await createAccessToken({
                _id: DELETED_USER_ID,
            });

            await api
                .put(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send({
                    commentId: DELETED_USER_ID,
                })
                .expect(404);
        });
    });
});

const getBaseUrl = (postId: string) => {
    const BASE_URL = `/posts/${postId}/uncomment`;
    return BASE_URL;
};
