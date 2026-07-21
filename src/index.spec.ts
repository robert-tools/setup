import { setup } from './index';

describe('@robert.tools/setup', () => {
    it('should return a setup string', () => {
        expect(setup('hello')).toBe('setup: hello');
    });

    it('should return a setup string with empty input', () => {
        expect(setup('')).toBe('setup: ');
    });
});
