import { HttpFunction, PathParameter } from 'azure-functions-decorators';

class Example {
    @HttpFunction()
    static async pathParameterEcho(@PathParameter('parameter') parameter: string): Promise<string> {
        return parameter;
    }
}

export default Example.pathParameterEcho;
