import { HttpRequest } from '@azure/functions';
import { Request, RequestMapping, RestController, toAzureFunction } from '../../../index';
import { createContextWithHttpRequest } from './context';

@RestController()
class RequestEcho {
    @RequestMapping()
    async httpTrigger(@Request() request: HttpRequest): Promise<HttpRequest> {
        return request;
    }
}

describe('@Request decorator', () => {
    it('passes the request correctly as single argument', async () => {
        const context = createContextWithHttpRequest();

        const result = await toAzureFunction(() => new RequestEcho())(context);
        expect(JSON.parse(result.body)).toEqual(context.req);
    });
});
