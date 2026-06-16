import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
const CloudinaryStorage = require('multer-storage-cloudinary');
//import { CloudinaryStorage } from 'multer-storage-cloudinary';
import '../config/cloudinary'; 

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: any) => ({
    folder: 'restaurant-menu',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'fill' }],
  }),
});

export const upload = multer({ storage });
