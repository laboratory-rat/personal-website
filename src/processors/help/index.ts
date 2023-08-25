import {createProcessor} from "@/processors/types";
import {outputStoreAddLines} from "@/components/output/store";
import {createTextLine, OutputElementTypes, TextLineContent} from "@/components/output/types";
import {processorsList} from "@/processors";

const add = outputStoreAddLines;

const addSpan = (text: string, type: 'plain' | 'link' | 'colored', link?: string): TextLineContent => {
    if (type === 'link') {
        return { text, type, link: link ?? '' };
    }

    return { text, type: 'plain', classes: type == 'colored' ? ['terminal__output-line-content--directory'] : []};
}

const addLine = (...content: TextLineContent[]) => {
    add(createTextLine(content, 1));
}

const action = (input: string) => {
    addLine(
        addSpan('Hello!', 'plain'),
    );

    addLine(
        addSpan('My name is Oleh Tymofieiev and I am a programmer.', 'plain'),
    );

    addLine(
        addSpan('And this is my personal ', 'plain'),
        addSpan('website!', 'colored'),
    );

    addLine(
        addSpan('Tied of the css problems, crazy designers solutions?', 'plain'),
    );

    addLine(
        addSpan('I am to!', 'colored'),
    );

    addLine(
        addSpan('Look at this minimalistic design!', 'plain'),
    );

    addLine(
        addSpan('Nothing extra, just the information you need.', 'plain'),
    );

    addLine(
        addSpan('Want to look around?', 'plain'),
    );

    addLine(
        addSpan('Command ', 'plain'),
        addSpan('help', 'colored'),
        addSpan(' will show you this message.', 'plain'),
    );

    addLine(
        addSpan('See ', 'plain'),
        addSpan('executable', 'colored'),
        addSpan('?', 'plain'),
        addSpan(' type ', 'plain'),
        addSpan('./program.sh', 'colored'),
        addSpan(' to check what happens. Or ', 'plain'),
        addSpan('cat ./program.sh ', 'colored'),
        addSpan('to check what inside.', 'plain'),
    );

    addLine(
        addSpan('See the link? You can click it or execute. ', 'plain'),
    );

    addLine(
        addSpan('My ', 'plain'),
        addSpan('Linkedin profile', 'link', 'https://www.linkedin.com/in/oleh-tymofieiev-031125114/'),
        addSpan(' and ', 'plain'),
        addSpan('Github', 'link', 'https://github.com/laboratory-rat'),
        addSpan(' (source code for this website is also here) ', 'plain'),
        addSpan('and ', 'plain'),
        addSpan('CV', 'link', '/assets/Oleh_Tymofieiev.pdf'),
    );

    addLine(
        addSpan('Available commands below. Have fun!', 'plain'),
    );

    addLine(addSpan('---', 'plain'));

    const list = [];
    const visibleProcessors = processorsList.filter(processor => !processor.invisible);
    const maxCommandWidth = Math.max(...visibleProcessors.map(processor => processor.command.length));
    for (const processor of visibleProcessors) {
        const command = processor.command.padEnd(maxCommandWidth, ' ');
        const description = Array.isArray(processor.description) ? processor.description : [processor.description];
        const descriptionText = description.join('\n').padStart(10, ' ');
        list.push(createTextLine(`${command} - ${descriptionText}`, 1));
    }

    add(...list);
    return null;
}

export const helpProcessor = createProcessor({
    regex: /^help/i,
    action,
    description: 'Show help messages',
    command: 'help',
});

