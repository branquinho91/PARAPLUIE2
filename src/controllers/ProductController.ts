import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Product } from "../entities/Product";
import { Profile } from "../utils/profileEnum";
import AppError from "../utils/AppError";

class ProductController {
  private branchRepository = AppDataSource.getRepository(Branch);
  private productRepository = AppDataSource.getRepository(Product);

  private checkBranchAccess = (req: Request) => {
    const { userProfile } = req as any;
    if (userProfile !== Profile.BRANCH) {
      throw new AppError("Access Denied: Only a branch can access this route", 401);
    }
  };

  private findBranchByUserId = async (userId: number) => {
    const branch = await this.branchRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!branch) {
      throw new AppError("Branch not found!", 404);
    }
    return branch;
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkBranchAccess(req);

      const { userId } = req as any;
      const branch = await this.findBranchByUserId(Number(userId));

      const { name, amount, description, urlCover } = req.body;
      if (!name || !amount || !description) {
        throw new AppError("Name, amount, description are required!", 400);
      }

      const product = await this.productRepository.save(
        this.productRepository.create({
          name,
          amount,
          description,
          urlCover,
          branch,
        }),
      );

      return res.status(201).json(product);
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 400));
      } else {
        next(new AppError("Unknown error", 400));
      }
    }
  };
}

export default ProductController;
