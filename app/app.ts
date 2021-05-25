import * as Koa from 'koa';
import * as koaBody from 'koa-body';
import * as cors from '@koa/cors';
import * as dotenv from 'dotenv';

import * as serve from 'koa-static';
import { koaSwagger } from 'koa2-swagger-ui';
import * as koaBunyanLogger from 'koa-bunyan-logger';

dotenv.config();

import { config } from './config';
import { routes } from './routes';
import { logger } from './logger';

const app = new Koa();

app.use(koaBody());
app.use(cors());
app.use(koaBunyanLogger(logger));
app.use(koaBunyanLogger.requestLogger());
app.use(koaBunyanLogger.timeContext());
app.use(routes);
app.use(serve('public'));
app.use(
  koaSwagger({
    routePrefix: '/swagger',
    swaggerOptions: {
      url: '/swagger.yml'
    }
  })
);

export const server = app.listen(config.port);

console.log(`Server running on port ${config.port}`);
