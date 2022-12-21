import { exportableRestController, QueryParameter, RequestMapping, RestController } from 'azure-functions-decorators';

@RestController()
class Example {
    @RequestMapping('/', {
        ResultMapper: (page: string) => {
            return {
                status: 201,
                body: {
                    message: page,
                },
            };
        },
    })
    async echo(@QueryParameter('page') page: string): Promise<string> {
        return page;
    }
}

export default exportableRestController(() => new Example());
