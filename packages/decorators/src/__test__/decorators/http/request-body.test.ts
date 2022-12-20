import { HttpFunction, RequestBody } from '../../../index';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

type sample = {
    id: number;
};

class EchoBody {
    @HttpFunction()
    static async httpTrigger(@RequestBody() input: sample): Promise<sample> {
        return input;
    }
}

describe('@RequestBody decorator', () => {
    it('parses the json body correctly', async () => {
        const input: sample = { id: 15 };
        const context = createContextWithHttpRequest({
            rawBody: JSON.stringify(input),
        });

        const result = await callAzureFunction(EchoBody.httpTrigger, context);
        expect(JSON.parse(result.body)).toEqual(input);
    });

    it('passes undefined when not JSON', async () => {
        const context = createContextWithHttpRequest({
            rawBody: 'plain text',
        });

        const result = await callAzureFunction(EchoBody.httpTrigger, context);
        expect(result.status).toEqual(204);
        expect(result.statusCode).toEqual(204);
        expect(result.body).toEqual(undefined);
    });
});
