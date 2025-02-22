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

  private checkAdminAccess(req: Request) {
    const { userProfile } = req as any;
    if (userProfile !== Profile.ADMIN) {
      throw new AppError("Access Denied: Only an admin can access this route", 401);
    }
  }

  private checkAdminOrDriverAccess(req: Request) {
    const { userProfile, userId } = req as any;
    const { id } = req.params;

    if (
      userProfile !== Profile.ADMIN &&
      (userProfile !== Profile.DRIVER || userId !== Number(id))
    ) {
      throw new AppError(
        "Access Denied: Only the logged-in driver or an admin can access this route",
        401,
      );
    }
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAdminAccess(req);

      const { name, profile, email, password, document, address } = req.body;
      if (!name || !profile || !email || !password || !document) {
        throw new AppError("Name, profile, email, password, and document are required!", 400);
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
      this.checkAdminAccess(req);

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

      res.status(200).json(
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

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAdminOrDriverAccess(req);

      const { id } = req.params;
      const user = await this.userRepository.findOneBy({ id: Number(id) });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        status: user.status,
        profile: user.profile,
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 404));
      } else {
        next(new AppError("Unknown error", 404));
      }
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAdminOrDriverAccess(req);

      const { id } = req.params;
      const { name, email, password, fullAddress } = req.body;

      const user = await this.userRepository.findOneBy({ id: Number(id) });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.name = name || user.name;
      user.email = email || user.email;
      if (password) {
        user.passwordHash = await bcrypt.hash(password, 10);
      }

      await this.userRepository.save(user);

      if (fullAddress) {
        if (user.profile === Profile.BRANCH) {
          await this.updateBranchAddress(user, fullAddress);
        } else if (user.profile === Profile.DRIVER) {
          await this.updateDriverAddress(user, fullAddress);
        }
      }

      res.status(200).json({
        message: "User updated successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 404));
      } else {
        next(new AppError("Unknown error", 404));
      }
    }
  };

  changeUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      this.checkAdminAccess(req);

      const { id } = req.params;
      const user = await this.userRepository.findOneBy({ id: Number(id) });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      user.status = !user.status;
      await this.userRepository.save(user);

      res.status(200).json({
        message: "User status updated successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 404));
      } else {
        next(new AppError("Unknown error", 404));
      }
    }
  };

  private updateBranchAddress = async (user: User, fullAddress: string) => {
    const branch = await this.branchRepository.findOneBy({ user });
    if (branch) {
      branch.fullAddress = fullAddress;
      await this.branchRepository.save(branch);
    }
  };

  private updateDriverAddress = async (user: User, fullAddress: string) => {
    const driver = await this.driverRepository.findOneBy({ user });
    if (driver) {
      driver.fullAddress = fullAddress;
      await this.driverRepository.save(driver);
    }
  };
}

export default UserController;
