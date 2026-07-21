import { getRemoteRepoInfo } from './init';
import * as CMD from '@robert.tools/cmd';

describe('getRemoteRepoInfo', () => {
    const USER = 'HORST';
    const REPO = 'lorem';
    const PROJECT = 'backend';
    const HOST = 'gitlab.robert.com';
    it('should return an object with user and repo properties', () => {
        const spy = jest
            .spyOn(CMD, 'command')
            .mockReturnValue(`git@${HOST}:${USER}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = jest
            .spyOn(CMD, 'command')
            .mockReturnValue(`git@${HOST}:${USER}/${PROJECT}/${REPO}.git`);
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
        const spy = jest
            .spyOn(CMD, 'command')
            .mockReturnValue(`https://${HOST}/${USER}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
    it('should return an object with user and repo properties', () => {
        const spy = jest
            .spyOn(CMD, 'command')
            .mockReturnValue(`https://${HOST}/${USER}/${PROJECT}/${REPO}.git`);
        const result = getRemoteRepoInfo();
        expect(result.user).toEqual(USER);
        expect(result.repo).toEqual(REPO);
        expect(result.host).toEqual(HOST);
        spy.mockRestore();
    });
});
