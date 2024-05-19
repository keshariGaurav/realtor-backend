
import { router as v1PropertyRouter } from './v1/property.routes';
import {router as v1UserRouter} from './v1/user.routes';

import { Router } from 'express';

const rootRouter = Router();
rootRouter.use('/v1/property', v1PropertyRouter);
rootRouter.use('/v1/user', v1UserRouter);


export { rootRouter };
