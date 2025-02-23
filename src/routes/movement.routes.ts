import { Router } from "express";
import verifyToken from "../middlewares/auth";
import MovementController from "../controllers/MovementController";

const movementRouter = Router();
const movementController = new MovementController();

movementRouter.post("/", verifyToken, movementController.createMovement);

export default movementRouter;
