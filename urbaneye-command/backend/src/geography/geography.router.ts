import { Router, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const geographyRouter = Router();

/**
 * List all states with district count & active bus count
 */
geographyRouter.get('/states', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = {};
    if (req.user!.role === 'STATE_ADMIN') {
      whereClause.id = req.user!.stateId;
    }

    const states = await prisma.state.findMany({
      where: whereClause,
      include: {
        districts: {
          select: {
            id: true,
            code: true,
            name: true,
            centerLat: true,
            centerLon: true,
            _count: {
              select: {
                events: true,
                sessions: { where: { status: 'PAIRED' } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(states);
  } catch (err: any) {
    console.error('List states error:', err);
    res.status(500).json({ error: 'Failed to retrieve states.' });
  }
});

/**
 * List districts for a state
 */
geographyRouter.get('/states/:stateId/districts', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stateId } = req.params;

    if (req.user!.role === 'STATE_ADMIN' && req.user!.stateId !== stateId) {
      res.status(403).json({ error: 'Access Denied: You can only query districts within your assigned state.' });
      return;
    }

    const districts = await prisma.district.findMany({
      where: { stateId },
      include: {
        _count: {
          select: {
            events: true,
            sessions: { where: { status: 'PAIRED' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(districts);
  } catch (err: any) {
    console.error('List districts error:', err);
    res.status(500).json({ error: 'Failed to retrieve districts.' });
  }
});

/**
 * Get district details
 */
geographyRouter.get('/districts/:id', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user!.role === 'DISTRICT_HEAD' && req.user!.districtId !== id) {
      res.status(403).json({ error: 'Access Denied: You are restricted to your assigned district.' });
      return;
    }

    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        state: true,
        _count: {
          select: {
            events: true,
            sessions: { where: { status: 'PAIRED' } },
          },
        },
      },
    });

    if (!district) {
      res.status(404).json({ error: 'District not found.' });
      return;
    }

    res.json(district);
  } catch (err: any) {
    console.error('Get district error:', err);
    res.status(500).json({ error: 'Failed to fetch district details.' });
  }
});

/**
 * National Admin Live Aggregated Rollup
 * Real database aggregation of all states, active buses, and defect status counts
 */
geographyRouter.get('/national/summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const states = await prisma.state.findMany({
      include: {
        districts: {
          select: {
            id: true,
            code: true,
            name: true,
            centerLat: true,
            centerLon: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const stateSummaries = await Promise.all(
      states.map(async (st) => {
        const districtIds = st.districts.map((d) => d.id);

        const [
          totalDefects,
          newDefects,
          assignedDefects,
          resolvedDefects,
          activeBusSessions,
        ] = await Promise.all([
          prisma.roadEvent.count({ where: { districtId: { in: districtIds } } }),
          prisma.roadEvent.count({ where: { districtId: { in: districtIds }, status: 'NEW' } }),
          prisma.roadEvent.count({ where: { districtId: { in: districtIds }, status: 'ASSIGNED_FOR_REPAIR' } }),
          prisma.roadEvent.count({ where: { districtId: { in: districtIds }, status: 'RESOLVED' } }),
          prisma.busDeviceSession.findMany({
            where: { districtId: { in: districtIds }, status: 'PAIRED' },
            select: { busLabel: true },
          }),
        ]);

        const activeBusesCount = new Set(
          activeBusSessions.map((s) => s.busLabel?.trim()).filter(Boolean)
        ).size;

        const unresolved = totalDefects - resolvedDefects;
        const roadHealthScore = Math.max(
          15,
          Math.min(100, Math.round(100 - unresolved * 1.5 + resolvedDefects * 0.8))
        );

        return {
          id: st.id,
          code: st.code,
          name: st.name,
          centerLat: st.centerLat,
          centerLon: st.centerLon,
          districtsCount: st.districts.length,
          totalDefects,
          newDefects,
          assignedDefects,
          resolvedDefects,
          activeBusesCount,
          roadHealthScore,
        };
      })
    );

    const totals = stateSummaries.reduce(
      (acc, curr) => ({
        totalActiveBuses: acc.totalActiveBuses + curr.activeBusesCount,
        totalNewDefects: acc.totalNewDefects + curr.newDefects,
        totalAssignedDefects: acc.totalAssignedDefects + curr.assignedDefects,
        totalResolvedDefects: acc.totalResolvedDefects + curr.resolvedDefects,
        totalDefects: acc.totalDefects + curr.totalDefects,
        healthSum: acc.healthSum + curr.roadHealthScore,
      }),
      {
        totalActiveBuses: 0,
        totalNewDefects: 0,
        totalAssignedDefects: 0,
        totalResolvedDefects: 0,
        totalDefects: 0,
        healthSum: 0,
      }
    );

    const averageRoadHealthIndex =
      stateSummaries.length > 0 ? Math.round(totals.healthSum / stateSummaries.length) : 100;

    res.json({
      states: stateSummaries,
      summary: {
        totalActiveBuses: totals.totalActiveBuses,
        totalNewDefects: totals.totalNewDefects,
        totalAssignedDefects: totals.totalAssignedDefects,
        totalResolvedDefects: totals.totalResolvedDefects,
        totalDefects: totals.totalDefects,
        averageRoadHealthIndex,
      },
    });
  } catch (err: any) {
    console.error('National summary error:', err);
    res.status(500).json({ error: 'Failed to retrieve national aggregate summary.' });
  }
});

/**
 * State Admin Live District Rollup
 * Real database aggregation of all districts within a state
 */
geographyRouter.get('/states/:stateId/summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stateId } = req.params;

    if (req.user!.role === 'STATE_ADMIN' && req.user!.stateId !== stateId) {
      res.status(403).json({ error: 'Access Denied: You are restricted to your assigned state.' });
      return;
    }

    const state = await prisma.state.findUnique({
      where: { id: stateId },
      include: {
        districts: {
          select: {
            id: true,
            code: true,
            name: true,
            centerLat: true,
            centerLon: true,
          },
        },
      },
    });

    if (!state) {
      res.status(404).json({ error: 'State not found.' });
      return;
    }

    const districtSummaries = await Promise.all(
      state.districts.map(async (dist) => {
        const [
          totalDefects,
          newDefects,
          assignedDefects,
          resolvedDefects,
          activeBusSessions,
        ] = await Promise.all([
          prisma.roadEvent.count({ where: { districtId: dist.id } }),
          prisma.roadEvent.count({ where: { districtId: dist.id, status: 'NEW' } }),
          prisma.roadEvent.count({ where: { districtId: dist.id, status: 'ASSIGNED_FOR_REPAIR' } }),
          prisma.roadEvent.count({ where: { districtId: dist.id, status: 'RESOLVED' } }),
          prisma.busDeviceSession.findMany({
            where: { districtId: dist.id, status: 'PAIRED' },
            select: { busLabel: true },
          }),
        ]);

        const activeBusesCount = new Set(
          activeBusSessions.map((s) => s.busLabel?.trim()).filter(Boolean)
        ).size;

        const unresolved = totalDefects - resolvedDefects;
        const roadHealthScore = Math.max(
          15,
          Math.min(100, Math.round(100 - unresolved * 1.5 + resolvedDefects * 0.8))
        );

        return {
          id: dist.id,
          code: dist.code,
          name: dist.name,
          centerLat: dist.centerLat,
          centerLon: dist.centerLon,
          totalDefects,
          newDefects,
          assignedDefects,
          resolvedDefects,
          activeBusesCount,
          roadHealthScore,
        };
      })
    );

    const totals = districtSummaries.reduce(
      (acc, curr) => ({
        totalActiveBuses: acc.totalActiveBuses + curr.activeBusesCount,
        totalNewDefects: acc.totalNewDefects + curr.newDefects,
        totalAssignedDefects: acc.totalAssignedDefects + curr.assignedDefects,
        totalResolvedDefects: acc.totalResolvedDefects + curr.resolvedDefects,
        totalDefects: acc.totalDefects + curr.totalDefects,
        healthSum: acc.healthSum + curr.roadHealthScore,
      }),
      {
        totalActiveBuses: 0,
        totalNewDefects: 0,
        totalAssignedDefects: 0,
        totalResolvedDefects: 0,
        totalDefects: 0,
        healthSum: 0,
      }
    );

    const averageRoadHealthIndex =
      districtSummaries.length > 0 ? Math.round(totals.healthSum / districtSummaries.length) : 100;

    res.json({
      state: {
        id: state.id,
        code: state.code,
        name: state.name,
        centerLat: state.centerLat,
        centerLon: state.centerLon,
      },
      districts: districtSummaries,
      summary: {
        totalActiveBuses: totals.totalActiveBuses,
        totalNewDefects: totals.totalNewDefects,
        totalAssignedDefects: totals.totalAssignedDefects,
        totalResolvedDefects: totals.totalResolvedDefects,
        totalDefects: totals.totalDefects,
        averageRoadHealthIndex,
      },
    });
  } catch (err: any) {
    console.error('State summary error:', err);
    res.status(500).json({ error: 'Failed to retrieve state aggregate summary.' });
  }
});

