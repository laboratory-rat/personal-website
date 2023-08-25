import {AppStore} from "@/utils/store";
// @ts-ignore
import rootState from "./file_system.yml";
import {FileSystemNodeDirectory} from "@/store/file_system/types";

type FileSystemState = {
    user: string;
    host: string;
    currentPath: string;
    root: FileSystemNodeDirectory;
}

export const homeDirectory = '/home/oleh';

const initialState = (): FileSystemState => structuredClone(rootState as unknown as FileSystemState);

export const fileSystemStore = new AppStore<FileSystemState>(initialState());

