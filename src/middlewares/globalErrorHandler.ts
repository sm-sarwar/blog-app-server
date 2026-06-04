import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction) {

  let statusCode = 5000;
  let errorMessage = " Internal server error";
  let errorDetails = err;
  
  // PrismaClientValidationError 
    if(err instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      errorMessage = "You provide incorrect filed type or missing field";
      errorDetails = err
    }

  res.status(statusCode);
  res.json(
    {
      message: errorMessage,
      error: errorDetails
    }
  );
}

export default errorHandler;