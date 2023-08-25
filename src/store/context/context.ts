import {AppStore} from "@/utils/store";

export type ContextState = {
    occupied: boolean;
}

const initialState = (): ContextState => ({
    occupied: false,
});

export const contextStore = new AppStore<ContextState>(initialState());