// uploadService.js

import multer from 'multer';

// 配置 Multer 中间件
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 指定文件保存的目录
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // 使用时间戳和原始文件名作为存储的文件名
    }
});

const upload = multer({ storage: storage });

export default upload;
