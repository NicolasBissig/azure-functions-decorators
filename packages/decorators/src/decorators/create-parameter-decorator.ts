import { Context as AzureContext, Context } from '@azure/functions';
import { applyToMarked, markParameterWithValue } from './reflection';
import 'reflect-metadata';

type createParameterDecoratorOptions<O> = {
    symbol: string;
    maxParameters?: number;
    injector: (context: Context, options: O) => any;
};

const PARAMETERS_TO_INJECT = Symbol('parametersToInjectContext');

type InjectableParameter<O> = {
    index: number;
    options: O;
    injector: (target: object, propertyName: string | symbol, context: Context, args: unknown[]) => any;
};

export function getParametersToInjectContext<O>(target: object): InjectableParameter<O>[] {
    return Reflect.getOwnPropertyDescriptor(target, PARAMETERS_TO_INJECT)?.value || [];
}

function registerParameterToInject<O>(target: object, parameter: InjectableParameter<O>): void {
    const parameters = getParametersToInjectContext(target);
    parameters.push(parameter);
    Reflect.defineProperty(target, PARAMETERS_TO_INJECT, {
        value: parameters,
    });
}

export function createParameterDecoratorWithOptions<O>(
    options: createParameterDecoratorOptions<O>
): (options: O) => ParameterDecorator {
    const metaDataKey = Symbol(options.symbol);

    function injectParameter(target: object, propertyName: string | symbol, context: AzureContext, args: unknown[]) {
        applyToMarked<Omit<InjectableParameter<O>, 'injector'>>(
            target,
            propertyName,
            metaDataKey,
            (parameter) => (args[parameter.index] = options.injector(context, parameter.options))
        );
    }

    function decorator(decoratorOptions: O): ParameterDecorator {
        return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
            markParameterWithValue<Omit<InjectableParameter<O>, 'injector'>>(
                target,
                propertyKey!,
                metaDataKey,
                { index: parameterIndex, options: decoratorOptions },
                options.maxParameters
            );
            registerParameterToInject(target, {
                index: parameterIndex,
                options: decoratorOptions,
                injector: injectParameter,
            });
        };
    }

    return decorator;
}

// --- no options ---

type createParameterDecoratorOptionsNoOptions = createParameterDecoratorOptions<never> & {
    injector: (context: Context) => any;
};

export function createParameterDecorator(options: createParameterDecoratorOptionsNoOptions): () => ParameterDecorator {
    const metaDataKey = Symbol(options.symbol);

    function injectParameter(target: object, propertyName: string | symbol, context: AzureContext, args: unknown[]) {
        applyToMarked<Omit<InjectableParameter<never>, 'injector' | 'options'>>(
            target,
            propertyName,
            metaDataKey,
            (parameter) => (args[parameter.index] = options.injector(context))
        );
    }

    function decorator(): ParameterDecorator {
        return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
            markParameterWithValue<Omit<InjectableParameter<never>, 'injector' | 'options'>>(
                target,
                propertyKey!,
                metaDataKey,
                { index: parameterIndex },
                options.maxParameters
            );
            registerParameterToInject(target, {
                index: parameterIndex,
                options: undefined,
                injector: injectParameter,
            });
        };
    }

    return decorator;
}
