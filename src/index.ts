// import { init } from './apps/init/init';

import { command } from '@robert.tools/cmd';
import { init } from './apps/init/init';

// init
const root = command('git rev-parse --show-toplevel').trim();
init(root);
