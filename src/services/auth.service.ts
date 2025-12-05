import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { IUserRepository } from '../repositories/interfaces.js';
import { JWTPayload } from '../types/index.js';

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(
    private userRepository: IUserRepository,
    jwtSecret?: string,
    jwtExpiresIn?: string
  ) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpiresIn = jwtExpiresIn || process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(email: string, password: string): Promise<{ user: { id: string; email: string }; token: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      id: uuidv4(),
      email,
      passwordHash,
    });

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  async login(email: string, password: string): Promise<{ user: { id: string; email: string }; token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

