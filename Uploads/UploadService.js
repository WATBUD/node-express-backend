import multer from 'multer';
import path from 'path';
import axios from "axios";
import PrismaServiceInstance from '../Database/prisma/PrismaService.js';
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Uploads');
    },
    filename: async function (req, file, cb) {
      //console.log('filename',file);
      //const userId = req.body.userId; 
      //const userId = req.params.id;
      const userId = req.user.user_id
      const existingUser = await PrismaServiceInstance.prisma.users.findUnique({
        where: { user_id: parseInt(userId, 10) },
      });
      console.log('existingUser',existingUser,userId);

      if (!existingUser) {
        //throw new Error(`ID ${userId} 的用户不存在`);
        cb(new Error(`ID ${userId} 的用户不存在`), false);
      }
      //const originalName = file.originalname;
      const ext = path.extname(file.originalname); 
      const fileName = `${userId}_Avatar${ext}`;
      cb(null, fileName);
    }
});
// 限制只有.jpg和.png文件可以上传
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳.jpg和.png類型的文件'), false);
    }
  };
  
const avatarUpload = multer({ 
    storage: avatarStorage, 
    fileFilter: fileFilter,
    encoding: 'utf-8' // 指定编码方式为 UTF-8
  });
export { avatarUpload };
