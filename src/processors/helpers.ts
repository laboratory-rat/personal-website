import {fileSystemStore} from "@/store/file_system";
import {OutputElementTypes} from "@/components/output/types";

export const addInvitationToInput = (input: string): OutputElementTypes => {
    const state = fileSystemStore.value;
    const currentPath = state.currentPath;
    const user = state.user;
    const host = state.host;

    return {
        type: 'text',
        content: [
            {
                type: 'plain',
                classes: ['terminal__output-line-content--executable'],
                text: `${user}@${host}:`,
            },
            {
                type: 'plain',
                classes: ['terminal__output-line-content--directory'],
                text: `${currentPath}`,
            },
            {
                type: 'plain',
                text: '$ ',
            },
            {
                type: 'plain',
                text: input,
            }
        ]
    };
};
