import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const router = Router();

const s3Client = new S3Client({
  endpoint: 'http://localhost:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || 'admin_local', 
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || 'senha_super_secreta_123',
  },
  forcePathStyle: true,
});

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('imagem'), async (req: Request, res: Response): Promise<Response> => {
  try {
    const file = req.file; 
    
    if (!file) {
      return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
    }

    const bucketName = 'anatoquizup-imagens'; 
    
    const fileHash = crypto.randomBytes(8).toString('hex');
    const fileName = `${fileHash}-${file.originalname.replace(/\s/g, '-')}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return res.status(201).json({
      mensagem: 'Sucesso!',
      url: `http://localhost:9000/${bucketName}/${fileName}`
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ erro: 'Deu ruim no servidor.' });
  }
});

export default router;