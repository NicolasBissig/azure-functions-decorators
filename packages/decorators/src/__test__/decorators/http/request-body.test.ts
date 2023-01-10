import { RequestBody, RequestMapping, RestController, toAzureFunction } from '../../../index';
import { createContextWithHttpRequest } from './context';

type sample = {
    id: number;
};

@RestController()
class EchoBody {
    @RequestMapping()
    async httpTrigger(@RequestBody() input: sample): Promise<sample> {
        return input;
    }
}

describe('@RequestBody decorator', () => {
    it('parses the json body correctly', async () => {
        const input: sample = { id: 15 };
        const context = createContextWithHttpRequest({
            rawBody: JSON.stringify(input),
        });

        const result = await toAzureFunction(() => new EchoBody())(context);
        expect(JSON.parse(result.body)).toEqual(input);
    });

    it('passes undefined when not JSON', async () => {
        const context = createContextWithHttpRequest({
            rawBody: 'plain text',
        });

        const result = await toAzureFunction(() => new EchoBody())(context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });
});
