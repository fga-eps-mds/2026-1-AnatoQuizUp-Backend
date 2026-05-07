import request from 'supertest';
import express from 'express';
import { S3Client } from '@aws-sdk/client-s3';
import uploadRoute from '../../../src/modules/question/testeUpdateImage';

jest.mock('@aws-sdk/client-s3');
const MockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;

const app = express();
app.use(express.json());
app.use('/api', uploadRoute);

describe('Upload Controller (Clean Architecture)', () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    process.env.MINIO_ENDPOINT = 'http://localhost';
    process.env.MINIO_API_PORT = '9000';
    process.env.MINIO_ROOT_USER = 'admin';
    process.env.MINIO_ROOT_PASSWORD = 'password';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    MockedS3Client.prototype.send = mockSend;
    mockSend.mockResolvedValue({});
    process.env.NODE_ENV = 'development';
  });

  it('deve retornar status 400 se nenhuma imagem for enviada', async () => {
    const response = await request(app).post('/api/upload');
    expect(response.status).toBe(400);
    expect(response.body.erro).toBe('Nenhuma imagem enviada.');
  });

  it('deve gerar URL com porta 9000 em ambiente de desenvolvimento', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('imagem', Buffer.from('teste'), 'imagem.png');

    expect(response.status).toBe(201);
    expect(response.body.url).toContain(':9000');
  });

  it('deve gerar URL sem porta em ambiente de produção', async () => {
    process.env.NODE_ENV = 'production';

    const response = await request(app)
      .post('/api/upload')
      .attach('imagem', Buffer.from('teste'), 'imagem.png');

    expect(response.status).toBe(201);
    expect(response.body.url).not.toContain(':9000');
    expect(response.body.url).toContain('http://localhost/anatoquizup-imagens');
  });

  it('deve retornar status 500 se o storage falhar', async () => {
    mockSend.mockRejectedValueOnce(new Error('S3 Error'));

    const response = await request(app)
      .post('/api/upload')
      .attach('imagem', Buffer.from('teste'), 'imagem.png');

    expect(response.status).toBe(500);
    expect(response.body.erro).toBe('Deu ruim no servidor.');
  });
});