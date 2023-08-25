import {FileSystemNode} from "@/store/file_system";
import {OutputElementTypes, TextLine} from "@/components/output/types";

export const fallbackExecutor = ({name}: FileSystemNode): OutputElementTypes[] => {
    return [{
        type: 'text',
        content: {
            type: 'plain',
            text: `exec: ${name}: Permission denied`,
        },
        padding: 1,
    }];
}