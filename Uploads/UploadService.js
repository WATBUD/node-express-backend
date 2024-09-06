import multer from 'multer';
import path from 'path';

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Uploads'); // Set the destination folder
  },
  filename: function (req, file, cb) {
    // Generate the filename
    const userId = req.user.user_id; // Get userId from the request
    const ext = path.extname(file.originalname); // Extract file extension
    const fileName = `${userId}_Avatar${ext}`; // Create the filename
    cb(null, fileName); // Pass the filename to the callback
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png'
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only .jpg and .png files are allowed'), false); // Reject the file
  }
};

const avatarUpload = multer({ 
  storage: avatarStorage, 
  fileFilter: fileFilter,
  encoding: 'utf-8' 
});

export { avatarUpload };
