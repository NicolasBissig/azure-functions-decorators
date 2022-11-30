import { HttpResponse } from '@azure/functions';
import { HttpFunction, QueryParameter, RequestBody } from '../../../src';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

type body = {
    id: number;
};

type echoResponse = {
    body: body;
    queryParameter: Record<string, string>;
};

describe('HTTP function decorators', () => {
    it('can combine multiple decorators', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(
                @RequestBody() body: body,
                @QueryParameter('query') query: string
            ): Promise<HttpResponse> {
                return {
                    body: {
                        body: body,
                        queryParameter: { query: query },
                    } as echoResponse,
                };
            }
        }

        const body: body = { id: 42 };

        const context = createContextWithHttpRequest({
            rawBody: JSON.stringify(body),
            query: {
                query: 'queryValue',
            },
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result.body.body).toEqual(body);
    });

    it('does not allow @HttpFunction on non functions', async () => {
        const createInvalidClass = () => {
            // @ts-ignore
            @HttpFunction()
            // @ts-ignore
            class Bla {}
        };

        expect(createInvalidClass).toThrow('@HttpFunction can only be applied to functions');
    });
});
