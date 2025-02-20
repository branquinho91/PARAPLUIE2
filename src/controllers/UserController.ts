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

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, profile, email, password, document, address } = req.body;
      if (!name || !profile || !email || !password || !document) {
        throw new AppError("Name, profile, email, password and document are required!", 400);
      }

      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        throw new AppError("Email already registered!", 409);
      }

      const existingDocument = await this.branchRepository.findOneBy({ document });
      if (existingDocument) {
        throw new AppError("Document already registered!", 409);
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
          fullAddress: address,
          user: user,
        });
      } else if (user.profile === Profile.DRIVER) {
        await this.driverRepository.save({
          document,
          fullAddress: address,
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

  createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        throw new AppError("Name, email and password are required!", 400);
      }

      const existingUser = await this.userRepository.findOneBy({ email });
      if (existingUser) {
        throw new AppError("Email already registered!", 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await this.userRepository.save({
        name,
        profile: Profile.ADMIN,
        email,
        passwordHash,
      });

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

  listUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profile } = req.query;
      let users;
      if (profile) {
        users = await this.userRepository.find({
          where: { profile: profile as Profile },
          order: { name: "ASC" },
        });
      } else {
        users = await this.userRepository.find({
          order: { name: "ASC" },
        });
      }

      res
        .status(200)
        .json(
          users.map((user) => ({
            id: user.id,
            name: user.name,
            status: user.status,
            profile: user.profile,
          })),
        );
    } catch (error) {
      if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError("Unknown error", 500));
      }
    }
  };
}

export default UserController;
