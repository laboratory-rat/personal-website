export type ActionChainType = (line: string) => (unknown | Promise<unknown>);

export type Processor = {
    command: string;
    regex: RegExp;
    match: (line: string) => boolean;
    action: ActionChainType;
    description: string | string[];
    invisible?: boolean;
    guessable?: boolean; // Can be guessed by pressing tab
};

export const createProcessor = ({regex, action, command, description, invisible, guessable}: Omit<Processor, 'match'>): Processor => ({
    regex,
    match: (line: string) => regex.test(line),
    action,
    command,
    description,
    invisible,
    guessable,
});
