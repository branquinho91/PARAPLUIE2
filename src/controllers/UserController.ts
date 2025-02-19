import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { Profile } from "../utils/profile";
import AppError from "../utils/AppError";
import bcrypt from "bcrypt";

class UserController {
  private userRepository = AppDataSource.getRepository(User);
  private branchRepository = AppDataSource.getRepository(Branch);
  private driverRepository = AppDataSource.getRepository(Driver);

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, profile, email, password, document, fullAddress } = req.body;
      if (!name || !profile || !email || !password || !document) {
        throw new AppError("Name, profile, email and password are required", 400);
      }

      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        throw new AppError("Email already registered", 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.userRepository.save({
        name,
        profile,
        email,
        passwordHash,
      });

      if (user.profile === Profile.BRANCH) {
        await this.branchRepository.save({
          document,
          fullAddress,
          user: user,
        });
      } else if (user.profile === Profile.DRIVER) {
        await this.driverRepository.save({
          document,
          fullAddress,
          user: user,
        });
      } else {
        throw new AppError("Invalid profile", 400);
      }

      res.status(201).json({ name: user.name, profile: user.profile });
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

export default UserController;
