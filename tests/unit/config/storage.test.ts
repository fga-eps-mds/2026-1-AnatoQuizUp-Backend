describe('Storage Configuration', () => {
  beforeAll(() => {
    process.env.MINIO_ENDPOINT = 'http://localhost';
    process.env.MINIO_API_PORT = '9000';
    process.env.MINIO_ROOT_USER = 'admin';
    process.env.MINIO_ROOT_PASSWORD = 'password';
  });

  it('deve exportar as instâncias corretamente e configurar o bucket', async () => {
    // Import dinâmico é aceito pelo TypeScript e resolve o problema do cache
    const { minioAdmin, configurarStorage } = await import('../../../src/config/storage');

    const bucketExistsSpy = jest.spyOn(minioAdmin, 'bucketExists').mockResolvedValue(false);
    const makeBucketSpy = jest.spyOn(minioAdmin, 'makeBucket').mockResolvedValue(undefined as never);
    const setPolicySpy = jest.spyOn(minioAdmin, 'setBucketPolicy').mockResolvedValue(undefined as never);

    await configurarStorage();

    expect(bucketExistsSpy).toHaveBeenCalledWith('anatoquizup-imagens');
    expect(makeBucketSpy).toHaveBeenCalled();
    expect(setPolicySpy).toHaveBeenCalled();
  });

  it('deve lançar erro se o MinIO falhar', async () => {
    const { configurarStorage, minioAdmin } = await import('../../../src/config/storage');
    
    jest.spyOn(minioAdmin, 'bucketExists').mockRejectedValue(new Error('Conexão recusada'));

    await expect(configurarStorage()).rejects.toThrow('[Storage] Falha crítica');
  });
});