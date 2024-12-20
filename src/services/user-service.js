import { generateToken } from '../utilities/jwt-helper.js';
import { avatarUpload } from '../../uploads/upload-service.js';
import path from 'path'; // 使用 ES6 模块导入
import ResponseDTO from '../http/api-response-dto.js';

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async checkUserLogin(inputData) {
    try {
      const user = await this.userRepository.findUserByAccount(inputData.user_account);
        if (!user) {
        return ResponseDTO.errorResponse("User does not exist");
      }
        if (user.password_hash !== inputData.password) {
        return ResponseDTO.errorResponse("Incorrect password");
      }
        const token = generateToken(user, '15m');
      const responsePayload = {
        // user_id: user.user_id,
        // user_name: user.user_name,
        token,
      };
      return ResponseDTO.successResponse(undefined,responsePayload);
    } catch (error) {
      return ResponseDTO.errorResponse("Error: " + error.message);
    }
  }

  async getUserById(id) {
    try {
      const tableData = await this.userRepository.getUserById(id);
      if (tableData) {
        return tableData;
      } else {
        return `Unable to retrieve data for ID: ${id}`;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  async getAssignViewTable(tableName) {
    try {
      const tableData = await this.userRepository.getAssignViewTable(tableName);
      if (tableData) {
        return tableData;
      } else {
        return `Unable to retrieve data for table: ${tableName}`;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  async userUploadAvatar(req, res) {
    try {
      avatarUpload.single("avatar")(req, res, async (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Handle further actions after successful upload
        const userId = req.user.user_id;
        const filePath = `/uploads/${userId}_Avatar${path.extname(req.file.originalname)}`;

        try {
          // Update the user's avatar in the database
          const updatedUser = await this.userRepository.updateUserAvatar(userId, filePath);
          return res.status(200).json({ message: "Avatar updated successfully.", user: updatedUser.avatar });
        } catch (error) {
          return res.status(500).json({ error: error.message });
        }
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }



  async updateUserPassword(userId, newPassword) {
    if (!userId || !newPassword) {
      return "userId 和 newPassword 不能为空";
    }

    try {
      const existingUser = await this.userRepository.prisma.users.findUnique({
        where: { user_id: parseInt(userId, 10) },
      });

      if (!existingUser) {
        throw new Error(`ID ${userId} 的用户不存在`);
      }

      await this.userRepository.prisma.users.update({
        where: { user_id: parseInt(userId, 10) },
        data: { password: newPassword.toString() },
      });

      return `密碼更新成功 ${newPassword}`;
    } catch (error) {
      console.log(error);
      return `Error: ${error.message}`;
    }
  }
}

export default UserService;
