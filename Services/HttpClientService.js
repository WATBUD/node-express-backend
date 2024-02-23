import axios from "axios";

class GetStocksService {
  //static httpClient = axios.create();
  constructor() {
    // 初始化 axios 实例
    //this.httpClient = axios.create();
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
}

export default GetStocksService;
