import jwt from "jsonwebtoken";

import { PAPEIS } from "../../constants/papeis";
import { STATUS } from "@/shared/constants/status";
import {
  jwtSecretKey,
  jwtRefreshSecretKey,
  jwtPasswordRedefinitionSecretKey,
} from "@/config/env";
import type { AuthPayload } from "@/shared/types/auth.types";
import {
  generateAccessToken,
  generatePasswordRedefinitionToken,
  generateRefreshToken,
  verifyJwtToken,
} from "../jwt";

const auth_payload: AuthPayload = {
  id: "uuid",
  email: "email@domain",
  role: PAPEIS.ALUNO,
  status: STATUS.ATIVO,
};

describe("testing jwt utils", () => {
  test("successfully generate access token ", () => {
    const token: string = generateAccessToken(auth_payload, jwtSecretKey);
    const verified_token: AuthPayload = jwt.verify(token, jwtSecretKey) as AuthPayload;
    expect(verified_token.id).toEqual("uuid");
  });

  test("successfully generate refresh token", () => {
    const token: string = generateRefreshToken(auth_payload, jwtRefreshSecretKey);
    const verified_token: AuthPayload = jwt.verify(token, jwtRefreshSecretKey) as AuthPayload;
    expect(verified_token.id).toEqual("uuid");
  });

  test("successfully generate password redefinition token", () => {
    const token: string = generatePasswordRedefinitionToken(
      auth_payload,
      jwtPasswordRedefinitionSecretKey,
    );
    const verified_token: AuthPayload = jwt.verify(
      token,
      jwtPasswordRedefinitionSecretKey,
    ) as AuthPayload;
    expect(verified_token.id).toEqual("uuid");
  });

  test("successfully verify valid token", () => {
    const token = jwt.sign(auth_payload, jwtSecretKey);
    const verified_token: AuthPayload = verifyJwtToken(token, jwtSecretKey) as AuthPayload;
    expect(verified_token.id).toEqual("uuid");
  });

  test("verify should throw 'Token verification failed' for malformed token)", () => {
    try {
      verifyJwtToken("malformed-token", jwtSecretKey);
    } catch (error: unknown) {
      const typedError = error as Error;
      expect(typedError.message).toBe("Token inválido");
    }
  });

  test("verify should throw 'Token has expired' for an expired token", () => {
    const expiredToken = jwt.sign(auth_payload, jwtSecretKey, { expiresIn: "-1s" });
    try {
      verifyJwtToken(expiredToken, jwtSecretKey);
    } catch (error: unknown) {
      const typedError = error as Error;
      expect(typedError.message).toBe("Token expirado");
    }
  });
});
