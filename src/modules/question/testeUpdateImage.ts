import { Router } from 'express';
import type { Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const uploadRoute = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

const isProd = process.env.NODE_ENV === 'production';
const s3Endpoint = isProd 
  ? process.env.MINIO_ENDPOINT 
  : `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_API_PORT}`;

const s3Client = new S3Client({
  endpoint: s3Endpoint, 
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || '',
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || '',
  },
  forcePathStyle: true,
});

uploadRoute.post('/upload', upload.single('imagem'), async (req: Request, res: Response) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });

    const fileHash = crypto.randomBytes(8).toString('hex');
    const fileName = `${fileHash}-${file.originalname.replace(/\s/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: 'anatoquizup-imagens',
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

   const currentIsProd = process.env.NODE_ENV === 'production';
    const endpoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_API_PORT;

    const baseUrl = currentIsProd ? endpoint : `${endpoint}:${port}`;
    const url = `${baseUrl}/anatoquizup-imagens/${fileName}`;

    return res.status(201).json({ mensagem: 'Sucesso!', url });
  } catch  {
    return res.status(500).json({ erro: 'Deu ruim no servidor.' });
  }
});

export default uploadRoute;