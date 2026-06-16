import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController';
import { upload } from '../config/cloudinary';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/image', protect, upload.single('image'), uploadImage);
router.delete('/image', protect, deleteImage);

export default router;
