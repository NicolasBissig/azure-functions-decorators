import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-path', () => {
    it('should return correct path parameter', async () => {
        const id = 'abc:123';
        const expectedResponse = {
            parameter: id,
        };

        const resp = await fetch(BASE_URL + '/path/' + id);

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual(expectedResponse);
    });

    it('should return undefined on missing path parameter', async () => {
        const expectedResponse = {
            parameter: undefined,
        };

        const resp = await fetch(BASE_URL + '/path');

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual(expectedResponse);
    });
});
