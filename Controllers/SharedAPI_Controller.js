// routes.js

import express from 'express';
import HttpClientService from '../Services/HttpClientService.js';
const appRouter  = express.Router();

appRouter.get("/GetClientIP", async (req, res) => {
  try {
    var ipAddress = req.ip;
    if (ipAddress == "::1" || "127.0.0.1") {
      const myip = await HttpClientService.getLocalPublicIpAddressAsync();
      ipAddress = myip;
    }
    const data = await HttpClientService.getNordVPNDataAsync(ipAddress);
    res.json(data);
    //res.send(ipAddress);
    console.log(
      "%c GetClientIP",
      "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
      "req:",
      req
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

appRouter.get("/", (req, res) => {
  console.log(`[TEST]`);
  res.send("form appRouter.get('/' message");
});


export default appRouter ;
