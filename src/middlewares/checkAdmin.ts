import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";
import AppError from "../utils/AppError";
import { Profile } from "../utils/profile";

export const checkAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.userProfile !== Profile.ADMIN) {
    return next(new AppError("Access Denied: Only ADMIN can access this route", 403));
  }
  next();
};
