import fetch from 'node-fetch';
import { BASE_URL } from './test-constants';

const user0 = {
    name: 'user0',
};

const user1 = {
    name: 'user1',
};

describe('function-http-user', () => {
    it('should create first user', async () => {
        const resp = await fetch(BASE_URL + '/user', {
            method: 'POST',
            body: JSON.stringify(user0),
        });

        expect(resp.status).toBe(201);
        expect(resp.headers.get('Location')).toBe('0');
        expect(await resp.json()).toEqual({ ...user0, id: 0 });
    });

    it('should create second user', async () => {
        const resp = await fetch(BASE_URL + '/user', {
            method: 'POST',
            body: JSON.stringify({
                ...user1,
                id: 0, // this id should be ignored by the server
            }),
        });

        expect(resp.status).toBe(201);
        expect(resp.headers.get('Location')).toBe('1');
        expect(await resp.json()).toEqual({ ...user1, id: 1 });
    });

    it('should return all users correctly', async () => {
        const resp = await fetch(BASE_URL + '/user');

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual([
            { ...user0, id: 0 },
            { ...user1, id: 1 },
        ]);
    });

    it('should return single first user correctly', async () => {
        const resp = await fetch(BASE_URL + '/user/' + 0);

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual({ ...user0, id: 0 });
    });

    it('should return single second correctly', async () => {
        const resp = await fetch(BASE_URL + '/user/' + 1);

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual({ ...user1, id: 1 });
    });

    it('should return missing user correctly', async () => {
        const resp = await fetch(BASE_URL + '/user/' + 50);

        expect(resp.status).toBe(404);
        expect(await resp.text()).toEqual('');
    });

    it('should delete user successfully', async () => {
        const resp = await fetch(BASE_URL + '/user/' + 0, {
            method: 'DELETE',
        });

        expect(resp.status).toBe(204);
        expect(await resp.text()).toEqual('');
    });

    it('should return correct user list after deletion', async () => {
        const resp = await fetch(BASE_URL + '/user');

        expect(resp.status).toBe(200);
        expect(await resp.json()).toEqual([{ ...user1, id: 1 }]);
    });
});
