import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@airmeet/models";

export class AuthController {
    static async register(req: Request, res: Response) {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please add all fields" });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: AuthController.generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password as string))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: AuthController.generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    }

    static generateToken(id: string) {
        return jwt.sign({ id }, process.env.JWT_SECRET!, {
            expiresIn: "30d",
        });
    }
}
