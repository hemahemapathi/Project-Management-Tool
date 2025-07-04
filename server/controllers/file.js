import File from '../models/File.js';
import multer, { memoryStorage } from 'multer';
import { extname as _extname } from 'path';

// Configure storage
const storage = memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB file size limit
  fileFilter: fileFilter
}).single('file'); // Add this line to specify the field name

export const uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { originalname, mimetype, size, buffer } = req.file;

      const newFile = new File({
        filename: originalname,
        contentType: mimetype,
        size: size,
        data: buffer,
        mimetype: mimetype,
        path: req.file.path || 'default_path', // Provide a default path if req.file.path is undefined
        originalname: originalname
      });

      await newFile.save();

      res.status(201).json({
        message: 'File uploaded successfully',
        fileId: newFile._id,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file' });
    }
  });
};

export const getFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Return file details instead of sending the file data
    res.status(200).json({
      _id: file._id,
      filename: file.filename,
      contentType: file.contentType,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      originalname: file.originalname,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ message: 'Error retrieving file' });
  }
};