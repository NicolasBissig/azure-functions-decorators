import { HttpFunction, PathParameter } from '../../../src';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

describe('@PathParameter decorator', () => {
    it('passes the path parameter correctly as single argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@PathParameter() page: string): Promise<string> {
                return page;
            }
        }

        const page = '42';
        const context = createContextWithHttpRequest({
            params: {
                page: page,
            },
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual(page);
    });

    it('passes the path parameter correctly as single named argument', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@PathParameter('ID') id: string): Promise<string> {
                return id;
            }
        }

        const id = 'user-id';
        const context = createContextWithHttpRequest({
            params: {
                ID: id,
            },
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual(id);
    });

    it('passes multiple path parameters correctly', async () => {
        class Echo {
            @HttpFunction()
            static async httpTrigger(@PathParameter() size: string, @PathParameter() token: string): Promise<string[]> {
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

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual([size, token]);
    });
});
