import { Request, Response } from 'express';
import multer from 'multer';
import { CloudinaryService } from '../services/cloudinary.service';
import { CLOUDINARY_FOLDERS, CloudinaryFolder } from '../config/cloudinary';

// Armazena arquivos em memória para envio direto em stream ao Cloudinary
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem (JPEG, PNG, WEBP, etc.) são permitidos.'));
    }
  },
});

export class UploadController {
  static async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'Nenhum arquivo de imagem foi enviado no campo "file" ou "image".' });
        return;
      }

      const targetCategory = (req.body.folder || 'items').toLowerCase();
      let folder: CloudinaryFolder = CLOUDINARY_FOLDERS.ITEMS;

      if (targetCategory === 'users' || targetCategory === 'avatar') {
        folder = CLOUDINARY_FOLDERS.USERS;
      } else if (targetCategory === 'banners' || targetCategory === 'banner') {
        folder = CLOUDINARY_FOLDERS.BANNERS;
      } else if (targetCategory === 'brands' || targetCategory === 'brand') {
        folder = CLOUDINARY_FOLDERS.BRANDS;
      }

      // Upload do buffer para o Cloudinary
      const result = await CloudinaryService.uploadBuffer(req.file.buffer, folder);

      res.status(201).json({
        message: 'Upload concluído com sucesso!',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      });
    } catch (error: any) {
      console.error('Erro no upload de imagem:', error);
      res.status(500).json({ message: error.message || 'Falha ao processar o upload no Cloudinary.' });
    }
  }
}
