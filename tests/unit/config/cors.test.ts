import { criarOpcoesCors, parseCorsOrigins } from "@/config/cors";

type OriginCallback = (error: Error | null, allow?: boolean | string) => void;
type OriginHandler = (origin: string | undefined, callback: OriginCallback) => void;

function getOriginHandler(origensPermitidas: string[]) {
  const opcoes = criarOpcoesCors(origensPermitidas);
  return opcoes.origin as OriginHandler;
}

describe("configuracao de CORS", () => {
  it("normaliza origens separadas por virgula", () => {
    expect(parseCorsOrigins(" http://localhost:5173,https://app.example.com, ")).toEqual([
      "http://localhost:5173",
      "https://app.example.com",
    ]);
  });

  it("permite origem configurada", () => {
    const originHandler = getOriginHandler(["http://localhost:5173"]);
    const callback = jest.fn<OriginCallback>();

    originHandler("http://localhost:5173", callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("permite requisicoes sem origin", () => {
    const originHandler = getOriginHandler(["http://localhost:5173"]);
    const callback = jest.fn<OriginCallback>();

    originHandler(undefined, callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it("bloqueia origem nao configurada", () => {
    const originHandler = getOriginHandler(["http://localhost:5173"]);
    const callback = jest.fn<OriginCallback>();

    originHandler("https://nao-permitido.example.com", callback);

    expect(callback.mock.calls[0][0]).toMatchObject({ codigoStatus: 403 });
  });
});
