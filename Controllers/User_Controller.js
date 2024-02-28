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
    const tableData = await prismaServiceInstance.getAssignViewTable("V_TagGroupDetail");
    try {
      res.json(tableData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

export default appRouter ;
