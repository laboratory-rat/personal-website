import {outputStoreAddLines} from "@/components/output/store";
import {
    FileSystemNode,
    FileSystemNodeTypes,
    fileSystemStore
} from "@/store/file_system";
import {createProcessor} from "@/processors/types";
import {fileSystemGetDirectoryOfFile, fileSystemRelativePathToAbsolute} from "@/store/file_system";
import {TextLineContent} from "@/components/output/types";

const add = outputStoreAddLines;

const name = 'ls';
const description = 'List files and directories';

const classesMap = new Map<FileSystemNodeTypes, string>([
    ['directory', 'terminal__output-line-content--directory'],
    ['file', 'terminal__output-line-content--file'],
    ['executable', 'terminal__output-line-content--executable'],
    ['link', 'terminal__output-line-content--link'],
]);

const renderInColumns = (nodes: FileSystemNode[]) => {
    const columns = 3;
    const totalChildren = nodes.length;
    const rows = Math.ceil(totalChildren / columns);
    const childrenByRows = Array.from({length: rows}, (_, i) => nodes.slice(i * columns, (i + 1) * columns));
    const childrenByColumns = Array.from({length: columns}, (_, i) => nodes.slice(i * rows, (i + 1) * rows));
    const maxCharactersInColumn = childrenByColumns.map(column => column.reduce((acc, child) => Math.max(acc, child.name.length), 0));
    for (const row of childrenByRows) {
        const content: TextLineContent[] = [];
        for (let i = 0; i < row.length; i++) {
            const child = row[i];
            console.log(maxCharactersInColumn[i] - child.name.length);
            const spaces = ' '.repeat(Math.ceil(Math.max(maxCharactersInColumn[i] - child.name.length, 0) * 1));
            console.log(child.name, spaces.length);
            switch (child.type) {
                case 'link':
                    content.push({
                        text: child.name + spaces + '\t',
                        type: 'link',
                        classes: [classesMap.get(child.type) || ''],
                        link: child.link,
                    });
                    break;
                default:
                    content.push({
                        text: child.name + spaces + '\t',
                        type: 'plain',
                        classes: [classesMap.get(child.type) || ''],
                    });
                    break;

            }
        }

        add({
            type: 'text',
            content,
            padding: 1,
        });
    }
}

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

    if (targetDirectory.type !== 'directory') {
        const lastPart = absolutePath.split('/').pop();
        addLine(`Not a directory: ${lastPart}`);
        return null;
    }

    const children = targetDirectory.children;
    if (!children.length) {
        addLine('Directory is empty');
        return null;
    }

    renderInColumns(children);
    return null;
}

export const lsProcessor = createProcessor({
    regex: /^ls/i,
    action,
    description,
    command: name,
    guessable: true,
});
