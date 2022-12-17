import { HttpFunction } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async health(): Promise<HttpResponse> {
        console.log('health check');
        return { statusCode: 200 };
    }
}

export default Example.health;
