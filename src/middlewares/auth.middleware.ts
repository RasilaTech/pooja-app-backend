import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { verifyAccessToken } from "../utils/jwt";
import { db } from "../models";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone_number: string;
        role: "user" | "admin";
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const tokenFromCookie = req.cookies?.access_token;
  const tokenFromHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const accessToken = tokenFromCookie || tokenFromHeader;
  if (!accessToken) {
    throw new ApiError(
      "Access token not provided",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const payload = verifyAccessToken(accessToken);

  const user = await db.User.findByPk(payload.sub);

  if (!user) {
    throw new ApiError(
      "User not found",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  req.user = {
    id: user.id,
    phone_number: payload.phone_number,
    role: user.role,
  };

  next();
};

export const allowRoles = (...roles: ("user" | "admin")[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(
        "User not authenticated",
        HttpStatusCode.UNAUTHORIZED,
        "Authentication Failed"
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        "User not authorized for this action",
        HttpStatusCode.FORBIDDEN,
        "Access Denied"
      );
    }
    next();
  };
};
