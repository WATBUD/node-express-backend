import axios from "axios";
import SharedRepositoryInstance from '../../Database/prisma/SharedRepository.js';

class SharedService {
  constructor() {}
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
  static async getAssignViewTable(viewTablename,limit) {
    try {
      const tableData = await SharedRepositoryInstance.getAssignViewTable(viewTablename,limit); // 等待 SharedRepositoryInstance.getAssignViewTable 完成
  
      if (tableData) {
        return tableData;
      } else {
        return "Unable to retrieve data for table: " + tableName;
      }
    } catch (error) {
      return "Error: " + error.message;
    }
  }


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


}

export default SharedService;