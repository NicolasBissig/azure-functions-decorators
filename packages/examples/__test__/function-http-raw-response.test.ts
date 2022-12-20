import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';
import { constants } from 'http2';

describe('function-http-raw-response', () => {
    it('should return untransformed raw http response', async () => {
        const page = '42';

        const resp = await fetch(BASE_URL + '/raw?page=' + page);

        expect(resp.status).toBe(constants.HTTP_STATUS_TEAPOT);
        expect(await resp.json()).toEqual({
            message: page,
        });
    });
});
