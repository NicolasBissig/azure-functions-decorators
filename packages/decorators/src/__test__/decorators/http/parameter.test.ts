import {
    extractPath,
    injectParameters,
    parsePathWithParameters,
    pathWithParametersToRegex,
    REMAINING_PATH,
    toValidPath,
} from '../../../decorators/http/parameters';
import { Context } from '@azure/functions';

describe('extractPath tests', () => {
    it('RemainingPath name should not change', () => {
        expect(REMAINING_PATH).toEqual('RemainingPath');
    });

    it('should extract path correctly', () => {
        const path = '/user/15';
        expect(
            extractPath({
                req: {
                    params: {
                        [REMAINING_PATH]: path,
                    },
                },
            } as unknown as Context)
        ).toEqual(path);
    });

    it('should pass undefined on missing path', () => {
        expect(
            extractPath({
                req: {
                    params: {},
                },
            } as unknown as Context)
        ).toBeUndefined();
    });

    it('extract custom path parameter', () => {
        const customParameter = 'rest';
        const path = '/users';
        expect(
            extractPath(
                {
                    req: {
                        params: {
                            [customParameter]: path,
                        },
                    },
                } as unknown as Context,
                customParameter
            )
        ).toEqual(path);
    });
});

describe('toValidPath tests', () => {
    it('should transform path correctly', () => {
        expect(toValidPath(undefined)).toEqual('/');
        expect(toValidPath('')).toEqual('/');
        expect(toValidPath('user/15')).toEqual('/user/15');
        expect(toValidPath('/user/15')).toEqual('/user/15');
    });
});

describe('parsePathWithParameters tests', () => {
    it('should not fail on invalid input', () => {
        expect(parsePathWithParameters('')).toEqual([]);
    });

    it('should parse simple path with no parameters', () => {
        expect(parsePathWithParameters('/')).toEqual([]);
        expect(parsePathWithParameters('/abc')).toEqual([]);
        expect(parsePathWithParameters('abc')).toEqual([]);
        expect(parsePathWithParameters('/abc/def')).toEqual([]);
    });

    it('should parse path with one parameter', () => {
        expect(parsePathWithParameters('/{userId}')).toEqual([
            {
                index: 1,
                name: 'userId',
            },
        ]);

        expect(parsePathWithParameters('/users/{userId}')).toEqual([
            {
                index: 2,
                name: 'userId',
            },
        ]);
    });

    it('should parse complex path with multiple parameters', () => {
        const path = 'users/{userId}/documents/{documentId}';
        const expected = [
            {
                index: 2,
                name: 'userId',
            },
            {
                index: 4,
                name: 'documentId',
            },
        ];

        expect(parsePathWithParameters(path)).toEqual(expected);

        expect(parsePathWithParameters('/' + path)).toEqual(expected);
    });
});

describe('injectParameters tests', () => {
    it('should inject parameters', () => {
        const path = '/user/{userId}';
        const requestPath = '/user/15';
        const context = {
            req: {
                params: {
                    [REMAINING_PATH]: requestPath,
                },
            },
        } as unknown as Context;
        const expectedContext = {
            req: {
                params: {
                    [REMAINING_PATH]: requestPath,
                    ['userId']: '15',
                },
            },
        } as unknown as Context;

        injectParameters(context, parsePathWithParameters(path));

        expect(context?.req?.params['userId']).toEqual('15');
        expect(context).toEqual(expectedContext);
    });

    it('should not change context if no path', () => {
        const path = '/user/{userId}';
        const originalContext = {
            req: {
                params: {},
            },
        } as unknown as Context;
        const expectedContext = {
            req: {
                params: {},
            },
        } as unknown as Context;

        injectParameters(originalContext, parsePathWithParameters(path));

        expect(originalContext).toEqual(expectedContext);
    });
});

describe('path regex tests', () => {
    it('should create valid regex for "/"', () => {
        const path = '/';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeTruthy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeFalsy();
        expect(regex.test('/users/')).toBeFalsy();
    });

    it('should create valid regex', () => {
        const path = '/users';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeFalsy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeTruthy();
        expect(regex.test('/users/')).toBeFalsy();
        expect(regex.test('/users/15')).toBeFalsy();
    });

    it('should create valid regex', () => {
        const path = '/users/';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeFalsy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeFalsy();
        expect(regex.test('/users/')).toBeTruthy();
        expect(regex.test('/users/15')).toBeFalsy();
    });

    it('should create valid regex with parameter', () => {
        const path = '/users/{userId}';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeFalsy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeFalsy();
        expect(regex.test('/users/')).toBeFalsy();
        expect(regex.test('/users/12a')).toBeTruthy();
        expect(regex.test('/users/2321/')).toBeFalsy();
        expect(regex.test('/users/1234/abc')).toBeFalsy();
    });

    it('should create valid regex with multiple parameters', () => {
        const path = '/users/{userId}/documents/{documentId}/pages';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeFalsy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeFalsy();
        expect(regex.test('/users/')).toBeFalsy();
        expect(regex.test('/users/15')).toBeFalsy();
        expect(regex.test('/users/16/')).toBeFalsy();
        expect(regex.test('/users/17/abc')).toBeFalsy();
        expect(regex.test('/users/18/documents/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages')).toBeTruthy();
        expect(regex.test('/users/18/documents/report/pages/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages/15')).toBeFalsy();
    });

    it('should create valid regex with multiple parameters and optional at the end', () => {
        const path = '/users/{userId}/documents/{documentId}/pages/{page}';
        const regex = pathWithParametersToRegex(path);

        expect(regex.test('/')).toBeFalsy();
        expect(regex.test('')).toBeFalsy();
        expect(regex.test('/users')).toBeFalsy();
        expect(regex.test('/users/')).toBeFalsy();
        expect(regex.test('/users/15')).toBeFalsy();
        expect(regex.test('/users/16/')).toBeFalsy();
        expect(regex.test('/users/17/abc')).toBeFalsy();
        expect(regex.test('/users/18/documents/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages/')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages/15')).toBeTruthy();
        expect(regex.test('/users//documents/report/pages/15')).toBeFalsy();
        expect(regex.test('/users/18/documents/report/pages/15/other')).toBeFalsy();
    });
});
