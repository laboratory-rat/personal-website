import {createProcessor} from "@/processors/types";
import {
    fileSystemGetDirectoryOfFile, FileSystemNode,
    fileSystemRelativePathToAbsolutePure,
    fileSystemStore,
    homeDirectory
} from "@/store/file_system";
import {outputStoreAddLines} from "@/components/output/store";
import {OutputElementTypes} from "@/components/output/types";
import {fallbackExecutor} from "@/processors/exec/executors/fallback";
import {tetrisExecutor} from "@/processors/exec/executors/tetris";
import {virusExecutor} from "@/processors/exec/executors/virus";
import {antivirusExecutor} from "@/processors/exec/executors/antivirus";

const name = "exec";
const description = "Execute a command";

const idToExecMap = new Map<string, (node: FileSystemNode) => OutputElementTypes[] | Promise<unknown>>([
    ['TETRIS', tetrisExecutor],
    ['VIRUS', virusExecutor],
    ['ANTIVIRUS', antivirusExecutor],
    ['*', fallbackExecutor],
]);


const action = (input: string) => {
    const routeToExecutable = input.split(' ')[0];

    const nodeAbsolutePath = fileSystemRelativePathToAbsolutePure(fileSystemStore.value.currentPath, routeToExecutable, homeDirectory);
    const targetNode = fileSystemGetDirectoryOfFile(nodeAbsolutePath, fileSystemStore.value.root);
    if (!targetNode) {
        outputStoreAddLines({
            type: 'text',
            content: {
                type: 'plain',
                text: `No such file: ${routeToExecutable}`,
            },
            padding: 1,
        });

        return null;
    }

    if (targetNode.type == 'directory') {
        outputStoreAddLines({
            type: 'text',
            content: {
                type: 'plain',
                text: `exec: ${routeToExecutable}: Is a directory`,
            },
            padding: 1,
        });

        return null;
    }

    if (targetNode.type == 'link') {
        window.open(targetNode.link, '_blank');
        return null;
    }

    if (targetNode.type != 'executable') {
        outputStoreAddLines({
            type: 'text',
            content: {
                type: 'plain',
                text: `exec: ${routeToExecutable}: Not an executable`,
            },
            padding: 1,
        });

        return null;
    }

    const { id } = targetNode;
    const executor = idToExecMap.get(id) ?? idToExecMap.get('*')!;
    const result = executor(targetNode);
    if (result instanceof Promise) {
        return result;
    }

    outputStoreAddLines(...result);
    return null;
};

export const execProcessor = createProcessor({
    regex: /^\.\//i,
    action,
    description,
    command: name,
    guessable: true,
    invisible: true,
});

