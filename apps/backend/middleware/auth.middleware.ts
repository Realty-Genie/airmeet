import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@airmeet/models";

interface JwtPayload {
    id: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                throw new Error("Not authorized, no token");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as unknown as JwtPayload;

            req.user = await User.findById(decoded.id).select("-password");

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};
