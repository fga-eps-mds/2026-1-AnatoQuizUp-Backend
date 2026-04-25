import type { Request, Response, NextFunction } from "express";
import { middlewareAutenticacao } from "../autenticacao.middleware";
import { generateAccessToken } from "@/shared/utils/jwt";
import type { AuthPayload } from "@/shared/types/auth.types";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import type { ErroAplicacao } from "@/shared/errors/erro-aplicacao";

const auth_payload: AuthPayload = {
  id: "uuid",
  email: "email@domain",
  role: PAPEIS.ALUNO,
  status: STATUS.ATIVO,
};

describe("Test auth middleware", () => {
  let mock_request: Partial<Request>;
  let mock_response: Partial<Response>;
  let next_function: NextFunction;

  beforeEach(() => {
    mock_request = {};
    mock_response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    next_function = jest.fn();
  });

  test("Should call next if valid token provided", () => {
    const token = generateAccessToken(auth_payload);
    mock_request.headers = { authorization: "Bearer " + token };
    middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    expect(next_function).toHaveBeenCalled();
  });

  test("Should return 401 if no provided token", () => {
    mock_request.headers = {};
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Nenhum token foi fornecido");
      expect(typed_error.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Should return 401 if authorization header does not start with 'Bearer '", () => {
    mock_request.headers = { authorization: "invalid_token" };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Token inválido");
      expect(typed_error.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Should return 401 if invalid token provided", () => {
    mock_request.headers = { authorization: "invalid_token" };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Token inválido");
      expect(typed_error.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Should return 403 if user auth payload is 'INATIVO'", () => {
    const inactive_payload: AuthPayload = {
      id: "uuid",
      email: "email@domain",
      role: PAPEIS.ALUNO,
      status: STATUS.INATIVO,
    };
    const token = generateAccessToken(inactive_payload);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Conta desativada");
      expect(typed_error.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Should return 403 if user auth payload is 'PENDENTE'", () => {
    const inactive_payload: AuthPayload = {
      id: "uuid",
      email: "email@domain",
      role: PAPEIS.ALUNO,
      status: STATUS.PENDENTE,
    };
    const token = generateAccessToken(inactive_payload);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Cadastro em análise");
      expect(typed_error.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Should return 403 if user auth payload is 'RECUSADO'", () => {
    const inactive_payload: AuthPayload = {
      id: "uuid",
      email: "email@domain",
      role: PAPEIS.ALUNO,
      status: STATUS.RECUSADO,
    };
    const token = generateAccessToken(inactive_payload);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const typed_error = error as ErroAplicacao;
      expect(typed_error.message).toBe("Cadastro recusado");
      expect(typed_error.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });
});
