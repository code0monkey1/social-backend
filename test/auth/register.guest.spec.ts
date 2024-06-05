import bcrypt from "bcrypt";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/utils/db";

import { userData, getUserById } from "../testHelpers";
const api = supertest(app);
const BASE_URL = "/auth/register/guest";

describe("POST /auth/register/guest", () => {
    beforeAll(async () => {
        await db.connect();
    });

    beforeEach(async () => {
        // delete all users created
        await db.clear();
    });
    afterAll(async () => {
        // disconnect db
        await db.disconnect();
    });

    it("should register a new user with name same as password , and email to be name@guest_email.com", async () => {
        const response = await api.post(BASE_URL).send({}).expect(201);

        const user = await getUserById(response.body);

        expect(user.role).toBe("guest");

        // the name is the password
        expect(bcrypt.compare(userData.name, user.hashedPassword)).toBeTruthy();

        expect(user.email).toBe(`${user.name}@guest_email.com`);
    });

    it("should delete guest user data after 24 hours", async () => {
        await api.post(BASE_URL).send({}).expect(201);
    });
});
