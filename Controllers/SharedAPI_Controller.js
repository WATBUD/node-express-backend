import express from 'express';
import HttpClientService from '../Services/HttpClientService.js';
const appRouter  = express.Router();
import swaggerSpecs from '../swaggerSpecs.js';

/**
 * @swagger
 * /GetClientIP:
 *   get:
 *     tags:
 *         - Shared
 *     summary: Get client IP information
 *     description: Returns client IP information along with NordVPN data.
 *     responses:
 *       200:
 *         description: Successful response with client IP and NordVPN data.
 */
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

appRouter.get("/222", (req, res) => {
  res.send(`
    <html>
    <head>
      <title>歡迎來到水靈網站！</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 800px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        p {
          font-size: 18px;
          line-height: 1.6;
          color: #666;
        }
        a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>歡迎來到水靈網站！</h1>
        <table>
        <tr>
          <td>關於</td>
          <td><a href="/about">關於我們</a></td>
        </tr>
        <tr>
          <td>聯繫我們</td>
          <td><a href="/contact">聯繫我們</a></td>
        </tr>
      </table>
        <p>
          感謝您來訪水靈網站。我們致力於為您提供最優質的服務和內容。
          請隨意瀏覽我們的關於頁面，了解更多關於我們的資訊。
          如果您有任何疑問或反饋意見，請隨時<a href="/contact">聯繫我們</a>。
          祝您在我們的網站上度過愉快的時光！
        </p>
      </div>
    </body>
    </html>
  `);
});


appRouter.get("/", (req, res) => {
  let tableRows = '';
  swaggerSpecs.forEach(spec => {
    const routePath = spec.info.routePath || '/';
    const routeTitle = spec.info.title || '/';
    tableRows += `
      <tr>
        <td>${routeTitle}</td>
        <td><a href="${routePath}">${routePath}</a></td>
      </tr>
    `;
  });

  const html = `
    <html>
    <head>
      <title>歡迎來到水靈網站！</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 800px;
          margin: 50px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        table {
          width: 100%;
        }
        td {
          padding: 10px;
        }
        a {
          color: #007bff;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>歡迎來到水靈網站！</h1>
        <table>
          <tr>
            <td>Page</td>
            <td>Router</td>
          </tr>
          ${tableRows}
        </table>
        <p>
        感謝您來訪水靈的api文件網站。水靈致力於為您提供最優質的服務和內容。
        請隨意瀏覽我們的關於頁面，此網站使用node.js/mysql/swagger/express。
        祝您在水靈的網站上度過愉快的時光！
      </p>
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});



export default appRouter ;
