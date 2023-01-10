import { Context, HttpRequest, HttpResponse } from '@azure/functions';
import { QueryParameter, Request, RequestBody, RequestMapping, RestController, toAzureFunction } from '../../../index';
import { createContextWithHttpRequest } from './context';
import { HttpStatus } from '../../../decorators/http/http-status';

type body = {
    id: number;
};

type echoResponse = {
    body: body;
    queryParameter: Record<string, string>;
};

describe('@RequestMapping decorator', () => {
    it('can combine multiple decorators', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(
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

        const result = await toAzureFunction(() => new Echo())(context);
        expect(result.body.body).toEqual(body);
    });

    it('does not allow @RequestMapping on non functions', async () => {
        const createInvalidClass = () => {
            // @ts-ignore
            @RequestMapping()
            // @ts-ignore
            class Bla {}
        };

        expect(createInvalidClass).toThrow('@RequestMapping can only be applied to functions');
    });

    it('returns not found on invalid arguments', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        // @ts-ignore
        const result = await toAzureFunction(() => new Echo())();

        expect(result).toEqual({
            status: 404,
            statusCode: 404,
        });
    });

    it('returns not found with non context as argument', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        // @ts-ignore
        const result = await toAzureFunction(() => new Echo())('15');

        expect(result).toEqual({
            status: 404,
            statusCode: 404,
        });
    });

    it('does not allow @RequestMapping with context without req as argument', async () => {
        @RestController()
        class Echo {
            @RequestMapping()
            async httpTrigger(@QueryParameter('page') page: string): Promise<string> {
                return page;
            }
        }

        const result = await toAzureFunction(() => new Echo())({
            req: { id: 'abc' },
        } as unknown as Context);

        expect(result).toEqual({
            status: 404,
            statusCode: 404,
        });
    });

    it('does not allow @RequestMapping with invalid amount of decorated parameters', async () => {
        const createInvalidClass = () => {
            @RestController()
            // @ts-ignore
            class Echo {
                @RequestMapping()
                async httpTrigger(
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
        @RestController()
        class ErrorFunction {
            @RequestMapping()
            async httpTrigger(): Promise<HttpResponse> {
                throw new Error('Internal error thrown');
            }
        }

        const context = createContextWithHttpRequest();

        await expect(() => toAzureFunction(() => new ErrorFunction())(context)).rejects.toThrowError(
            'Internal error thrown'
        );
    });

    it('returns error status for decorated errors', async () => {
        @HttpStatus(404)
        class NotFoundError extends Error {}

        @RestController()
        class ErrorFunction {
            @RequestMapping()
            async httpTrigger(): Promise<HttpResponse> {
                throw new NotFoundError('Entity not found');
            }
        }

        const context = createContextWithHttpRequest();

        const response = await toAzureFunction(() => new ErrorFunction())(context);
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

        @RestController()
        class ErrorFunction {
            @RequestMapping()
            async httpTrigger(): Promise<HttpResponse> {
                throw new NotFoundErrorWithPayload('Entity not found', '1234-1111-001');
            }
        }

        const context = createContextWithHttpRequest();

        const response = await toAzureFunction(() => new ErrorFunction())(context);
        expect(response.status).toEqual(404);
        expect(response.body).toEqual(
            JSON.stringify({
                message: 'Entity not found',
                errorCode: '1234-1111-001',
            })
        );
        expect(response.headers?.['Content-Type']).toEqual('application/json');
    });

    it('applies the result transformer correctly', async () => {
        const message = 'Hello World!';

        @RestController()
        class ResultTransformer {
            @RequestMapping('/', {
                ResultMapper: (result: string) => {
                    return {
                        body: { message: result },
                    };
                },
            })
            async httpTrigger(): Promise<string> {
                return message;
            }
        }

        const context = createContextWithHttpRequest();
        const response = await toAzureFunction(() => new ResultTransformer())(context);
        expect(response.body).toEqual({
            message: message,
        });
    });
});
