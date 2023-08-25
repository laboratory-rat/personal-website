import {createProcessor} from "@/processors/types";
import {outputStoreAddLines} from "@/components/output/store";

const action = (input: string) => {
    const firstWord = input.split(' ')[0];

    outputStoreAddLines({
        type: 'text',

        content: {
            text: `Command "${firstWord}" is not found. Type "help" to see available commands`,
            type: 'plain',
        }
    });
    return null;
}

export const fallbackProcessor = createProcessor({
    regex: /.*/i,
    action,
    description: 'Fallback processor',
    command: 'fallback',
    invisible: true,
});
