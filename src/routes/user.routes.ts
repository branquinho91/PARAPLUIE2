import { Router } from "express";
import verifyToken from "../middlewares/auth";
import UserController from "../controllers/UserController";

const userRouter = Router();
const userController = new UserController();

// Uncomment line below to create a new ADMIN user
// userRouter.post("/admin", userController.createAdmin);

userRouter.post("/", verifyToken, userController.createUser);
userRouter.get("/", verifyToken, userController.listUsers);
userRouter.get("/:id", verifyToken, userController.getUserById);
userRouter.put("/:id", verifyToken, userController.updateUser);
userRouter.patch("/:id/status", verifyToken, userController.changeUserStatus);

export default userRouter;
