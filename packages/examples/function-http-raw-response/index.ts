import { HttpFunction, QueryParameter } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';
import { constants } from 'http2';

class Example {
    @HttpFunction()
    static async rawResponse(@QueryParameter('page') page: string): Promise<HttpResponse> {
        return {
            status: constants.HTTP_STATUS_TEAPOT,
            body: {
                message: page,
            },
        };
    }
}

export default Example.rawResponse;
