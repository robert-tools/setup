// import { init } from './apps/init/init';

import { init } from './init/init';
import { LOG } from '@robert.tools/log';

let root = '.';
const params = process.argv.slice(2);
if (params.length > 0) {
    root = params[0];
}
LOG.DEBUG(`Root directory: ${root}`);

// init
// const root = command('git rev-parse --show-toplevel').trim();
init(root);
