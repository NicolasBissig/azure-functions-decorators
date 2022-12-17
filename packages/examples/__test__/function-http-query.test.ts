import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-query', () => {
    it('should return correct query parameter', async () => {
        const page = 42;
        const expectedResponse = {
            page: String(page),
        };

        const resp = await fetch(BASE_URL + '/query?page=' + page);

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual(expectedResponse);
    });

    it('should return undefined on missing path parameter', async () => {
        const expectedResponse = {
            page: undefined,
        };

        const resp = await fetch(BASE_URL + '/query');

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual(expectedResponse);
    });
});
