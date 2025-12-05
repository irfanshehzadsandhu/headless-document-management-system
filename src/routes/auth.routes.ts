import { Hono } from 'hono';
import { AuthService } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../validations/schemas.js';

export function createAuthRoutes(authService: AuthService) {
  const app = new Hono();

  app.post('/register', async (c) => {
    try {
      const body = await c.req.json();
      const validated = registerSchema.parse(body);
      
      const result = await authService.register(validated.email, validated.password);
      return c.json(result, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Registration failed' }, 400);
    }
  });

  app.post('/login', async (c) => {
    try {
      const body = await c.req.json();
      const validated = loginSchema.parse(body);
      
      const result = await authService.login(validated.email, validated.password);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 401);
      }
      return c.json({ error: 'Login failed' }, 401);
    }
  });

  return app;
}

