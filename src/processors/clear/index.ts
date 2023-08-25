import {outputStoreClear} from "@/components/output/store";
import {createProcessor} from "@/processors/types";

const clear = outputStoreClear;

const action = () => {
    clear();
    return null;
}

export const clearProcessor = createProcessor({
    regex: /^clear/i,
    action,
    description: 'Clear terminal',
    command: 'clear',
});
