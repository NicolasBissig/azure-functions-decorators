import {
    DeleteMapping,
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
    public users: Record<number, User> = {};
    public lastId = 0;

    constructor(users: Record<number, User>, startId: number) {
        this.users = users || {};
        this.lastId = startId || 0;
    }

    @GetMapping()
    getAllUsers(): User[] {
        return Object.values(this.users);
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
        user.id = this.lastId;
        this.users[user.id] = user;
        this.lastId++;

        return createdResponse(user);
    }

    @DeleteMapping('/{userId}')
    deleteUser(@PathParameter('userId') userId: number): void {
        delete this.users[userId];
    }
}

export default toAzureFunction(() => new UserController([], 0));
