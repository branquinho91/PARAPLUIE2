import { Router } from "express";
import verifyToken from "../middlewares/auth";
import MovementController from "../controllers/MovementController";

const movementRouter = Router();
const movementController = new MovementController();

movementRouter.post("/", verifyToken, movementController.createMovement);
movementRouter.get("/", verifyToken, movementController.listMovements);
movementRouter.patch("/:id/start", verifyToken, movementController.startMovement);
movementRouter.patch("/:id/end", verifyToken, movementController.finishMovement);

export default movementRouter;
