import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import AppError from "../utils/AppError";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class AuthController {
  private userRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
      }

      const jwtPayload = { userId: user.id, profile: user.profile };

      const jwtSecret = process.env.JWT_SECRET ?? "";

      const token = jwt.sign(jwtPayload, jwtSecret, { expiresIn: "400h" });

      res.status(200).json({ token, name: user.name, profile: user.profile });
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500));
      } else {
        next(new AppError("Unknown error", 500));
      }
    }
  };
}

export default AuthController;
