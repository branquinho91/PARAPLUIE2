import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAdmin";
import verifyToken from "../middlewares/auth";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/", verifyToken, checkAdmin as any, userController.createUser);
userRouter.post("/create-new-admin", userController.createAdmin);

export default userRouter;
