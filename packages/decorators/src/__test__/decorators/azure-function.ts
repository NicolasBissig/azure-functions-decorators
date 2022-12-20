import { Context, HttpResponse } from '@azure/functions';

export async function callAzureFunction(func: (...args: any[]) => any, context: Context): Promise<HttpResponse> {
    return func(context);
}
