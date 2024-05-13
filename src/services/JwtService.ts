import jwt from "jsonwebtoken";
import { JWTGenerator, JwtPayload } from "../interfaces/jwt/JWTGenerator";
import { JWTVerifier } from "../interfaces/jwt/JWTVerifier";

export class JWTService implements JWTGenerator, JWTVerifier {
    constructor(private readonly secret: string) {}

    generate(payload: JwtPayload): string {
        return jwt.sign(payload, this.secret);
    }

    verify(token: string): string | null {
        try {
            return jwt.verify(token, this.secret) as string;
        } catch (error) {
            return null;
        }
    }
}
