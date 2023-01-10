import { PathParameter, RequestMapping, RestController, toAzureFunction } from '../../../index';
import { createContextWithHttpRequest } from './context';

@RestController()
class PathParameterEcho {
    @RequestMapping()
    async httpTrigger(@PathParameter('page') page: string): Promise<string> {
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

        const result = await toAzureFunction(() => new PathParameterEcho())(context);
        expect(result.body).toEqual(page);
    });

    it('passes multiple path parameters correctly', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(
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

        const result = await toAzureFunction(() => new Echo())(context);
        expect(JSON.parse(result.body)).toEqual([size, token]);
    });

    it('should pass undefined when path parameter is not present', async () => {
        const context = createContextWithHttpRequest({
            params: {},
        });

        const result = await toAzureFunction(() => new PathParameterEcho())(context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });

    it('should pass undefined when params are not present', async () => {
        const context = createContextWithHttpRequest();

        const result = await toAzureFunction(() => new PathParameterEcho())(context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });
});
