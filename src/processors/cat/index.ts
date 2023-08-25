import {outputStoreAddLines} from "@/components/output/store";
import {
    fileSystemGetDirectoryOfFile, FileSystemNode,
    fileSystemRelativePathToAbsolute,
    fileSystemStore
} from "@/store/file_system";
import {createProcessor} from "@/processors/types";
import {ContentReaderType, htmlReader, plainReader, shReader} from "@/processors/cat/readers";
import {terminal} from "@/index";
import {OutputElementTypes} from "@/components/output/types";

const name = 'cat';
const description = 'Print files on the standard output';

const fileExtToReader = new Map<string, ContentReaderType>([
    ['txt', plainReader],
    ['html', htmlReader],
    ['htm', htmlReader],
    ['sh', shReader],
]);

const addText = (text: string) => outputStoreAddLines({
    type: 'text',
    content: {
        text,
        type: 'plain',
    },
    padding: 1,
});

const action = (input: string) => {
    const parts = input.split(' ');
    if (parts.length < 2) {
        addText('cat: missing operand');
        return null;
    }

    const pathFindResult = parts[1];
    const currentPath = fileSystemStore.value.currentPath;
    const absolutePath = fileSystemRelativePathToAbsolute(currentPath, pathFindResult);
    const targetNode = fileSystemGetDirectoryOfFile(absolutePath, fileSystemStore.value.root);
    if (!targetNode) {
        addText(`No such file: ${pathFindResult}`);
        return null;
    }

    if (targetNode.type === 'directory') {
        addText(`cat: ${pathFindResult}: Is a directory`);
        return null;
    }

    const ext = targetNode.name.split('.').pop() ?? '';
    const reader = fileExtToReader.get(ext);
    if (!reader) {
        addText(`cat: ${pathFindResult}: Error reading file`);
        return null;
    }

    const result = reader(targetNode);
    if (!Array.isArray(result)) {
        outputStoreAddLines(result);
        return null;
    }

    const maxCapacity = terminal.getOutputLinesCapacity();
    if (result.length < maxCapacity) {
        outputStoreAddLines(...result);
        return null;
    }

    const scrollHelper = (lines: OutputElementTypes[], displayAmount: number): Promise<void> => new Promise( resolve => {
        const backupOnKeyDown = window.onkeydown;
        let offset = 0;

        const addNavigationLine = () => {
            outputStoreAddLines({
                type: 'text',
                content: {
                    type: 'plain',
                    text: 'Arrow keys to navigate, ctrl+c to exit',
                }
            });
        };

        const render = () => {
            const start = Math.min(offset, lines.length - displayAmount);
            const toRenderLines = lines.slice(start, start + displayAmount);
            outputStoreAddLines(...toRenderLines);
            addNavigationLine();
        }

        render();
        window.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                offset = Math.min(offset + 1, lines.length - displayAmount);
                render();
            }

            if (e.key === 'ArrowUp') {
                offset = Math.max(offset - 1, 0);
                render();
            }

            if (e.key === 'Escape' || (e.ctrlKey && e.key === 'c')) {
                window.onkeydown = backupOnKeyDown;
                resolve();
            }
        }
    });

    return scrollHelper(result, maxCapacity);
}

export const catProcessor = createProcessor({
    command: name,
    description,
    action,
    regex: /^cat/i,
    guessable: true,
});
