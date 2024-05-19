import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getResponse, setResponse } from "../controllers/response.controller.js";

const router = Router();

//secure routes
router.route("/submit-response").post(verifyJwt, setResponse)
router.route("/get-response").get(verifyJwt, getResponse)

export default router