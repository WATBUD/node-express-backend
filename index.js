import express  from "express";
import bodyParser from 'body-parser';
//const express=require('express');
const app = express();
const PORT=9421;



import GetStocksService from './Services/GetStocksService.js';

app.use(bodyParser.json());

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 路由定义
app.get('/GetClientIP', async (req, res) => {
    try {
        var ipAddress = req.ip;
        if (ipAddress == '::1' || '127.0.0.1') {
            const myip=await GetStocksService.getLocalPublicIpAddressAsync();
            ipAddress = myip;
        }
        const data = await GetStocksService.getNordVPNDataAsync(ipAddress);
        res.json(data);
        //res.send(ipAddress);
        console.log(
            '%c GetClientIP',
            'color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold',
            'req:',
            req,
          );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/', (req, res) => {
    console.log(`[TEST]`);
    res.send('hello form message');
});


app.get('/test1', (req, res) => {
    console.log(`[TEST]`);
    res.send('test1 form message');
});




