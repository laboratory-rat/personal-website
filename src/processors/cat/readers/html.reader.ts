import {OutputElementTypes, TextLineContent} from "@/components/output/types";
import {FileSystemNode} from "@/store/file_system";
// @ts-ignore
import HtmlTemplate from '../templates/html.html';
import {ContentReaderType} from "@/processors/cat/readers/types";

const htmlTemplateAsString = HtmlTemplate as unknown as string;

const getTitleAndLink = (content: FileSystemNode): { title: string, link: string } => {
    switch (content.type) {
        case 'directory':
            return {
                title: content.name,
                link: content.name,
            };
        case 'file':
            return {
                title: content.name,
                link: content.name,
            };
        case 'executable':
            return {
                title: content.name,
                link: content.name,
            };
        case 'link':
            return {
                title: content.name,
                link: content.link,
            };
        case 'command':
            return {
                title: content.name,
                link: content.link,
            };
        default:
            throw new Error(`Unknown content type: ${content}`);
    }
}

export const htmlReader: ContentReaderType = (content: FileSystemNode): OutputElementTypes[] | OutputElementTypes => {
    const {title, link} = getTitleAndLink(content);
    const lines = htmlTemplateAsString.split('\n');
    const result: OutputElementTypes[] = [];
    for (const line of lines) {
        const spans: TextLineContent[] = [];
        if (line.includes('{{title}}')) {
            const parts = line.split('{{title}}');
            spans.push(...[parts[0], title, parts[1]].map(x => ({text: x, type: 'plain' as 'plain'})))
        } else if (line.includes('{{link}}')) {
            const parts = line.split('{{link}}');
            spans.push(
                {
                    text: parts[0],
                    type: 'plain',
                },
                {
                    type: 'link',
                    link,
                    text: link,
                },
                {
                    text: parts[1],
                    type: 'plain',
                }
            );
        } else {
            spans.push({
                text: line,
                type: 'plain',
            });
        }

        const spacesAtStart = line.match(/^ */)?.[0].length ?? 0;
        const padding = 1 + spacesAtStart;

        result.push({
            type: 'text',
            content: spans,
            padding,
        });
    }


    return result;
}