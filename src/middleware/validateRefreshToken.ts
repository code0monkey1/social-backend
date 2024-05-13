import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import logger from "../config/logger";
import { AuthCookie } from "./types";
import { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import { RefreshTokenPayload } from "./parseRefreshToken";

export default expressjwt({
    secret: Config.JWT_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;

        return refreshToken;
    },
    async isRevoked(_req: Request, token) {
        try {
            // see if the refreshToken with given Id is present
            const refreshTokenRepo = new RefreshTokenRepository();
            // find if refreshToken reference , with userId is in db
            const refreshToken =
                await refreshTokenRepo.findByRefreshIdAndUserId(
                    (token?.payload as RefreshTokenPayload).refreshTokenId,
                    (token?.payload as RefreshTokenPayload).userId,
                );

            // if refreshToken is found in the db  , send false , else send true
            return refreshToken === null;
        } catch (e) {
            const message = e instanceof Error ? e.message : "";
            logger.error(
                `Error while retrieving the refresh token : ${message}`,
                {
                    refreshTokenId: (token?.payload as RefreshTokenPayload)
                        .refreshTokenId,
                },
            );
        }
        // default , isRevoked is true
        return true;
    },
});
