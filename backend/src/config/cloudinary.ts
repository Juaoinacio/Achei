import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const CLOUDINARY_FOLDERS = {
  ROOT: 'achei',
  ITEMS: 'achei/items',
  USERS: 'achei/users',
  BANNERS: 'achei/banners',
  BRANDS: 'achei/brands',
} as const;

export type CloudinaryFolder = typeof CLOUDINARY_FOLDERS[keyof typeof CLOUDINARY_FOLDERS];

export { cloudinary };
