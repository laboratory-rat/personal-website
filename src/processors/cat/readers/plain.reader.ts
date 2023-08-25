import {OutputElementTypes} from "@/components/output/types";
import {FileSystemNode} from "@/store/file_system";
import {ContentReaderType} from "@/processors/cat/readers/types";

const getContent = (content: FileSystemNode): string => {
    switch (content.type) {
        case 'directory':
            return 'directory';
        case 'file':
            return content.content;
        case 'executable':
            return 'executable';
        case 'link':
            return content.link;
        case 'command':
            return content.link;
        default:
            throw new Error(`Unknown content type: ${content}`);
    }
}

export const plainReader: ContentReaderType = (content: FileSystemNode): OutputElementTypes[] | OutputElementTypes => {
    return {
        type: 'text',
        content: {
            text: getContent(content),
            type: 'plain',
        },
        padding: 1,
    };
};
