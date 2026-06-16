import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

// Single Image Upload
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = (req.file as any).path;
    const publicId = (req.file as any).filename;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully!',
      url: fileUrl,
      publicId
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Image from Cloudinary
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ success: false, message: 'publicId is required' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({ success: true, message: 'Image deleted successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
