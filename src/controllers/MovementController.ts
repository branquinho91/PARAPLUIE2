import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { Product } from "../entities/Product";
import { Movement } from "../entities/Movement";
import { Profile } from "../utils/profileEnum";
import { MovementStatus } from "../utils/movementStatusEnum";
import AppError from "../utils/AppError";

class MovementController {
  private branchRepository = AppDataSource.getRepository(Branch);
  private productRepository = AppDataSource.getRepository(Product);
  private movementRepository = AppDataSource.getRepository(Movement);
  private driverRepository = AppDataSource.getRepository(Driver);

  private checkBranchAccess = (req: Request): void => {
    const { userProfile } = req as any;
    if (userProfile !== Profile.BRANCH) {
      throw new AppError("Access Denied: Only a branch can access this route", 401);
    }
  };

  private checkBranchOrDriverAccess = (req: Request): void => {
    const { userProfile } = req as any;
    if (userProfile !== Profile.BRANCH && userProfile !== Profile.DRIVER) {
      throw new AppError("Access Denied: Only a branch or driver can access this route", 401);
    }
  };

  private checkDriverAccess = (req: Request): void => {
    const { userProfile } = req as any;
    if (userProfile !== Profile.DRIVER) {
      throw new AppError("Access Denied: Only a driver can access this route", 401);
    }
  };

  private findBranchByUserId = async (userId: number): Promise<Branch> => {
    const branch = await this.branchRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!branch) {
      throw new AppError("Branch not found!", 404);
    }
    return branch;
  };

  private findDriverByUserId = async (userId: number): Promise<Driver> => {
    const driver = await this.driverRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!driver) {
      throw new AppError("Driver not found!", 404);
    }
    return driver;
  };

  createMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkBranchAccess(req);

      const { userId } = req as any;
      const branch = await this.findBranchByUserId(Number(userId));

      const { destinationBranchId, productId, quantity } = req.body;
      if (!destinationBranchId || !productId || !quantity) {
        throw new AppError("Destination Branch ID, Product ID and quantity are required!", 400);
      }

      const destinationBranch = await this.branchRepository.findOne({
        where: { id: Number(destinationBranchId) },
      });
      if (!destinationBranch) {
        throw new AppError("Destination Branch not found!", 404);
      }
      if (destinationBranch.id === branch.id) {
        throw new AppError("Destination Branch cannot be the same as the source Branch!", 400);
      }

      const product = await this.productRepository.findOne({
        where: { id: Number(productId), branch: { id: branch.id } },
      });
      if (!product) {
        throw new AppError("Product not found!", 404);
      }
      if (product.amount < quantity || quantity <= 0) {
        throw new AppError("Invalid quantity!", 400);
      }
      product.amount -= quantity;
      await this.productRepository.save(product);

      const movement = this.movementRepository.create({
        destinationBranch,
        product,
        quantity,
      });
      await this.movementRepository.save(movement);

      res.status(201).json(movement);
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

  listMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkBranchOrDriverAccess(req);

      const movements = await this.movementRepository.find({
        relations: ["product", "destinationBranch"],
      });

      res.status(200).json(movements);
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

  startMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkDriverAccess(req);

      const { userId } = req as any;
      const driver = await this.findDriverByUserId(Number(userId));

      const { id: movementId } = req.params;
      if (!movementId) {
        throw new AppError("Movement ID is required!", 400);
      }

      const movement = await this.movementRepository.findOne({
        where: {
          id: Number(movementId),
        },
      });
      if (!movement) {
        throw new AppError("Movement not found!", 404);
      }
      if (movement.status !== MovementStatus.PENDING) {
        throw new AppError("Movement is not pending!", 400);
      }

      movement.driver = driver;
      movement.status = MovementStatus.IN_PROGRESS;
      await this.movementRepository.save(movement);

      res.status(200).json(movement);
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

  finishMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkDriverAccess(req);

      const { userId } = req as any;
      const driver = await this.findDriverByUserId(Number(userId));

      const { id: movementId } = req.params;
      if (!movementId) {
        throw new AppError("Movement ID is required!", 400);
      }

      const movement = await this.movementRepository.findOne({
        where: {
          id: Number(movementId),
        },
        relations: ["product", "destinationBranch", "driver"],
      });
      if (!movement) {
        throw new AppError("Movement not found!", 404);
      }
      if (movement.status !== MovementStatus.IN_PROGRESS) {
        throw new AppError("Movement is not in progress!", 400);
      }
      if (movement.driver.id !== driver.id) {
        throw new AppError("Driver is not assigned to this movement!", 400);
      }

      movement.status = MovementStatus.FINISHED;
      await this.movementRepository.save(movement);

      const destinationProduct = await this.productRepository.findOne({
        where: { id: movement.product.id, branch: { id: movement.destinationBranch.id } },
      });

      if (destinationProduct) {
        destinationProduct.amount += movement.quantity;
        await this.productRepository.save(destinationProduct);
      } else {
        const newProduct = this.productRepository.create({
          name: movement.product.name,
          amount: movement.quantity,
          description: movement.product.description,
          urlCover: movement.product.urlCover,
          branch: movement.destinationBranch,
        });
        await this.productRepository.save(newProduct);
      }

      res.status(200).json(movement);
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

export default MovementController;
