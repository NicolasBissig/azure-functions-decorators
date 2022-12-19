import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-error', () => {
    it('should return correct error', async () => {
        const expectedError = {
            userId: '123-456',
        };

        const resp = await fetch(BASE_URL + '/error');

        expect(resp.status).toBe(404);
        expect(await resp.json()).toEqual(expectedError);
    });
});
