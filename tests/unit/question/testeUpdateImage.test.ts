import request from 'supertest';
import express from 'express';
import uploadRoute from '../../../src/modules/question/testeUpdateImage';

let mockSend: jest.Mock;

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: (...args: unknown[]) => mockSend(...args)
    })),
    PutObjectCommand: jest.fn(),
  };
});

const app = express();
app.use(express.json());
app.use('/api', uploadRoute);

describe('Upload Controller (Testes Unitários)', () => {
  
  beforeEach(() => {
    mockSend = jest.fn().mockResolvedValue({});
  });

  it('deve retornar status 400 se o usuário não enviar nenhuma imagem no body', async () => {
    const response = await request(app).post('/api/upload');
    
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ erro: 'Nenhuma imagem enviada.' });
  });

  it('deve fazer upload da imagem com sucesso e retornar status 201 com a URL', async () => {
    const imageBuffer = Buffer.from('conteudo-falso-da-imagem');
    
    const response = await request(app)
      .post('/api/upload')
      .attach('imagem', imageBuffer, 'foto.png');
      
    expect(response.status).toBe(201);
    expect(response.body.mensagem).toBe('Sucesso!');
    
    expect(mockSend).toHaveBeenCalledTimes(1);
    
    expect(response.body.url).toContain('anatoquizup-imagens');
    expect(response.body.url).toContain('foto.png');
  });

  it('deve retornar status 500 se ocorrer um erro interno na comunicação com o MinIO/S3', async () => {
    mockSend.mockRejectedValueOnce(new Error('MinIO fora do ar'));

    const imageBuffer = Buffer.from('conteudo-falso');
    
    const response = await request(app)
      .post('/api/upload')
      .attach('imagem', imageBuffer, 'foto.png');

    expect(response.status).toBe(500);
    expect(response.body.erro).toBe('Deu ruim no servidor.');
  });

});