import express from 'express';
import UserService from '../Services/UserService.js';
const appRouter  = express.Router();
import PrismaServiceInstance from '../Database/pr
import path from 'path';
const formData_Middlewares = multer();//解析form data的中間件
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
    const tableData = await PrismaServiceInstance.getAssignViewTable("V_TagGroupDetail");
    try {
      res.json(tableData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



/**
 * @swagger
 * /updateUserPassword:
 *   post:
 *     tags:
 *       - Users Api
 *     summary: 更新使用者密碼
 *     description: 更新使用者密碼。
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: 使用者ID
 *               password:
 *                 type: string
 *                 description: 使用者新密碼
 *     responses:
 *       200:
 *         description: 成功更新使用者密碼。
 *       400:
 *         description: 缺少必需的參數或參數格式錯誤。
 *       500:
 *         description: 內部伺服器錯誤。
 */
appRouter.post("/updateUserPassword",formData_Middlewares.none(),async (req, res) => {
    const { userId, password } = req.body;
    console.log(req.body)
    try {
        const updatedUser = await UserService.updateUserPassword(userId, password);
        res.send(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /updateUserPasswordFormData:
 *   post:
 *     tags:
 *       - Users Api
 *     summary: 更新使用者密碼
 *     description: 更新使用者密碼。
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 使用者ID
 *               password:
 *                 type: string
 *                 description: 使用者新密碼
 *     responses:
 *       200:
 *         description: 成功更新使用者密碼。
 *       400:
 *         description: 缺少必需的參數或參數格式錯誤。
 *       500:
 *         description: 內部伺服器錯誤。
 */
appRouter.post("/updateUserPasswordFormData",formData_Middlewares.none(), async (req, res) => {
    const { userId, password } = req.body;
    console.log('req.body=>>>',userId, password,req.body);
    try {
        const updatedUser = await UserService.updateUserPassword(userId, password);
        res.send(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default appRouter ;
