import { HttpFunction } from 'azure-functions-decorators';

class Example {
    @HttpFunction()
    static async health(): Promise<void> {
        return;
    }
}

export default Example.health;
