import { Context, Next } from 'hono';
import { AuthService } from '../services/auth.service.js';
import { JWTPayload } from '../types/index.js';

export interface AuthContext extends Context {
  user?: JWTPayload;
}

export const authMiddleware = (authService: AuthService) => {
  return async (c: AuthContext, next: Next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.substring(7);

    try {
      const payload = authService.verifyToken(token);
      c.user = payload;
      await next();
    } catch (error) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
  };
};

