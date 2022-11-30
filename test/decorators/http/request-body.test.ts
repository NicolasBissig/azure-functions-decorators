import { HttpFunction, RequestBody } from '../../../src';
import { createContextWithHttpRequest } from './context';
import { callAzureFunction } from '../azure-function';

describe('@RequestBody decorator', () => {
    it('parses the json body correctly', async () => {
        type sample = {
            id: number;
        };

        class Echo {
            @HttpFunction()
            static async httpTrigger(@RequestBody() input: sample): Promise<sample> {
                return input;
            }
        }

        const input: sample = { id: 15 };
        const context = createContextWithHttpRequest({
            rawBody: JSON.stringify(input),
        });

        const result = await callAzureFunction(Echo.httpTrigger, context);
        expect(result).toEqual(input);
    });
});
