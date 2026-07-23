// import { init } from './apps/init/init';

import { command } from '@robert.tools/cmd';
import { init } from './apps/init/init';
import { LOG } from '@robert.tools/log';

// init
// const root = command('git rev-parse --show-toplevel').trim();
const root = '.';
LOG.DEBUG(`Root directory: ${root}`);
init(root);
