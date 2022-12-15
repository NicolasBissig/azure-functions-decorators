import { Context, HttpRequest, HttpResponse } from '@azure/functions';
import { HttpFunction, QueryParameter, Request, RequestBody } from '../../../index';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';
import { HttpStatus } from '../../../decorators/http/http-status';

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

    it('does not allow @HttpFunction with no arguments', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        // @ts-ignore
        const callWithNoArguments = async () => Echo.httpTrigger();
        await expect(callWithNoArguments).rejects.toThrow(
            '@HttpFunction annotated method httpTrigger was provided no arguments'
        );
    });

    it('does not allow @HttpFunction with non context as argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        const callWithNonContext = async () => Echo.httpTrigger('15');
        await expect(callWithNonContext).rejects.toThrow(
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
        const callWithContextWithoutReq = async () => Echo.httpTrigger({ req: { id: 'abc' } } as unknown as Context);
        await expect(callWithContextWithoutReq).rejects.toThrow(
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
                throw new Error('Internal error thrown');
            }
        }

        const context = createContextWithHttpRequest();

        await expect(() => callAzureFunction(ErrorFunction.httpTrigger, context)).rejects.toThrowError(
            'Internal error thrown'
        );
    });

    it('returns error status for decorated errors', async () => {
        @HttpStatus(404)
        class NotFoundError extends Error {}

        class ErrorFunction {
            @HttpFunction()
            static async httpTrigger(): Promise<HttpResponse> {
                throw new NotFoundError('Entity not found');
            }
        }

        const context = createContextWithHttpRequest();

        const response = await callAzureFunction(ErrorFunction.httpTrigger, context);
        expect(response.status).toEqual(404);
        expect(response.body).toBeUndefined();
    });

    it('returns error status and body for decorated errors', async () => {
        @HttpStatus(404)
        class NotFoundErrorWithPayload extends Error {
            constructor(public readonly message: string, public readonly errorCode: string) {
                super(message);
            }
        }

        class ErrorFunction {
            @HttpFunction()
            static async httpTrigger(): Promise<HttpResponse> {
                throw new NotFoundErrorWithPayload('Entity not found', '1234-1111-001');
            }
        }

        const context = createContextWithHttpRequest();

        const response = await callAzureFunction(ErrorFunction.httpTrigger, context);
        expect(response.status).toEqual(404);
        expect(response.body).toEqual(
            JSON.stringify({
                message: 'Entity not found',
                errorCode: '1234-1111-001',
            })
        );
        expect(response.headers?.['Content-Type']).toEqual('application/json');
    });
});
