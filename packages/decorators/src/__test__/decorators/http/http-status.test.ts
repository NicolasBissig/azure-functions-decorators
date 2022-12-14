import { findHttpStatusBySymbol, HttpStatus } from '../../../decorators/http/http-status';

describe('@HttpStatus decorator', () => {
    it('assigns status correctly to a class instance', async () => {
        @HttpStatus(418)
        class TeaPot {}

        const teapotInstance = new TeaPot();

        expect(findHttpStatusBySymbol(teapotInstance)).toEqual(418);
    });

    it('throws with multiple status decorators', async () => {
        const createInvalidClass = () => {
            @HttpStatus(200)
            @HttpStatus(418)
            // @ts-ignore
            class InvalidTeaPot {}
        };

        expect(createInvalidClass).toThrow('Cannot redefine property: Symbol(_HttpStatus)');
    });

    it('on child overrides @HttpStatus from parent class', async () => {
        @HttpStatus(400)
        class BadRequest {}

        @HttpStatus(418)
        class TeaPot extends BadRequest {}

        const badRequestInstance = new BadRequest();
        const teapotInstance = new TeaPot();

        expect(findHttpStatusBySymbol(badRequestInstance)).toEqual(400);
        expect(findHttpStatusBySymbol(teapotInstance)).toEqual(418);
    });

    it('on parent class inherits @HttpStatus to child class', async () => {
        @HttpStatus(404)
        class NotFound {}

        class UserNotFound extends NotFound {}

        const notFoundInstance = new NotFound();
        const userNotFoundInstance = new UserNotFound();

        expect(findHttpStatusBySymbol(notFoundInstance)).toEqual(404);
        expect(findHttpStatusBySymbol(userNotFoundInstance)).toEqual(404);
    });

    it('assigns status correctly from numeric string', async () => {
        @HttpStatus('418' as unknown as number)
        class TeaPot {}

        const teapotInstance = new TeaPot();

        expect(findHttpStatusBySymbol(teapotInstance)).toEqual(418);
    });

    it('assigns undefined from non-numeric string', async () => {
        @HttpStatus('teapot' as unknown as number)
        class TeaPot {}

        const teapotInstance = new TeaPot();

        expect(findHttpStatusBySymbol(teapotInstance)).toBeUndefined();
    });
});
