import {fileSystemStore} from "@/store/file_system";
import {fileSystemGetDirectoryOfFile, fileSystemRelativePathToAbsolute} from "@/store/file_system";
import {outputStoreAddLines} from "@/components/output/store";
import {createProcessor} from "@/processors/types";


const name = 'cd';
const description = 'Change directory';
const regex = /^cd/i;

const add = outputStoreAddLines;

const action = (input: string) => {
    const addLine = (text: string) => add({
        type: 'text',
        content: {
            text,
            type: 'plain',
        },
        padding: 1,
    });

    const parts = input.split(' ');
    const pathFindResult = parts.length > 1 ? parts[1] : '.';
    const currentPath = fileSystemStore.value.currentPath;
    const absolutePath = fileSystemRelativePathToAbsolute(currentPath, pathFindResult);

    const targetDirectory = fileSystemGetDirectoryOfFile(absolutePath, fileSystemStore.value.root);
    if (!targetDirectory) {
        addLine(`No such directory: ${pathFindResult}`);
        return null;
    }

    if (targetDirectory.type != 'directory') {
        addLine(`Not a directory: ${pathFindResult}`);
        return null;
    }

    fileSystemStore.update((state) => ({
        ...state,
        currentPath: absolutePath,
    }));

    return null;
};

export const cdProcessor = createProcessor({
    command: name,
    description,
    regex,
    action,
    guessable: true,
})

