import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-body', () => {
    it('should return body', async () => {
        const body = {
            message: 'Hello World!',
        };

        const resp = await fetch(BASE_URL + '/body', {
            method: 'POST',
            body: JSON.stringify(body),
        });

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual(body);
    });
});
