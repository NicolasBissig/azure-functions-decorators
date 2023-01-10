import { QueryParameter, RequestMapping, RestController, toAzureFunction } from '../../../index';
import { createContextWithHttpRequest } from './context';

@RestController()
class QueryParameterEcho {
    @RequestMapping()
    async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
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

        const result = await toAzureFunction(() => new QueryParameterEcho())(context);
        expect(result.body).toEqual(page);
    });

    it('passes multiple query parameters correctly', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(
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

        const result = await toAzureFunction(() => new Echo())(context);
        expect(JSON.parse(result.body)).toEqual([size, token]);
    });

    it('should pass undefined when query parameter is not present', async () => {
        const context = createContextWithHttpRequest({
            query: {},
        });

        const result = await toAzureFunction(() => new QueryParameterEcho())(context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });

    it('should pass undefined when query parameter are not present', async () => {
        const context = createContextWithHttpRequest();

        const result = await toAzureFunction(() => new QueryParameterEcho())(context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });
});
