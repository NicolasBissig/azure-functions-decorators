import { HttpRequest } from '@azure/functions';
import { HttpFunction, Request } from '../../../index';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

class RequestEcho {
    @HttpFunction()
    static async httpTrigger(@Request() request: HttpRequest): Promise<HttpRequest> {
        return request;
    }
}

describe('@Request decorator', () => {
    it('passes the request correctly as single argument', async () => {
        const context = createContextWithHttpRequest();

        const result = await callAzureFunction(RequestEcho.httpTrigger, context);
        expect(result).toEqual(context.req);
    });
});
