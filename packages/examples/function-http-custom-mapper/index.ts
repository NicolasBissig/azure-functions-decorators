import { HttpFunction, QueryParameter } from 'azure-functions-decorators';

class Example {
    @HttpFunction({
        ResultMapper: (page: string) => {
            return {
                status: 201,
                body: {
                    message: page,
                },
            };
        },
    })
    static async echo(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

export default Example.echo;
