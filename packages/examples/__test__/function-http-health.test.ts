import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-health', () => {
    it('should return 204 and empty body', async () => {
        const resp = await fetch(BASE_URL + '/health');

        expect(resp.status).toBe(204);
        expect(await resp.text()).toEqual('');
    });
});
