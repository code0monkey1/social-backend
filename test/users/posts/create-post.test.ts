import { db } from "../../../src/utils/db";
import supertest from "supertest";
import app from "../../../src/app";
let userId;
const BASE_URL = `/users/${userId}/posts`;
const api = supertest(app);
describe("POST /users/:userId/posts", () => {
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
            userId = 1;

            await api
                .post(BASE_URL)
                .send({
                    title: "test",
                    body: "test",
                })
                .expect("Content-Type", /json/);
        });
    });
});
