import { command } from '@robert.tools/cmd';
import { FS } from '@robert.tools/fs';
import { LOG } from '@robert.tools/log';
import type { PLACEHOLDER } from './init.d';

const BLACKLIST = ['node_modules', '.git', 'dist', 'build', 'out', 'coverage'];
const getRepoName = (a: string[]) => a[a.length - 1].replace('.git', '');

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
        repo = getRepoName(details);
    } else if (result.startsWith('https')) {
        const origin = result.split('/');
        host = origin[2];
        user = origin[3];
        repo = getRepoName(origin);
    }

    return { host, user, repo };
};
export const getUserName = () => {
    const result = command(`git config --get user.name`);
    return result;
};
const _ = encodeURIComponent;

export const getGithubInfos = (user: string, repo: string) => {
    const url = `https://api.github.com/repos/${_(user)}/${_(repo)}`;
    const result = command(`curl -s ${url}`);
    const json = JSON.parse(result);
    let description = '';
    let license = '';
    if (json.hasOwnProperty('description')) {
        description = json.description;
    } else {
        LOG.WARN(`No description found for ${user}/${repo} [${json.message}]`);
    }
    if (json.hasOwnProperty('license') && json.license) {
        license = json.license.spdx_id || '';
    }
    return {
        description,
        license,
    };
};
export const getPlaceholderItems = () => {
    const { user, repo } = getRemoteRepoInfo();
    const { description, license } = getGithubInfos(user, repo);
    const author = getUserName();
    const year = new Date().getFullYear().toString();
    return { user, repo, description, license, author, year };
};
export const getItems = () => {
    const data = getPlaceholderItems();
    const items: PLACEHOLDER[] = [
        { key: '<name>', value: data.repo },
        { key: '<description>', value: data.description },
        { key: '<author>', value: data.author },
        { key: '<license>', value: data.license },
        { key: '@robert.tools/sample', value: `@${data.user}/${data.repo}` },
    ];
    return items;
};
export const replaceItems = (file: string, items: PLACEHOLDER[]) => {
    const base = FS.readFile(file) as string;
    let content: string = base || '';
    for (const item of items) {
        const regex = new RegExp(item.key, 'g');
        content = content.replace(regex, item.value);
    }
    FS.writeFile(file, content);
};

export const init = () => {
    const files = FS.list('.').filter((file) => {
        return !BLACKLIST.some((item) => file.includes(item));
    });
    const items = getItems();
    files.map((file) => {
        replaceItems(file, items);
    });
};
