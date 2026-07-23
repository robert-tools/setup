import {
    getGithubInfos,
    getRemoteRepoInfo,
    getUserName,
    replaceItems,
} from './init';
import * as CMD from '@robert.tools/cmd';
import { FS } from '@robert.tools/fs';
import { LOG } from '@robert.tools/log';
import * as INIT from './init';
import mock from 'mock-fs';
import { init } from './init';

// mocking raw response from command function
const mockResponse = (input: any) => {
    const isObject =
        typeof input === 'object' && input !== null && !Array.isArray(input);
    const value = isObject ? JSON.stringify(input) : input;
    const spy = jest.spyOn(CMD, 'command').mockReturnValue(value);
    return spy;
};

describe('getRemoteRepoInfo()', () => {
    const USER = 'HORST';
    const REPO = 'lorem';
    const PROJECT = 'backend';
    const HOST = 'gitlab.robert.com';
    it('should return an object with user and repo properties', () => {
        const spy = mockResponse(`git@${HOST}:${USER}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = mockResponse(`git@${HOST}:${USER}/${PROJECT}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = jest.spyOn(CMD, 'command').mockReturnValue('');
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual('');
        expect(result.repo).toEqual('');
        expect(result.host).toEqual('');
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = mockResponse(`https://${HOST}/${USER}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = mockResponse(
            `https://${HOST}/${USER}/${PROJECT}/${REPO}.git`
        );
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
});
describe('getUserName()', () => {
    const USER = 'Robert Willemelis';
    const FN = getUserName;
    it('should return the user name', () => {
        const spy = mockResponse(USER);
        const result = FN();
        expect(result).toEqual(USER);
        spy.mockRestore();
    });
    it('should return an empty string', () => {
        const spy = mockResponse('');
        const result = FN();
        expect(result).toEqual('');
        spy.mockRestore();
    });
});
describe('getGithubInfos()', () => {
    const USER = 'HORST';
    const REPO = 'lorem';
    const FN = getGithubInfos;
    const description = 'Lorem ipsum dolor sit amet';
    const license = 'MIT';
    it('should return a description', () => {
        const spy = mockResponse({
            description,
            license: { spdx_id: license },
        });
        const result = FN(USER, REPO);
        expect(result).toEqual({ description, license });
        spy.mockRestore();
    });
    it('should return an empty description', () => {
        const spy = mockResponse({ description: '', license: {} });
        const result = FN(USER, REPO);
        expect(result).toEqual({ description: '', license: '' });
        spy.mockRestore();
    });
    it('should return an empty description and license', () => {
        const logSpy = jest.spyOn(LOG, 'WARN');
        const spy = mockResponse({ message: 'Not Found' });
        const result = FN(USER, REPO);
        expect(result).toEqual({ description: '', license: '' });
        expect(logSpy).toHaveBeenCalledWith(
            `No description found for ${USER}/${REPO} [Not Found]`
        );
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledTimes(1);
        spy.mockRestore();
        logSpy.mockRestore();
    });
});
describe('replaceItems()', () => {
    const FN = replaceItems;
    beforeEach(() => {
        mock.restore();
        mock({});
    });
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
        // readline.cursorTo(process.stdout, 0);
    });
    it('should replace placeholders in a file', () => {
        const oldLib = '@robert.tools/sample';
        const newLib = '@robert.tools/SETUP';
        mock({
            'file.txt': 'this is a <name> file with a placeholder: <name>',
            'file.json': JSON.stringify({ xxx: oldLib }, null, 4),
        });
        const input = [
            {
                key: '<name>',
                value: 'SETUP',
            },
            {
                key: oldLib,
                value: newLib,
            },
        ];
        const changesFileTXT = FN('file.txt', input);
        expect(changesFileTXT).toEqual({
            file: 'file.txt',
            changes: [
                { key: '<name>', value: 'SETUP', count: 2 },
                { key: oldLib, value: newLib, count: 0 },
            ],
        });

        expect(FS.readFile('file.txt')).toEqual(
            'this is a SETUP file with a placeholder: SETUP'
        );
        const changesFileJSON = FN('file.json', input);
        expect(changesFileJSON).toEqual({
            file: 'file.json',
            changes: [
                { key: '<name>', value: 'SETUP', count: 0 },
                { key: oldLib, value: newLib, count: 1 },
            ],
        });
        expect(FS.readFile('file.json')).toEqual(
            JSON.stringify({ xxx: newLib }, null, 4)
        );
    });
});
describe('init()', () => {
    const FN = init;
    const SIZE = FS.sizeContent;
    let spy: jest.SpyInstance;
    beforeEach(() => {
        mock.restore();
        // mock({});
    });
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
        // readline.cursorTo(process.stdout, 0);
    });
    it('should replace placeholders in a file', () => {
        const description = 'Some Modules!'; // same size string to check per size
        const name = 'foobar';
        const package_json = {
            name: '<name>',
            version: '7.8.1',
            description: '<description>',
        };
        const package_lock_json = {
            name: '<name>',
            version: '7.8.1',
        };
        const project_json = {
            name: '<name>',
            '🔖 version': '1.2.3',
            description: '<description>',
        };
        const SRC_TEST = 'src/test.html';
        const PACKAGE_JSON = 'package.json';
        const PACKAGE_LOCK_JSON = 'package-lock.json';
        const README = 'README.md';
        const PROJECT_JSON = 'PROJECT.json';
        const FILE = 'node_modules/file.json';
        const MOCKED_FILES = {
            [FILE]: `{ "name": "<name>" }`,
            foo: 'bla',
            [SRC_TEST]: 'this is a <name> file ',
            [README]: 'this is a <name> file with a placeholder: <name>',
            [PACKAGE_JSON]: JSON.stringify(package_json, null, 4),
            [PACKAGE_LOCK_JSON]: JSON.stringify(package_lock_json, null, 4),
            [PROJECT_JSON]: JSON.stringify(project_json, null, 4),
        };
        mock(MOCKED_FILES);
        const spy = jest.spyOn(INIT, 'getPlaceholderItems').mockReturnValue({
            user: 'HORST',
            repo: name,
            description,
            license: 'MIT',
            author: 'Robert Willemelis',
            year: '2024',
        });
        const oldPackage = FS.readFile(PACKAGE_JSON) as string;
        const oldPackageLock = FS.readFile(PACKAGE_LOCK_JSON) as string;
        const oldFile = FS.readFile(FILE) as string;
        const oldHTML = FS.readFile(SRC_TEST) as string;
        const oldReadme = FS.readFile(README) as string;
        const oldProject = FS.readFile(PROJECT_JSON) as string;
        FN('.');
        // package.json
        const newPackage = FS.readFile(PACKAGE_JSON) as string;
        expect(SIZE(oldPackage)).toEqual(SIZE(newPackage));
        expect(oldPackage).not.toEqual(newPackage);

        // package-lock.json
        const newPackageLock = FS.readFile(PACKAGE_LOCK_JSON) as string;
        expect(SIZE(oldPackageLock)).toEqual(SIZE(newPackageLock));
        expect(oldPackageLock).not.toEqual(newPackageLock);

        // PROJECT.json
        const newProject = FS.readFile(PROJECT_JSON) as string;
        expect(SIZE(oldProject)).toEqual(SIZE(newProject));
        expect(oldProject).not.toEqual(newProject);

        // file.json => no change
        const newFile = FS.readFile(FILE) as string;
        expect(SIZE(oldFile)).toEqual(SIZE(newFile));
        expect(oldFile).toEqual(newFile);

        // test.html
        const newHTML = FS.readFile(SRC_TEST) as string;
        expect(SIZE(oldHTML)).toEqual(SIZE(newHTML));
        expect(oldHTML).not.toEqual(newHTML);

        // README.md
        const newReadme = FS.readFile(README) as string;
        expect(SIZE(oldReadme)).toEqual(SIZE(newReadme));
        expect(oldReadme).not.toEqual(newReadme);
        spy.mockRestore();
    });
});
