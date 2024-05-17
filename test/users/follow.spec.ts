import supertest from "supertest";
import app from "../../src/app";

const api = supertest(app);

const BASE_URL = "/users/follow";

describe("PUT /users/follow", () => {
    it("should return json response ", async () => {
        await api.put(BASE_URL).expect("Content-Type", /json/);
    });
});
