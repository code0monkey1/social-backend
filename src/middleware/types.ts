export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export type RefreshTokenPayload = {
    refreshTokenId: string;
    userId: string;
};
