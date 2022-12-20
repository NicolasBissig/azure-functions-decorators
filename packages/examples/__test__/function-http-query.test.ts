import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-query', () => {
    it('should return correct query parameter', async () => {
        const page = 42;

        const resp = await fetch(BASE_URL + '/query?page=' + page);

        expect(resp.status).toBe(200);
        expect(await resp.text()).toEqual(String(page));
    });

    it('should return undefined on missing path parameter', async () => {
        const resp = await fetch(BASE_URL + '/query');

        expect(resp.status).toBe(204);
        expect(await resp.text()).toEqual('');
    });
});
