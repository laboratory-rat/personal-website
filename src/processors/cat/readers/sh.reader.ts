import {FileSystemNode} from "@/store/file_system";
import {OutputElementTypes, TextLineContent} from "@/components/output/types";
// @ts-ignore
import ShTemplate from '../templates/sh.txt';

const getNodeTitle = (node: FileSystemNode) => {
    return node.name;
};

export const shReader = (content: FileSystemNode): OutputElementTypes[] => {
    const title = getNodeTitle(content);
    const lines = ShTemplate.split('\n');
    const result: OutputElementTypes[] = [];
    for (const line of lines) {
        const spans: TextLineContent[] = [];
        if (line.includes('{{title}}')) {
            const parts = line.split('{{title}}');
            spans.push(...[parts[0], title, parts[1]].map(x => ({text: x, type: 'plain' as 'plain'})))
        } else {
            spans.push({
                text: line,
                type: 'plain',
            });
        }
        result.push({
            type: 'text',
            content: spans,
            padding: 1,
        });
    }

    return result;
}