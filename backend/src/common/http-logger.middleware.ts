import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Journalise chaque requête HTTP (méthode, route, statut, durée, utilisateur si connu).
 * Nest ne logue par défaut que les événements du framework (démarrage, routes
 * enregistrées) — jamais le trafic lui-même — d'où l'absence de traces exploitables
 * en prod pour diagnostiquer un problème (ex: tentatives de connexion admin).
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const user = (req as unknown as { user?: { sub?: string; role?: string } }).user;
      const who = user ? ` user=${user.sub}(${user.role})` : '';
      const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms${who}`;
      if (res.statusCode >= 500) this.logger.error(line);
      else if (res.statusCode >= 400) this.logger.warn(line);
      else this.logger.log(line);
    });
    next();
  }
}
