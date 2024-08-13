import express from 'express';
import UserController from './user_handler.js';


const express_router = express.Router();
import UserRepositoryInstance from '../../Database/prisma/UserRepository.js';
import UserService from '../../core/application/UserService.js';
const userService = new UserService(UserRepositoryInstance);
const userController = UserController(userService);
import multer from 'multer';
const formData_Middlewares_multer = multer(); 
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
express_router.get("/tag-group-details", userController.getTagGroupDetails);

/**
 * @swagger
 * /update-user-password:
 *   post:
 *     tags:
 *       - Users Api
 *     summary: 更新使用者密碼
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - password
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
 */
express_router.post("/update-user-password", formData_Middlewares_multer.none(), userController.updateUserPassword);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users Api
 *     summary: 取得使用者資料
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 使用者ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功取得使用者資料。
 */
express_router.get("/users/:id", userController.getUserById);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     tags:
 *       - Users Api
 *     summary: 更新使用者密碼
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 使用者ID
 *         schema:
 *           type: string
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
express_router.put("/users/:id/password", formData_Middlewares_multer.none(), userController.updateUserPasswordById);

/**
 * @swagger
 * /update-user-avatar:
 *   post:
 *     tags:
 *       - Users Api
 *     summary: 更新使用者頭像
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - avatar
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 使用者頭像
 *     responses:
 *       200:
 *         description: 成功更新使用者頭像。
 *       500:
 *         description: 內部伺服器錯誤。
 */
express_router.post("/update-user-avatar", formData_Middlewares_multer.single('avatar'), userController.updateUserAvatar);

export default express_router;
