import { toAzureFunction, QueryParameter, RequestMapping, RestController } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';
import { constants } from 'http2';

@RestController()
class Example {
    @RequestMapping()
    async rawResponse(@QueryParameter('page') page: string): Promise<HttpResponse> {
        return {
            status: constants.HTTP_STATUS_TEAPOT,
            body: {
                message: page,
            },
        };
    }
}

export default toAzureFunction(() => new Example());
