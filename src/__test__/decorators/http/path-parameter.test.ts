import { HttpFunction, PathParameter } from '../../../index';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

class PathParameterEcho {
    @HttpFunction()
    static async httpTrigger(@PathParameter('page') page: string): Promise<string> {
        return page;
    }
}

describe('@PathParameter decorator', () => {
    it('passes the path parameter correctly as single argument', async () => {
        const page = '42';
        const context = createContextWithHttpRequest({
            params: {
                page: page,
            },
        });

        const result = await callAzureFunction(PathParameterEcho.httpTrigger, context);
        expect(result).toEqual(page);
    });

    it('passes multiple path parameters correctly', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(
                @PathParameter('size') size: string,
                @PathParameter('token') token: string
            ): Promise<string[]> {
                return [size, token];
            }
        }

        const size = '15';
        const token = 'abc';
        const context = createContextWithHttpRequest({
            params: {
                size: size,
                token: token,
            },
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual([size, token]);
    });

    it('should pass undefined when path parameter is not present', async () => {
        const context = createContextWithHttpRequest({
            params: {},
        });

        const result = await callAzureFunction(PathParameterEcho.httpTrigger, context);
        expect(result).toEqual(undefined);
    });

    it('should pass undefined when params are not present', async () => {
        const context = createContextWithHttpRequest();

        const result = await callAzureFunction(PathParameterEcho.httpTrigger, context);
        expect(result).toEqual(undefined);
    });
});
