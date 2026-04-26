import type { Request, Response, NextFunction } from "express";
import { middlewareAutenticacao } from "../autenticacao.middleware";
import { gerarTokenDeAcesso } from "@/shared/utils/jwt";
import type { PayloadAutenticacao } from "@/shared/types/autenticacao.types";
import { PAPEIS } from "@/shared/constants/papeis";
import { STATUS } from "@/shared/constants/status";
import type { Status } from "@/shared/constants/status";
import type { ErroAplicacao } from "@/shared/errors/erro-aplicacao";

type MockRequest = Partial<Request> & {
  path: string;
};

const gerarPayloadAutenticacao = (status: Status): PayloadAutenticacao => {
    const payload_autenticacao: PayloadAutenticacao = {
    id: "uuid",
    email: "email@domain",
    papel: PAPEIS.ALUNO,
    status: status,
  };
  return payload_autenticacao;
};


describe("Testa middleware de autenticação", () => {
  let mock_request: MockRequest;
  let mock_response: Partial<Response>;
  let next_function: NextFunction;

  beforeEach(() => {
    mock_request = {path: ""};
    mock_response = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn(),
    };
    next_function = jest.fn();
  });

  test("Deve chamar next() caso o token seja valido e status for 'ATIVO'", () => {
    const payload_autenticacao = gerarPayloadAutenticacao(STATUS.ATIVO);
    const token = gerarTokenDeAcesso(payload_autenticacao);
    mock_request.headers = { authorization: "Bearer " + token };
    mock_request.path = "/protected";
    middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    expect(next_function).toHaveBeenCalled();
  });

  test("Deve chamar next() caso seja uma rota pública", () => {
    mock_request.path = "/login";
    middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    expect(next_function).toHaveBeenCalled();
  });

  test("Deve retornar 401 caso nenhum token seja fornecido e a rota seja protegida", () => {
    mock_request.headers = {};
    mock_request.path = "/protected";
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Nenhum token foi fornecido");
      expect(erro_tipado.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 401 caso nenhum token seja fornecido", () => {
    mock_request.headers = {};
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Nenhum token foi fornecido");
      expect(erro_tipado.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 401 caso o campo 'authorization' do cabeçalho não começa com 'Bearer '", () => {
    mock_request.headers = { authorization: "invalid_token" };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Token inválido");
      expect(erro_tipado.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 401 caso seja fornecido um token invalido", () => {
    mock_request.headers = { authorization: "invalid_token" };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Token inválido");
      expect(erro_tipado.codigoStatus).toBe(401);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 403 caso payload de autenticação tenha status 'INATIVO'", () => {
    const payload_inativo = gerarPayloadAutenticacao(STATUS.INATIVO);
    const token = gerarTokenDeAcesso(payload_inativo);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Conta desativada");
      expect(erro_tipado.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 403 caso payload de autenticação tenha status 'PENDENTE'", () => {
    const payload_pendente = gerarPayloadAutenticacao(STATUS.PENDENTE);
    const token = gerarTokenDeAcesso(payload_pendente);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Cadastro em análise");
      expect(erro_tipado.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });

  test("Deve retornar 403 caso payload de autenticação tenha status 'RECUSADO'", () => {
    const payload_recusado = gerarPayloadAutenticacao(STATUS.RECUSADO);
    const token = gerarTokenDeAcesso(payload_recusado);
    mock_request.headers = { authorization: "Bearer " + token };
    try {
      middlewareAutenticacao(mock_request as Request, mock_response as Response, next_function);
    } catch (error: unknown) {
      const erro_tipado = error as ErroAplicacao;
      expect(erro_tipado.message).toBe("Cadastro recusado");
      expect(erro_tipado.codigoStatus).toBe(403);
      expect(next_function).not.toHaveBeenCalled();
    }
  });
});
