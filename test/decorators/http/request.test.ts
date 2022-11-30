import { HttpRequest } from '@azure/functions';
import { HttpFunction, Request } from '../../../src';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

describe('@Request decorator', () => {
    it('passes the request correctly as single argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@Request() request: HttpRequest): Promise<HttpRequest> {
                return request;
            }
        }

        const context = createContextWithHttpRequest();

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual(context.req);
    });
});
