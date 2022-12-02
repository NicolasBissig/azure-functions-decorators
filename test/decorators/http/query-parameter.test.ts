import { HttpFunction, QueryParameter } from '../../../src';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

class QueryParameterEcho {
    @HttpFunction()
    static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

describe('@QueryParameter decorator', () => {
    it('passes the query parameter correctly as single argument', async () => {
        const page = '42';
        const context = createContextWithHttpRequest({
            query: {
                page: page,
            },
        });

        const result = await callAzureFunction(QueryParameterEcho.httpTrigger, context);
        expect(result).toEqual(page);
    });

    it('passes multiple query parameters correctly', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(
                @QueryParameter('size') size: string,
                @QueryParameter('token') token: string
            ): Promise<string[]> {
                return [size, token];
            }
        }

        const size = '15';
        const token = 'abc';
        const context = createContextWithHttpRequest({
            query: {
                size: size,
                token: token,
            },
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual([size, token]);
    });

    it('should pass undefined when query parameter is not present', async () => {
        const context = createContextWithHttpRequest({
            query: {},
        });

        const result = await callAzureFunction(QueryParameterEcho.httpTrigger, context);
        expect(result).toEqual(undefined);
    });

    it('should pass undefined when query parameter are not present', async () => {
        const context = createContextWithHttpRequest();

        const result = await callAzureFunction(QueryParameterEcho.httpTrigger, context);
        expect(result).toEqual(undefined);
    });
});
