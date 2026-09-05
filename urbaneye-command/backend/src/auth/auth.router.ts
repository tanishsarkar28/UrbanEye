import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { signToken } from './jwt.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        state: true,
        district: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid government credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid government credentials.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      stateId: user.stateId,
      districtId: user.districtId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        stateId: user.stateId,
        stateName: user.state?.name,
        stateCode: user.state?.code,
        districtId: user.districtId,
        districtName: user.district?.name,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        state: true,
        district: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User record not found.' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      stateId: user.stateId,
      stateName: user.state?.name,
      stateCode: user.state?.code,
      districtId: user.districtId,
      districtName: user.district?.name,
    });
  } catch (err: any) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});
