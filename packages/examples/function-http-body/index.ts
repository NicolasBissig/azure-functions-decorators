import { HttpFunction, RequestBody } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async echoBody(@RequestBody() body: unknown): Promise<unknown> {
        return body;
    }
}

export default Example.echoBody;
