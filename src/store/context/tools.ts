import {AppStore} from "@/utils/store";
import {ContextState} from "@/store/context/context";

export const contextStoreSetOccupied = (store: AppStore<ContextState>, occupied: boolean) => {
    store.update((state) => ({...state, occupied}));
};