import { Router } from 'express';
import { UploadController, uploadMiddleware } from '../controllers/upload.controller';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware';

const uploadRoutes = Router();

// Rota de upload: aceita campo "file" ou "image"
uploadRoutes.post(
  '/',
  optionalAuthMiddleware,
  (req, res, next) => {
    // Permite que o campo multipart se chame tanto 'file' quanto 'image'
    uploadMiddleware.fields([
      { name: 'file', maxCount: 1 },
      { name: 'image', maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      // Normaliza req.file se veio em req.files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      if (files?.file?.[0]) {
        req.file = files.file[0];
      } else if (files?.image?.[0]) {
        req.file = files.image[0];
      }
      next();
    });
  },
  UploadController.uploadImage
);

export { uploadRoutes };
