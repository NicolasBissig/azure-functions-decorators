import { Context as AzureContext, Context } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from './reflection';
import 'reflect-metadata';

type createParameterDecoratorOptions = {
    symbol: string;
    maxParameters?: number;
    injector: (context: Context) => any;
};

const PARAMETERS_TO_INJECT = Symbol('parametersToInjectContext');

type InjectableParameter = {
    index: number;
    injector: (target: object, propertyName: string | symbol, context: Context, args: unknown[]) => any;
};

export function getParametersToInjectContext(target: object): InjectableParameter[] {
    return Reflect.getOwnPropertyDescriptor(target, PARAMETERS_TO_INJECT)?.value || [];
}

function registerParameterToInject(target: object, parameter: InjectableParameter): void {
    const parameters = getParametersToInjectContext(target);
    parameters.push(parameter);
    Reflect.defineProperty(target, PARAMETERS_TO_INJECT, {
        value: parameters,
    });
}

export function createParameterDecorator(options: createParameterDecoratorOptions): () => ParameterDecorator {
    const metaDataKey = Symbol(options.symbol);

    function injectParameter(target: object, propertyName: string | symbol, context: AzureContext, args: unknown[]) {
        applyToMarked<Omit<InjectableParameter, 'injector'>>(
            target,
            propertyName,
            metaDataKey,
            (parameter) => (args[parameter.index] = options.injector(context))
        );
    }

    function decorator(): ParameterDecorator {
        return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
            markParameterWithValue<Omit<InjectableParameter, 'injector'>>(
                target,
                propertyKey,
                metaDataKey,
                { index: parameterIndex },
                options.maxParameters
            );
            registerParameterToInject(target, { index: parameterIndex, injector: injectParameter });
        };
    }

    return decorator;
}
