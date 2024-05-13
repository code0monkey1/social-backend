import { Config } from "../../config";
import { RefreshTokenRepository } from "../../repositories/RefreshTokenRepository";
import { JWTService } from "../../services/JwtService";
import { TokenService } from "../../services/TokenService";

export const makeTokenService = () => {
    const jwtService = new JWTService(Config.JWT_SECRET!);
    const refreshTokenRepository = new RefreshTokenRepository();

    return new TokenService(jwtService, refreshTokenRepository);
};
