import { HttpFunction, RequestBody } from 'azure-functions-decorators';

class Example {
    @HttpFunction()
    static async echoBody(@RequestBody() body: unknown): Promise<unknown> {
        return body;
    }
}

export default Example.echoBody;
