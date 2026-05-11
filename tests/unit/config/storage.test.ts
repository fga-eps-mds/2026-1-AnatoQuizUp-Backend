const envOriginal = process.env;

type StorageEnvOverrides = Partial<NodeJS.ProcessEnv>;

async function carregarStorage(overrides: StorageEnvOverrides = {}) {
  jest.resetModules();

  process.env = {
    ...envOriginal,
    NODE_ENV: 'test',
    MINIO_ENDPOINT: 'http://localhost',
    MINIO_API_PORT: '9000',
    MINIO_ROOT_USER: 'admin',
    MINIO_ROOT_PASSWORD: 'senhaValida123',
    ...overrides,
  };

  const storageGlobal = globalThis as {
    __minio_native__?: unknown;
    __s3_client__?: unknown;
  };

  storageGlobal.__minio_native__ = undefined;
  storageGlobal.__s3_client__ = undefined;

  return import('../../../src/config/storage');
}

describe('Storage Configuration', () => {
  afterAll(() => {
    process.env = envOriginal;
  });

  it('deve exportar as instancias corretamente e configurar o bucket', async () => {
    const { minioAdmin, configurarStorage } = await carregarStorage();

    const bucketExistsSpy = jest.spyOn(minioAdmin, 'bucketExists').mockResolvedValue(false);
    const makeBucketSpy = jest.spyOn(minioAdmin, 'makeBucket').mockResolvedValue(undefined as never);
    const setPolicySpy = jest
      .spyOn(minioAdmin, 'setBucketPolicy')
      .mockResolvedValue(undefined as never);

    await configurarStorage();

    expect(bucketExistsSpy).toHaveBeenCalledWith('anatoquizup-imagens');
    expect(makeBucketSpy).toHaveBeenCalled();
    expect(setPolicySpy).toHaveBeenCalled();
  });

  it('deve usar a porta de API mesmo quando endpoint vier com porta de console', async () => {
    const { minioEndpointConfig } = await carregarStorage({
      NODE_ENV: 'production',
      MINIO_ENDPOINT: 'https://minio.example.com:9001',
      MINIO_API_PORT: '9000',
    });

    expect(minioEndpointConfig).toEqual({
      hostname: 'minio.example.com',
      port: 9000,
      useSSL: true,
      s3Endpoint: 'https://minio.example.com:9000',
    });
  });

  it('deve lancar erro se a porta de API for invalida', async () => {
    await expect(carregarStorage({ MINIO_API_PORT: 'porta-invalida' })).rejects.toThrow(
      'MINIO_API_PORT invalida',
    );
  });

  it('deve lancar erro se o MinIO falhar', async () => {
    const { configurarStorage, minioAdmin } = await carregarStorage();

    jest.spyOn(minioAdmin, 'bucketExists').mockRejectedValue(new Error('Conexao recusada'));

    await expect(configurarStorage()).rejects.toThrow('[Storage] Falha crítica');
  });
});
