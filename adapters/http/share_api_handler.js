import SwaggerSpecs from '../../SwaggerSpecs.js';

const SharedAPI_Handler = (sharedService, httpClientService) => {
  return {
    getClientIP: async (req, res) => {
      try {
        let ipAddress = req.ip;
        if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
          const myip = await httpClientService.getLocalPublicIpAddressAsync();
          ipAddress = myip;
        }
        const data = await httpClientService.getNordVPNDataAsync(ipAddress);
        res.json(data);
        console.log(
          "%c getClientIP",
          "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
          "req:",
          req
        );
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    getRequestLogs: async (req, res) => {
      try {
        const table = await sharedService.getAssignViewTable("record_log_table", 5);
        res.json(table);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    homePage: (req, res) => {
      let tableRows = "";
      SwaggerSpecs.forEach((spec) => {
        const routePath = spec.info.routePath || "/";
        const routeTitle = spec.info.title || "/";
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
          請隨意瀏覽頁面，此網站使用node.js/mysql/swagger/express。
          祝您在水靈的網站上度過愉快的時光！
        </p>
        </div>
      </body>
      </html>
    `;

      res.send(html);
    },
  };
};

export default SharedAPI_Handler;
