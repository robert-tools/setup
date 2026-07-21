import { command } from '@robert.tools/cmd';

export const getRemoteRepoInfo = () => {
    let host = '';
    let user = '';
    let repo = '';
    const result = command(`git config --get remote.origin.url`);
    if (result.startsWith('git')) {
        const origin = result.split(':');
        host = origin[0].replace('git@', '');
        const details = origin[1].split('/');
        user = details[0];
        repo = details[details.length - 1].replace('.git', '');
    } else if (result.startsWith('https')) {
        const origin = result.split('/');
        host = origin[2];
        user = origin[3];
        repo = origin[origin.length - 1].replace('.git', '');
    }

    return {
        host,
        user,
        repo,
    };
};
