import { Context as AzureContext, HttpRequest } from '@azure/functions';
import { Context, HttpFunction, PathParameter } from '../../src';

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
        const page = 15;

        const context = ({
            req: ({
                method: 'GET',
                params: {
                    page: page,
                },
            } as unknown) as HttpRequest,
        } as unknown) as AzureContext;

        // @ts-ignore
        const result: ContextEchoResponse = await ContextEcho.httpTrigger(context);
        expect(result.page).toEqual(page);
        expect(result.context).toBe(context);
    });
});
