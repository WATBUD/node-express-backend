import express from "express";
import ShardController from "./share_api_handler.js";

const express_router = express.Router();
import SharedService from "../../core/application/SharedService.js";
import HttpClientService from "../../core/application/HttpClientService.js";

import SharedRepositoryInstance from '../../Database/prisma/SharedRepository.js';



const sharedService = new SharedService(SharedRepositoryInstance);
const SharedController = ShardController(sharedService, HttpClientService);

/**
 * @swagger
 * /get-client-ip:
 *   get:
 *     tags:
 *         - Shared
 *     summary: Get IP information
 *     description: Returns client IP information along with NordVPN data.
 *     responses:
 *       200:
 *         description: Successful response with client IP and NordVPN data.
 */
express_router.get("/get-client-ip", SharedController.getClientIP);

/**
 * @swagger
 * /get-request-logs:
 *   get:
 *     tags:
 *         - Shared
 *     summary: Get Api call record table
 *     description: Returns data.
 *     responses:
 *       200:
 *         description: Successful response data.
 */
express_router.get("/get-request-logs", SharedController.getRequestLogs);

express_router.get("/", SharedController.homePage);

export default express_router;
