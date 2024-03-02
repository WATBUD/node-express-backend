import axios from "axios";
import prismaServiceInstance from '../Database/prisma/prismaService.js';
class UserService {
  constructor() {}

  static async getNordVPNDataAsync(ipAddress) {
    try {
      const apiUrl = `https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data&ip=${ipAddress}`;
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error(`发生异常：${ipAddress}`, error.message);
      return `发生异常：${ipAddress}` + error.message;
    }
  }
  static async getLocalPublicIpAddressAsync() {
    try {
      const apiUrl = "https://api64.ipify.org?format=text";
      const response = await axios.get(apiUrl);

      if (response.status === 200) {
        return response.data;
      } else {
        return "Unable to retrieve public IP address";
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
      const existingUser = await prismaServiceInstance.prisma.users.findUnique({
        where: { user_id: parseInt(userId, 10) },
      });
      if (!existingUser) {
        throw new Error(`ID ${userId} 的用户不存在`);
      }
      updatedUser = await prismaServiceInstance.prisma.users.update({
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