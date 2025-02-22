import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";
import { Profile } from "../utils/profileEnum";

type dataJwt = JwtPayload & { userId: string; profile: Profile };

export interface AuthRequest extends Request {
  userId: string;
  userProfile: Profile;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    if (!token) {
      throw new AppError("Token não informado", 401);
    }

    const data = jwt.verify(token, process.env.JWT_SECRET ?? "") as dataJwt;

    (req as AuthRequest).userId = data.userId;
    (req as AuthRequest).userProfile = data.profile;

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 401));
    } else {
      next(new AppError("Unknown error", 401));
    }
  }
};

export default verifyToken;
