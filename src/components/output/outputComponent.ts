import {ILogger} from "@/utils/logger";
import {OutputElementTypes, TextLine, TextLineContent} from "@/components/output/types";
import {OutputStore, State} from "@/components/output/store";
import "./styles.scss";

export class OutputComponent {
    protected container!: HTMLDivElement;
    protected subscriptions: Array<() => unknown> = [];

    constructor(protected rootElement: HTMLElement, protected logger: ILogger) {
        this.setup();
    }

    protected setup() {
        this.container = document.createElement('div');
        this.container.classList.add('terminal__output');
        this.rootElement.appendChild(this.container);

        this.logger.debug('TerminalOutput.setup', this.rootElement);
        this.subscriptions.push(OutputStore.subscribe(this.render.bind(this)));
        this.rootElement.onclick = () => {
            const inputElement = document.querySelector('.terminal__input input');
            if (inputElement as HTMLInputElement) {
                (inputElement as HTMLInputElement).focus(
                    {preventScroll: true}
                );
            }
        }
    }

    public render(state: State) {
        this.container.innerHTML = '';
        state.output.forEach(output => {
            const element = this.createElement(output);
            this.container.appendChild(element);
        });
    }

    public getMaxLinesCapacity(): number {
        const lineHeightPx = 20;
        const canvasHeight = this.rootElement.clientHeight;
        return Math.ceil(canvasHeight / lineHeightPx);
    }

    protected createElement(output: OutputElementTypes): HTMLElement {
        const createTextLine = (output: TextLine): HTMLDivElement => {
            const element = document.createElement('div');
            element.classList.add('terminal__output-line');
            if (output.padding) {
                element.style.paddingLeft = `${output.padding * 0.5}rem`;
            }

            const appendContent = (content: TextLineContent) => {
                let contentPart;

                switch (content.type) {
                    case 'plain':
                        contentPart = document.createElement('span');
                        contentPart.classList.add('terminal__output-line-content', `terminal__output-line-content--${content.type}`);
                        if (content.classes) {
                            contentPart.classList.add(...content.classes);
                        }

                        contentPart.innerText = content.text;
                        break;
                    case 'link':
                        contentPart = document.createElement('span');
                        contentPart.classList.add('terminal__output-line-content', `terminal__output-line-content--${content.type}`);
                        if (content.classes) {
                            contentPart.classList.add(...content.classes);
                        }

                        const innerLink = document.createElement('a');
                        innerLink.href = content.link;
                        innerLink.target = '_blank';
                        innerLink.innerText = content.text;
                        contentPart.appendChild(innerLink);

                        // contentPart = document.createElement('a');
                        // contentPart.classList.add('terminal__output-line-content', `terminal__output-line-content--${content.type}`);
                        // if (content.classes) {
                        //     contentPart.classList.add(...content.classes);
                        // }
                        //
                        // contentPart.innerText = content.text;
                        // contentPart.href = content.link;
                        // contentPart.target = '_blank';
                        break;
                    default:
                        throw new Error(`Unknown content type ${content}`);
                }

                element.appendChild(contentPart);
            }

            const content = Array.isArray(output.content) ? output.content : [output.content];
            content.forEach(appendContent);

            return element;
        }

        switch (output.type) {
            case 'text':
                return createTextLine(output);
            default:
                throw new Error(`Unknown output type ${output.type}`);
        }
    }

    public dispose() {
        this.rootElement.innerHTML = '';
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }
}