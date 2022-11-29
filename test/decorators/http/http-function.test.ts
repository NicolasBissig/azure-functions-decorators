import { Context, HttpRequest, HttpResponse } from '@azure/functions';
import { HttpFunction, RequestBody, QueryParameter } from '../../../src';

type body = {
    id: number;
};

type echoResponse = {
    body: body;
    queryParameter: Record<string, string>;
};

class Echo {
    @HttpFunction()
    static async httpTrigger(@RequestBody() body: body, @QueryParameter('query') query: string): Promise<HttpResponse> {
        return {
            body: {
                body: body,
                queryParameter: { query: query },
            } as echoResponse,
        };
    }
}

describe('HTTP function decorators', () => {
    it('works', async () => {
        const body: body = { id: 42 };

        const context = ({
            req: ({
                method: 'GET',
                rawBody: JSON.stringify(body),
                query: {
                    query: 'queryValue',
                },
            } as unknown) as HttpRequest,
        } as unknown) as Context;

        // @ts-ignore
        const result = await Echo.httpTrigger(context);
        expect(result.body.body).toEqual(body);
    });
});
