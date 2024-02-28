import express from 'express';
import UserService from '../Services/UserService.js';
const appRouter  = express.Router();
import prismaServiceInstance from '../Database/prisma/prismaService.js';


/**
 * @swagger
 * /getTagGroupDetails:
 *   get:
 *     tags:
 *         - Users Api
 *     summary: tag群組表
 *     description: Returns tag群組表 data.
 *     responses:
 *       200:
 *         description: Successful response with tag群組表 data.
 */
appRouter.get("/getTagGroupDetails", async (req, res) => {
    const users = await prismaServiceInstance.getAssignViewTable("V_TagGroupDetail");
    try {
      const data = users;
    //   console.log(
    //     "%c getTagGroupDetails_data",
    //     "color:#BB3D00;font-family:system-ui;font-size:2rem;font-weight:bold",
    //     data
    //   );
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



export default appRouter ;
