import {
    DELETED_USER_ID,
    createAccessToken,
    createPost,
    createUser,
    findAllPosts,
    getPostById,
    userData,
} from "./../../testHelpers/index";
import { db } from "../../../src/utils/db";
import supertest from "supertest";
import app from "../../../src/app";

const api = supertest(app);
describe("PATCH posts/:postId", () => {
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
        it("should return json response", async () => {
            const userId = "1";
            const postId = "1";
            const BASE_URL = getBaseUrl(postId);

            await api
                .patch(BASE_URL)
                .send({
                    title: "test",
                    body: "test",
                })
                .expect("Content-Type", /json/);
        });

        it("should return 200 if post is created successfully updated", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();

            const post = await createPost({
                postedBy: userId,
                text: "original_text",
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            // set access token as cookie
            const response = await api
                .patch(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .send({ text: "updated_text" })
                .expect("Content-Type", /json/)
                .expect(200);

            expect(response.body.text).toBe("updated_text");
            expect(response.body.postedBy).toBe(userId);
        });
        //     //DONE: add  photo attribute
        it("should have photo attribute set to Buffer type ,if photo is provided", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();

            const post = await createPost({
                text: "original_text",
                postedBy: userId,
            });

            const postId = post._id.toString();
            const BASE_URL = getBaseUrl(postId);

            // set access token as cookie
            const response = await api
                .patch(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .field("text", "updated_text")
                .field("postedBy", userId)
                .attach("file", `${__dirname}/../test-data/test-pic.png`);

            expect(response.body.text).toBe("updated_text");
            expect(response.body.postedBy).toBe(userId);

            const savedUser = await getPostById(response.body.id);

            expect(savedUser?.photo?.data).toBeInstanceOf(Buffer); // Verify that the file was uploaded
            expect(savedUser?.photo?.contentType).toBe("image/png");
        });
    });

    describe("unhappy path", () => {
        it("should return 401 if accessToken is not provided as cookie in request", async () => {
            const userId = "1";
            const postId = "2";
            const BASE_URL = getBaseUrl(postId);

            await api.patch(BASE_URL).send({}).expect(401);
        });

        //     //DONE:'should return 400 "Invalid file type" when file uploaded for post is not a photo'
        it('should return 400 "Invalid file type" when file uploaded for post is not a photo', async () => {
            const user = await createUser(userData);
            const userId = user?._id.toString();
            const accessToken = await createAccessToken(user);

            const BASE_URL = getBaseUrl(userId);

            const result = await api
                .patch(`${BASE_URL}`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .attach("file", `${__dirname}/../test-data/fake-text-pic.png`)
                .expect(400);

            expect(result.body.errors[0].message).toBe("Invalid file type");
        }, 100000);

        it("should return status 413 , if file size is greater than 16mb", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();
            const BASE_URL = getBaseUrl(userId);

            // set access token as cookie
            const response = await api
                .patch(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .field("text", "hello")
                .field("postedBy", userId)
                .attach("file", `${__dirname}/../test-data/image-20mb.jpeg`)
                .expect(413);

            expect(response.body.errors[0].message).toBe("File too large");

            const posts = await findAllPosts();

            expect(posts.length).toBe(0);
        });

        it("should return status 403, if the user updating did not create the post ", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();

            const post = await createPost({
                postedBy: DELETED_USER_ID,
                text: "original_text",
            });
            const BASE_URL = getBaseUrl(post._id.toString());

            // set access token as cookie
            const response = await api
                .patch(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .send({
                    text: "test",
                })
                .expect(403);
            expect(response?.body?.errors[0]?.message).toBe(
                "user is unauthorized",
            );
        });

        it("should return status 400, if the text updated is less than 5 letters  ", async () => {
            const user = await createUser(userData);
            const accessToken = await createAccessToken(user);
            const userId = user._id.toString();

            const post = await createPost({
                postedBy: userId,
                text: "original_text",
            });

            const BASE_URL = getBaseUrl(post._id.toString());

            // set access token as cookie
            const response = await api
                .patch(BASE_URL)
                .set("Cookie", `accessToken=${accessToken}`)
                .send({
                    text: "ot",
                })
                .expect(400);

            expect(response?.body?.errors[0]?.msg).toBe(
                `Text should be at least 5 characters`,
            );
        });
    });
});

export const getBaseUrl = (postId: string) => {
    const BASE_URL = `/posts/${postId}`;
    return BASE_URL;
};
