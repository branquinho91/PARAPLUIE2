import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAdmin";
import verifyToken from "../middlewares/auth";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

// Create new ADMIN without middleware
userRouter.post("/create-new-admin", userController.createAdmin);

userRouter.post("/", verifyToken, checkAdmin as any, userController.createUser);
userRouter.get("/", verifyToken, checkAdmin as any, userController.listUsers);

export default userRouter;
