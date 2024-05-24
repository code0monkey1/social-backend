import supertest from "supertest";
import app from "../../src/app";

const BASE_URL = "/posts";

const api = supertest(app);

describe("POST /posts/:postId", () => {
    it("should return json data", async () => {
        const postId = 1;

        await api.get(`${BASE_URL}/${postId}`).expect("Content-Type", /json/);
    });
});
