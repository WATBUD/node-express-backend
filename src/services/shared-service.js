import axios from "axios";
class SharedService {
  constructor(sharedRepository) {
    this.sharedRepository = sharedRepository;
  }
  
  async createRequestLog(logdata) {
    try {
      const result = await this.sharedRepository.createRequestLog(logdata);

      if (result) {
        return result;
      } else {
        return "Unable to create request log";
      }
    } catch (error) {
      throw new Error("Error creating request log: " + error.message);
    }
  }
  
  async getLocalPublicIpAddressAsync() {
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
  async getAssignViewTable(viewTablename,limit) {
    try {
      const tableData = await this.sharedRepository.getAssignViewTable(viewTablename,limit); 
  
      if (tableData) {
        return tableData;
      } else {
        return "Unable to retrieve data for table: " + tableName;
      }
    } catch (error) {
      return "Error: " + error.message;
    }
  }


  async getNordVPNDataAsync(ipAddress) {
    try {
      const apiUrl = `https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data&ip=${ipAddress}`;
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      console.error(`Error：${ipAddress}`, error.message);
      return `Error：${ipAddress}` + error.message;
    }
  }


}

export default SharedService;