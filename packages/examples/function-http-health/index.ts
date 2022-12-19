import { HttpFunction } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

class Example {
    @HttpFunction()
    static async health(): Promise<void> {
        return;
    }
}

export default Example.health;
