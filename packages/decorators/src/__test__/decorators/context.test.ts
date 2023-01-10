import { Context as AzureContext } from '@azure/functions';
import { Context, PathParameter, RequestMapping, RestController, toAzureFunction } from '../../index';
import { createContextWithHttpRequest } from './http/context';

type ContextEchoResponse = {
    page: number;
    context: AzureContext;
};

@RestController()
class ContextEcho {
    @RequestMapping()
    async httpTrigger(
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

        const result = await toAzureFunction(() => new ContextEcho())(context);
        const resultBody: ContextEchoResponse = JSON.parse(result.body);
        expect(resultBody.page).toEqual(page);
        expect(resultBody.context).toEqual(context);
    });
});
