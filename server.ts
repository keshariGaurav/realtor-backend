
process.on('uncaughtException', (err: Error) => {
    console.log(err.name, err.message);
    process.exit(1);
});

import { logger } from './src/utils/logger/logger';
import { app,server} from './src/app';

server.listen(app.get('port'), () => {
    logger.info(
        'App is running at http://localhost:' +
            app.get('port') +
            ' in ' +
            app.get('env') +
            ' mode'
    );
    logger.info('Press CTRL-C to stop');
});
