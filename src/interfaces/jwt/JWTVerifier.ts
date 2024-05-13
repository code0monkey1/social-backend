export interface JWTVerifier {
    verify(jwt: string): string | null;
}
