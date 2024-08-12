import axios from "axios";
import UserRepositoryInstance from '../../Database/prisma/UserRepository.js';

class UserService {
  constructor() {}

  static async getUserById(ID) {
    try {
      const tableData = await UserRepositoryInstance.getUserById(ID);
      
      if (tableData) {
        return tableData;
      } else {
        return "Unable to retrieve data for ID: " + ID;
      }
    } catch (error) {
      return "Error: " + error.message;
    }
  }
  

  static async getAssignViewTable(tableName) {
    try {
      const tableData = await UserRepositoryInstance.getAssignViewTable(tableName); // 等待 UserRepositoryInstance.getAssignViewTable 完成
  
      if (tableData) {
        return tableData;
      } else {
        return "Unable to retrieve data for table: " + tableName;
      }
    } catch (error) {
      return "Error: " + error.message;
    }
  }
  static async updateUserPassword(userId, newPassword) {
    let updatedUser = null;
    let transactionError = null;
    if (!userId || !newPassword) {
      return "userId 和 newPassword 不能为空";
    }
    // console.log('updateUserPassword',userId,newPassword)
    try {
      const existingUser = await UserRepositoryInstance.prisma.users.findUnique({
        where: { user_id: parseInt(userId, 10) },
      });
      if (!existingUser) {
        throw new Error(`ID ${userId} 的用户不存在`);
      }
      updatedUser = await UserRepositoryInstance.prisma.users.update({
        where: { user_id: parseInt(userId, 10) },
        data: { password: newPassword.toString()},
      });
    } catch (error) {
      console.log(error);
      return `${error}`;
    }

    return `密碼更新成功 ${newPassword}`;
  }
}

export default UserService;