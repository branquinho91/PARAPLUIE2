import { NextFunction, Request, Response } from "express";
import logger from "../config/winston";

export const handleError = (error: any, _req: Request, res: Response, next: NextFunction) => {
  if (error?.statusCode === 500 || !error?.statusCode) {
    logger.error(error.message);
  }
  res.status(error.statusCode || 500).json({ error: error.message });
};
