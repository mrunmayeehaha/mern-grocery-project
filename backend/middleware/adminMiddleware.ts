import { Request, Response, NextFunction } from "express";

const admin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      message: "Admin access required",
    });
  }
};

export default admin;