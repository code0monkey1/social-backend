import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";
import { accessToken, createUser, userData } from "../testHelpers";
const api = supertest(app);
const BASE_URL = "/users";

describe("GET /users", () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(async () => {
        await db.clear();
    });

    describe("happy path", () => {
        it("should return json response", async () => {
            await api.get(BASE_URL).expect("Content-Type", /json/);
        });

        it("should return a list of users", async () => {
            //arrange
            //act

            await createUser(userData);

            //assert
            const users = await api
                .get(BASE_URL)
                .set("Cookie", [`accessToken=${accessToken}`])
                .expect(200);

            expect(users.body.length).toBe(1);

            expect(users.body[0].name).toBe(userData.name);
        });
    });

    describe("unhappy path", () => {
        it("should return 401 when auth not provided", async () => {
            await api.get(BASE_URL).expect(401);
        });
    });
});
