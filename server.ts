import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { initDatabase } from './backend/config/db';
import apiRouter from './backend/routes/apiRouter';

dotenv.config();

async function startServer() {
  await initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '4mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded photos & static assets
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // RESTful API endpoints
  app.use('/api', apiRouter);

  // API error handler
  app.use('/api', (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(400).json({ error: err.message || 'Request error' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FurEver server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
