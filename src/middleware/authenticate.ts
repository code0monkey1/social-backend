import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import logger from "../config/logger";

export default expressjwt({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    secret: Config.JWT_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { accessToken } = req.cookies as AuthCookie;

        return accessToken;
    },
    onExpired: (req, err) => {
        logger.error("❌ The jwt token is expired");
        throw err;
    },
});

type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};
