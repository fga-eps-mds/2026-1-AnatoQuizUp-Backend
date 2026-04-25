import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { AuthPayload } from "../types/api.types";
import { jwtSecretKey, jwtRefreshSecretKey } from "../../config/env";

export const verifyJwtToken = (token: string, secret: string = jwtSecretKey) => {
    try{
        const payload: AuthPayload = jwt.verify(token, secret) as AuthPayload;
        return payload;
    }
    catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
            throw error;
        } else if (error instanceof JsonWebTokenError) {
            throw error;
        } else {
            throw new Error('Token verification failed');
        }
    }
}

export const generateAccessToken = (payload: AuthPayload, secret: string = jwtSecretKey) => {
    return jwt.sign(payload, secret, { expiresIn: '1h' });
}

export const generateRefreshToken = (payload: AuthPayload, secret: string = jwtRefreshSecretKey) => {
    return jwt.sign(payload, secret, { expiresIn: '7 days' });
}
