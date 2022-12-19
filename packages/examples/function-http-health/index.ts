import { HttpFunction } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async health(): Promise<HttpResponse> {
        return { statusCode: 204 };
    }
}

export default Example.health;
