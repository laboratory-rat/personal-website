type BaseOutput<Type> = {
    type: Type;
}

type TextLineTypes = 'plain' | 'link';
type TextLineBase<Type extends TextLineTypes> = {
    type: Type;
    classes?: string[];
};

export type TextLinePlainContent = TextLineBase<'plain'> & {
    text: string;
};

export type TextLineLinkContent = TextLineBase<'link'> & {
    text: string;
    link: string;
}

export type TextLineContent = TextLineLinkContent | TextLinePlainContent;

export type TextLine = BaseOutput<'text'> & {
    content: TextLineContent | TextLineContent[];
    padding?: number;
}


export function createTextLine(content: TextLineContent | TextLineContent[] | string, padding?: number): TextLine {
    let processedContent = structuredClone(content);
    if (typeof processedContent === 'string') {
        processedContent = { text: processedContent, type: 'plain' };
    }

    return {
        type: 'text',
        content: processedContent,
        padding,
    }
}


export type OutputElementTypes = TextLine;

export const TextLineHeightPx = 18;
