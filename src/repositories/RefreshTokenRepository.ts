import { RefreshTokenType } from "../models/refresh.token.model";
import RefreshToken from "../models/refresh.token.model";
export class RefreshTokenRepository {
    constructor() {}
    async createRefreshToken(refreshToken: RefreshTokenType) {
        return await RefreshToken.create(refreshToken);
    }
    async deleteRefreshTokenOfUser(refreshTokenId: string, userId: string) {
        return await RefreshToken.findOneAndDelete({
            _id: refreshTokenId,
            user: userId,
        });
    }
    async deleteAllRefreshTokensOfUser(userId: string) {
        return await RefreshToken.deleteMany({ user: userId });
    }

    async findById(id: string) {
        return await RefreshToken.findById(id);
    }

    async findByRefreshIdAndUserId(refreshTokenId: string, userId: string) {
        return await RefreshToken.findOne({
            _id: refreshTokenId,
            user: userId,
        });
    }

    async findAll() {
        return await RefreshToken.find();
    }
}
