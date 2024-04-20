import { expect } from 'chai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

describe('POST /stock/trackinglist', () => {
  it('should return a status code of 200 and success message when valid userID and stockID are provided', async () => {
    const requestBody = {
      userID: 111, // 假设这是有效的userID
      stockID: 123 // 假设这是有效的stockID
    };

    const response = await axios.post(`http://localhost:${process.env.PORT}/stock/trackinglist`, requestBody);

    expect(response.status).to.equal(200);
    expect(response.data.message).to.equal('成功新增使用者追蹤股票名單');
  });

  it('should return a status code of 400 and error message when invalid userID or stockID are provided', async () => {
    const requestBody = {
      userID: 'abc', // 无效的userID
      stockID: 'def' // 无效的stockID
    };

    try {
      await axios.post(`http://localhost:${process.env.PORT}/stock/trackinglist`, requestBody);
    } catch (error) {
      expect(error.response.status).to.equal(400);
      expect(error.response.data.error).to.equal('Invalid userID or stockID');
    }
  });

});
