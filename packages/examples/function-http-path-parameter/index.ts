import { HttpFunction, PathParameter } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async pathParameterEcho(@PathParameter('parameter') parameter: string): Promise<HttpResponse> {
        return {
            body: {
                parameter,
            },
        };
    }
}

export default Example.pathParameterEcho;
