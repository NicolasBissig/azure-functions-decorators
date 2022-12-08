import {Context, HttpRequest, HttpResponse} from '@azure/functions';
import {HttpFunction, QueryParameter, Request, RequestBody} from '../../../src';
import {createContextWithHttpRequest} from './context';
import {callAzureFunction} from '../azure-function';

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
                        queryParameter: {query: query},
                    } as echoResponse,
                };
            }
        }

        const body: body = {id: 42};

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
            class Bla {
            }
        };

        expect(createInvalidClass).toThrow('@HttpFunction can only be applied to functions');
    });

    it('does not allow @HttpFunction with no arguments', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        // @ts-ignore
        const callWithNoArguments = () => Echo.httpTrigger();
        expect(callWithNoArguments).toThrow('@HttpFunction annotated method httpTrigger was provided no arguments');
    });

    it('does not allow @HttpFunction with non context as argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        const callWithNonContext = () => Echo.httpTrigger('15');
        expect(callWithNonContext).toThrow(
            '@HttpFunction annotated method httpTrigger was not provided a Context as first argument'
        );
    });

    it('does not allow @HttpFunction with context without req as argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        // @ts-ignore
        const callWithContextWithoutReq = () => Echo.httpTrigger(({req: {id: 'abc'}} as unknown) as Context);
        expect(callWithContextWithoutReq).toThrow(
            '@HttpFunction annotated method httpTrigger was provided a context without or invalid http request'
        );
    });

    it('does not allow @HttpFunction with invalid amount of decorated parameters', async () => {
        const createInvalidClass = () => {
            // @ts-ignore
            class Echo {
                @HttpFunction()
                static async httpTrigger(
                    // @ts-ignore
                    @Request() req: HttpRequest,
                    // @ts-ignore
                    @Request() req2: HttpRequest
                ): Promise<HttpRequest> {
                    return req;
                }
            }
        };

        expect(createInvalidClass).toThrow('only 1 @Request parameter(s) per method is allowed, got 2 on httpTrigger');
    });

    /**
     * Thrown errors are handled by Azure Functions runtime and return a 500 status by default
     */
    it('rethrows uncaught errors', async () => {
        class ErrorFunction {
            @HttpFunction()
            static async httpTrigger(): Promise<HttpResponse> {
                throw new Error('Internal error thrown')
            }
        }

        const context = createContextWithHttpRequest();

        await expect(() => callAzureFunction(ErrorFunction.httpTrigger, context)).rejects.toThrowError('Uncaught error in @HttpFunction')
    });
});
