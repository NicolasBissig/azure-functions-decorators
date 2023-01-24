import { HttpRequest } from '@azure/functions';
import { createParameterDecorator } from '../create-parameter-decorator';

/**
 * The {@link RequestBody @RequestBody} decorator injects the parsed json request body into a parameter.
 * The type of the injected parameter can be anything, but will not be validated.
 * If the request body is not parseable, undefined will be injected.
 */
export const RequestBody = createParameterDecorator({
    symbol: 'RequestBody',
    maxParameters: 1,
    injector: (context) => parseBody(context?.req),
});

function parseBody(req: HttpRequest | undefined): unknown {
    try {
        return JSON.parse(req?.rawBody);
    } catch {
        return undefined;
    }
}
