import {
    GetMapping,
    HttpStatus,
    PathParameter,
    PostMapping,
    RequestBody,
    RestController,
    toAzureFunction,
} from 'azure-functions-decorators';
import { constants } from 'http2';
import { HttpResponse } from '@azure/functions';

type User = {
    id: number;
    name: string;
};

@HttpStatus(constants.HTTP_STATUS_NOT_FOUND)
class NotFoundError {}

@HttpStatus(constants.HTTP_STATUS_CONFLICT)
class ConflictError {}

const createdResponse: (user: User) => HttpResponse = (user) => {
    return {
        status: constants.HTTP_STATUS_CREATED,
        statusCode: constants.HTTP_STATUS_CREATED,
        body: user,
        headers: {
            Location: String(user.id),
        },
    };
};

@RestController()
class UserController {
    public users: User[] = [];
    public maxId = 0;

    constructor(users: User[], startId: number) {
        this.users = users || [];
        this.maxId = startId || 0;
    }

    @GetMapping()
    getAllUsers(): User[] {
        return this.users;
    }

    @GetMapping('/{userId}')
    getUser(@PathParameter('userId') userId: number): User {
        const user = this.users[userId];
        if (user === undefined) {
            throw new NotFoundError();
        }
        return user;
    }

    @PostMapping()
    createUser(@RequestBody() user: User): HttpResponse {
        user.id = this.maxId;
        this.users[user.id] = user;
        this.maxId++;

        return createdResponse(user);
    }
}

export default toAzureFunction(() => new UserController([], 0));
