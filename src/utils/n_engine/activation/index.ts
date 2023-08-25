export type Activation<TActivation> = {
    type: TActivation;
    activate: (input: number) => number;
};

export const ActivationSigmoid: Activation<'sigmoid'> = {
    type: 'sigmoid',
    activate: (input: number) => 1 / (1 + Math.pow(Math.E, -4.9 * input)),
};

export const ActivationTanh: Activation<'tanh'> = {
    type: 'tanh',
    activate: (input: number) => Math.tanh(input),
}

export const ActivationRelu: Activation<'relu'> = {
    type: 'relu',
    activate: (input: number) => Math.max(0, input),
}

export const ActivationSoftplus: Activation<'softplus'> = {
    type: 'softplus',
    activate: (input: number) => Math.log(1 + Math.pow(Math.E, input)),
}

export const ActivationLinear: Activation<'linear'> = {
    type: 'linear',
    activate: (input: number) => input,
}

export type ActivationType = typeof ActivationSigmoid.type | typeof ActivationTanh.type | typeof ActivationRelu.type | typeof ActivationSoftplus.type | typeof ActivationLinear.type;

const activationsMap: { [K in ActivationType]: Activation<K> } = {
    sigmoid: ActivationSigmoid,
    tanh: ActivationTanh,
    relu: ActivationRelu,
    softplus: ActivationSoftplus,
    linear: ActivationLinear,
};

export const getActivationByType = (type: ActivationType) => {
    const activation = activationsMap[type];
    if (!activation) {
        throw new Error(`Activation ${type} is not supported`);
    }

    return activation;
}