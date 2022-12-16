import { HttpFunction, HttpStatus } from 'azure-functions-decorators';
import { HttpResponse } from '@azure/functions';

@HttpStatus(404)
class UserNotFoundError extends Error {
    constructor(public readonly message: string, public readonly userId: string) {
        super(message);
    }
}

class Example {
    @HttpFunction()
    static async customError(): Promise<HttpResponse> {
        throw new UserNotFoundError('user not found', '123-456');
    }
}

export default Example.customError;
