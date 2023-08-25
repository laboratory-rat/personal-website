import {AppStore} from "@/utils/store";

export type State = {
    prefix: string;
    input: string;
    history: string[];
    historyIndex: number;
    preview?: boolean;
};

const initialState = (): State => ({
    prefix: 'Some prefix',
    input: '',
    history: [],
    historyIndex: 0,
    preview: false,
});
export const inputStore = new AppStore<State>(initialState());
export const inputStoreGetLastCommandOrNull = (): string | null => {
    const state = inputStore.value;
    return state.history[state.history.length - 1] || null;
}

export const inputStoreInputCommand = (command: string, preview: boolean = false) => {
    inputStore.update((state) => {
        const newHistory = [...state.history];
        if (newHistory.length > 10) {
            newHistory.shift();
        }

        return ({
            prefix: state.prefix,
            input: '',
            history: [...newHistory, command],
            historyIndex: state.historyIndex,
            preview,
        });
    })
}