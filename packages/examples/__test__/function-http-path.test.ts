import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

describe('function-http-path', () => {
    it('should return correct path parameter', async () => {
        const id = 'abc:123';

        const resp = await fetch(BASE_URL + '/path/' + id);

        expect(resp.status).toBe(200);
        expect(await resp.text()).toEqual(id);
    });

    it('should return undefined on missing path parameter', async () => {
        const resp = await fetch(BASE_URL + '/path');

        expect(resp.status).toBe(204);
        expect(await resp.text()).toEqual('');
    });
});
