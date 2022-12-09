import {HttpStatus} from "../../../src/decorators/http/http-status";

describe('@HttpStatus decorator', () => {
    it('assigns status correctly to a class instance', async () => {
        @HttpStatus(418)
        class TeaPot {

        }

        const teapotInstance = new TeaPot()

        // @ts-ignore
        expect(teapotInstance._HttpStatus).toEqual(418)
    });

    it('throws with multiple status decorators', async () => {

        const createInvalidClass = () => {
            @HttpStatus(200)
            @HttpStatus(418)
                // @ts-ignore
            class InvalidTeaPot {

            }
        };

        expect(createInvalidClass).toThrow('Cannot redefine property: _HttpStatus')
    });

    it('on child overrides @HttpStatus from parent class', async () => {

        @HttpStatus(400)
        class BadRequest {

        }

        @HttpStatus(418)
        class TeaPot extends BadRequest {

        }

        const badRequestInstance = new BadRequest()
        const teapotInstance = new TeaPot()

        // @ts-ignore
        expect(badRequestInstance._HttpStatus).toEqual(400)
        // @ts-ignore
        expect(teapotInstance._HttpStatus).toEqual(418)
    });

    it('on parent class inherits @HttpStatus to child class', async () => {

        @HttpStatus(404)
        class NotFound {

        }

        class UserNotFound extends NotFound {

        }

        const userNotFoundInstance = new UserNotFound()

        // @ts-ignore
        expect(userNotFoundInstance._HttpStatus).toEqual(404)
    });
})
