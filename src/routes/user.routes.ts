import { Router } from "express";
import checkAdmin  from "../middlewares/checkAdmin";
import verifyToken from "../middlewares/auth";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

// Uncomment line below to create a new ADMIN user
// userRouter.post("/admin", userController.createAdmin);

userRouter.post("/", verifyToken, checkAdmin as any, userController.createUser);
userRouter.get("/", verifyToken, checkAdmin as any, userController.listUsers);
userRouter.get("/:id", verifyToken, userController.getUserById);

export default userRouter;
