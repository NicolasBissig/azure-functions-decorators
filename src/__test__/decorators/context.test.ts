import { Context as AzureContext } from '@azure/functions';
import { Context, HttpFunction, PathParameter } from '../../index';
import { createContextWithHttpRequest } from './http/context';
import { callAzureFunction } from './azure-function';

type ContextEchoResponse = {
    page: number;
    context: AzureContext;
};

class ContextEcho {
    @HttpFunction()
    static async httpTrigger(
        @PathParameter('page') page: number,
        @Context() context: AzureContext
    ): Promise<ContextEchoResponse> {
        return {
            page: page,
            context: context,
        } as ContextEchoResponse;
    }
}

describe('@Context decorator', () => {
    it('should pass context correctly', async () => {
        const page = '15';

        const context = createContextWithHttpRequest({
            params: {
                page: page,
            },
        });

        const result: ContextEchoResponse = await callAzureFunction(ContextEcho.httpTrigger, context);
        expect(result.page).toEqual(page);
        expect(result.context).toBe(context);
    });
});
