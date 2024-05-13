import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";

export default expressjwt({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    secret: Config.JWT_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;

        return refreshToken;
    },
});

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};
export type RefreshTokenPayload = {
    refreshTokenId: string;
    userId: string;
};
