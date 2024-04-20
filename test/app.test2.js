import { expect } from 'chai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
describe('GET /stock/trackinglist/:userID', () => {
  it('should return a status code of 200 and tracking list when valid userID is provided', async () => {
    const userId = 111; // 假设这是有效的userID
    const response = await axios.get(`http://localhost:${process.env.PORT}/stock/trackinglist/${userId}`);
    expect(response.status).to.equal(200);
    expect(response.data).to.be.an('array'); // 假设返回的是一个数组
  });
});
