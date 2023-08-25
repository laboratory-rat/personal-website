import {OutputElementTypes} from "@/components/output/types";
import {AppStore} from "@/utils/store";

export type State = {
    output: OutputElementTypes[];
}
const initialState = (): State => ({
    output: [],
});
export const OutputStore = new AppStore<State>(initialState());
export const outputStoreAddLines = (...lines: OutputElementTypes[]) => {
    OutputStore.update(state => ({
        ...state,
        output: [
            ...state.output,
            ...lines,
        ],
    }));
};
export const outputStoreClear = () => {
    OutputStore.update(state => ({
        ...state,
        output: [],
    }));
}