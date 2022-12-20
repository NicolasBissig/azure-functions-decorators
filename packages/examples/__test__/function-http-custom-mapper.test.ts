import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-custom-mapper', () => {
    it('should return transformed HTTP response', async () => {
        const page = '42';

        const resp = await fetch(BASE_URL + '/custom-mapper?page=' + page);

        expect(resp.status).toBe(201);
        expect(await resp.json()).toEqual({
            message: page,
        });
    });
});
