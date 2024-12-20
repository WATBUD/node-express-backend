import express from 'express';
const express_router = express.Router();

import multer from 'multer';
const formData_Middlewares_multer = multer(); 
import { authenticateToken } from '../utilities/jwt-helper.js';
import { dtoUserCredentials } from '../dto/user-request-dto.js'; 
import { validateRequestBody } from '../dto/joi-help.js';

export default function createRoutes(userHandler) {

  /**
 * @swagger
 * /user-login:
 *   post:
 *     tags:
 *       - Users Api
 *     summary: User login
 *     description: Allows a user to log in with email and password and receive a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserAccount:
 *                 type: string
 *                 example: admin
 *               Password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token.
 *       401:
 *         description: Login failed, invalid credentials.
 */
express_router.post('/user-login',
validateRequestBody(dtoUserCredentials),
userHandler.checkUserlogin)
  
  // /**
  //  * @swagger
  //  * /register:
  //  *   post:
  //  *     tags:
  //  *       - Users Api
  //  *     summary: User registration
  //  *     description: Allows a user to register a new account.
  //  *     requestBody:
  //  *       required: true
  //  *       content:
  //  *         application/json:
  //  *           schema:
  //  *             type: object
  //  *             properties:
  //  *               email:
  //  *                 type: string
  //  *                 example: newuser@example.com
  //  *               password:
  //  *                 type: string
  //  *                 example: password123
  //  *     responses:
  //  *       201:
  //  *         description: Registration successful, returns user information.
  //  *       400:
  //  *         description: Registration failed, possibly due to invalid input data.
  //  */
  // express_router.post('/register', (req, res) => {
  //   // Registration logic
  // });




/**
 * @swagger
 * /tag-group-details:
 *   get:
 *     tags:
 *       - Users Api
 *     summary: tag群組表
 *     description: Returns tag群組表 data.
 *     responses:
 *       200:
 *         description: Successful response with tag群組表 data.
 */
express_router.get("/tag-group-details", userHandler.getTagGroupDetails);

// /**
//  * @swagger
//  * /update-user-password:
//  *   post:
//  *     tags:
//  *       - Users Api
//  *     summary: 更新使用者密碼
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         multipart/form-data:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *               - password
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 description: 使用者ID
//  *               password:
//  *                 type: string
//  *                 description: 使用者新密碼
//  *     responses:
//  *       200:
//  *         description: 成功更新使用者密碼。
//  */
// express_router.post("/update-user-password", formData_Middlewares_multer.none(), userController.updateUserPassword);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users Api
 *     summary: 取得使用者資料
 *     responses:
 *       200:
 *         description: 成功取得使用者資料。
 */
express_router.get("/users", authenticateToken,userHandler.getUserById);

/**
 * @swagger
 * /users/password:
 *   put:
 *     tags:
 *       - Users Api
 *     summary: 使用者更新帳戶密碼
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: 使用者新密碼
 *     responses:
 *       200:
 *         description: 成功更新使用者密碼。
 */
express_router.put("/users/password",authenticateToken, formData_Middlewares_multer.none(), userHandler.updateUserPasswordById);

/**
 * @swagger
 * /update-user-avatar:
 *   put:
 *     tags:
 *       - Users Api
 *     summary: 使用者更新頭像
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 使用者頭像
 *     responses:
 *       200:
 *         description: 成功使用者更新頭像。
 *       500:
 *         description: 內部伺服器錯誤。
 */
express_router.put("/update-user-avatar", authenticateToken,userHandler.updateUserAvatar);

return express_router;

}
