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
import { json } from 'stream/consumers';

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
        mock({
            'file.txt': 'this is a <name> file with a placeholder: <name>',
            'file.json': `
            { 
                "xxx": "@robert.tools/sample" 
            }
            `,
        });
        const input = [
            {
                key: '<name>',
                value: 'SETUP',
            },
            {
                key: '@robert.tools/sample',
                value: '@robert.tools/SETUP',
            },
        ];
        FN('file.txt', input);
        expect(FS.readFile('file.txt')).toEqual(
            'this is a SETUP file with a placeholder: SETUP'
        );
        FN('file.json', input);
        expect(FS.readFile('file.json')).toEqual(
            `
            { 
                "xxx": "@robert.tools/SETUP" 
            }
            `
        );
    });
});
describe('init()', () => {
    const FN = init;
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
        mock({
            node_modules: {
                'file.json': `
                { "name": "<name>" }
                `,
            },
            src: {
                'test.html': 'this is a <name> file ',
            },
            'README.md': 'this is a <name> file with a placeholder: <name>',
            'package.json': `
            { 
                "name": "<name>",
                "description": "<description>"
            }
            `,
        });
        const spy = jest.spyOn(INIT, 'getPlaceholderItems').mockReturnValue({
            user: 'HORST',
            repo: 'lorem',
            description: 'This is mocked description',
            license: 'MIT',
            author: 'Robert Willemelis',
            year: '2024',
        });
        FN();
        expect(FS.readFile('README.md')).toEqual(
            'this is a lorem file with a placeholder: lorem'
        );
        const json = JSON.parse(FS.readFile('package.json') as string);
        const json2 = JSON.parse(
            FS.readFile('node_modules/file.json') as string
        );
        expect(json.name).toEqual('lorem');
        expect(json.description).toEqual('This is mocked description');
        expect(json2).toEqual({ name: '<name>' });
        expect(FS.readFile('src/test.html') as string).toEqual(
            'this is a lorem file '
        );
        spy.mockRestore();
    });
});
