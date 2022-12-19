import { HttpFunction, QueryParameter } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async queryParameterEcho(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

export default Example.queryParameterEcho;
