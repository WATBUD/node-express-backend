
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUserById(ID) {
    try {
      const tableData = await this.userRepository.getUserById(ID);
      if (tableData) {
        return tableData;
      } else {
        return `Unable to retrieve data for ID: ${ID}`;
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
