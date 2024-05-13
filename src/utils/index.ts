export const isJwt = (token: string) => {
    // Regular expression to match the JWT token format
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

    // Check if the token matches the JWT token format
    return jwtRegex.test(token);
};
