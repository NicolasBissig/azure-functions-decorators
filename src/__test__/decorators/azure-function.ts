import { Context } from '@azure/functions';

export async function callAzureFunction<T>(func: (...args: any[]) => T, context: Context): Promise<T> {
    return func(context);
}
