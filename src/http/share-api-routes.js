import express from "express";
const express_router = express.Router();
export default function createSharedRoutes(SharedController) {

/**
 * @swagger
 * /shared/get-client-ip:
 *   get:
 *     tags:
 *         - Shared
 *     summary: Get IP information
 *     description: Returns client IP information along with NordVPN data.
 *     responses:
 *       200:
 *         description: Successful response with client IP and NordVPN data.
 */
express_router.get("/shared/get-client-ip", SharedController.getClientIP);

express_router.get("/", SharedController.homePage);
return express_router;

}
