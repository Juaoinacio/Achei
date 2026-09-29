import { cloudinary, CLOUDINARY_FOLDERS, CloudinaryFolder } from '../config/cloudinary';
import { UploadApiResponse, UploadApiOptions } from 'cloudinary';

export class CloudinaryService {
  /**
   * Garante a criação de todas as pastas necessárias no Cloudinary:
   * - achei
   * - achei/items
   * - achei/users
   * - achei/banners
   * - achei/brands
   */
  static async createAcheiFolders(): Promise<{ folder: string; success: boolean; error?: string }[]> {
    const foldersToCreate = [
      CLOUDINARY_FOLDERS.ROOT,
      CLOUDINARY_FOLDERS.ITEMS,
      CLOUDINARY_FOLDERS.USERS,
      CLOUDINARY_FOLDERS.BANNERS,
      CLOUDINARY_FOLDERS.BRANDS,
    ];

    const results: { folder: string; success: boolean; error?: string }[] = [];

    for (const folder of foldersToCreate) {
      try {
        await cloudinary.api.create_folder(folder);
        results.push({ folder, success: true });
      } catch (err: any) {
        // Se a pasta já existir, o Cloudinary pode retornar mensagem informativa
        results.push({
          folder,
          success: true,
          error: err?.message || undefined,
        });
      }
    }

    return results;
  }

  /**
   * Faz upload de uma imagem a partir de um arquivo local no disco ou de uma URL externa
   */
  static async uploadImage(
    source: string,
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.ITEMS,
    publicId?: string
  ): Promise<UploadApiResponse> {
    const options: UploadApiOptions = {
      folder,
      resource_type: 'image',
      overwrite: true,
    };

    if (publicId) {
      options.public_id = publicId;
    }

    return await cloudinary.uploader.upload(source, options);
  }

  /**
   * Faz upload de um buffer de arquivo (usado por middlewares como Multer em memória)
   */
  static async uploadBuffer(
    buffer: Buffer,
    folder: CloudinaryFolder = CLOUDINARY_FOLDERS.ITEMS,
    filename?: string
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const options: UploadApiOptions = {
        folder,
        resource_type: 'image',
        overwrite: true,
      };

      if (filename) {
        options.public_id = filename;
      }

      const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Falha no upload do buffer para o Cloudinary.'));
        }
        resolve(result);
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * Remove uma imagem do Cloudinary pelo seu public_id
   */
  static async deleteImage(publicId: string): Promise<any> {
    return await cloudinary.uploader.destroy(publicId);
  }
}
