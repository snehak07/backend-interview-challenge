import { Router, Request, Response } from 'express';
import { SyncService } from '../services/syncService';
import { TaskService } from '../services/taskService';
import { Database } from '../db/database';
import { BatchSyncRequest } from '../types';

export function createSyncRouter(db: Database): Router {
  const router = Router();
  const taskService = new TaskService(db);
  const syncService = new SyncService(db, taskService);

  // Trigger manual sync
  router.post('/sync', async (_req: Request, res: Response) => {
    try {
      const result = await syncService.triggerSync();
      return res.json(result);
    } catch (err) {
      if (err instanceof Error)
        return res.status(500).json({ error: err.message });
      return res.status(500).json({ error: 'Unknown error' });
    }
  });

  // Check sync status
  router.get('/status', async (_req: Request, res: Response) => {
   try {
      const status = await syncService.getStatus();
      return res.json(status);
    } catch (err) {
      if (err instanceof Error)
        return res.status(500).json({ error: err.message });
      return res.status(500).json({ error: 'Unknown error' });
    }
  });

  // Batch sync endpoint (for server-side)
  router.post('/batch', async (req: Request<
        Record<string, never>,
        Record<string, never>,
        BatchSyncRequest
      >, 
      res: Response,
    ) => {
   try {
        const body = req.body;
        const result = await syncService.processBatch(body);
        return res.json(result);
      } catch (err) {
        if (err instanceof Error)
          return res.status(500).json({ error: err.message });
        return res.status(500).json({ error: 'Unknown error' });
      }
    },
  );

  // Health check endpoint
  router.get('/health', async (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}