export interface JwtPayload {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface JWTGeneratorOptions {
    algorithm?: string;
    expiresIn?: string;
    issuer?: string;
    jwtId?: string;
}

export interface JWTGenerator {
    generate(payload: JwtPayload, jwtOptions?: JWTGeneratorOptions): string;
}
