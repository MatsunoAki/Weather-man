import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    user?: {userId: string};
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = { userId: (verified as any).userId };
    
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};


