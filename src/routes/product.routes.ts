import { Router } from "express";
import verifyToken from "../middlewares/auth";
import ProductController from "../controllers/ProductController";

const productRouter = Router();
const productController = new ProductController();

productRouter.post("/", verifyToken, productController.createProduct);
productRouter.get("/", verifyToken, productController.listProducts);

export default productRouter;
