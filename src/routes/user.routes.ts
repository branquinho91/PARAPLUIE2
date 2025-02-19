import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAdmin";
import verifyToken from "../middlewares/auth";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/", verifyToken as any, checkAdmin as any, userController.create);

export default userRouter;