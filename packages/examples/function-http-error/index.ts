import { exportableRestController, HttpStatus, RequestMapping, RestController } from 'azure-functions-decorators';

@HttpStatus(404)
class UserNotFoundError extends Error {
    constructor(public readonly message: string, public readonly userId: string) {
        super(message);
    }
}

@RestController()
class Example {
    @RequestMapping()
    async customError(): Promise<never> {
        throw new UserNotFoundError('user not found', '123-456');
    }
}

export default exportableRestController(() => new Example());
