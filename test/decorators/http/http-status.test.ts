import {HttpStatus} from "../../../src/decorators/http/http-status";

describe('@HttpStatus decorator', () => {
    it('assigns status correctly to a class instance', async () => {
        @HttpStatus(418)
        class TeaPot {

        }

        const teapotInstance = new TeaPot()

        // @ts-ignore
        expect(teapotInstance.HttpStatus).toEqual(418)
    });

    it('throws with multiple status decorators', async () => {

        const createInvalidClass = () => {
            @HttpStatus(200)
            @HttpStatus(418)
                // @ts-ignore
            class InvalidTeaPot {

            }
        };

        expect(createInvalidClass).toThrow('Cannot redefine property: HttpStatus')
    });
})
