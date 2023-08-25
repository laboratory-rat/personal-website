import {createElement} from "@/helpers";

import {ILogger, LogLevel, Logger} from "@/utils/logger";
import {InputComponent} from "@/components/input";
import {OutputComponent} from "@/components/output/outputComponent";
import {inputStore, inputStoreGetLastCommandOrNull} from "@/components/input/store";
import {processorsList} from "@/processors";
import {outputStoreAddLines} from "@/components/output/store";
import {addInvitationToInput} from "@/processors/helpers";
import {contextStore} from "@/store/context";
import {contextStoreSetOccupied} from "@/store/context/tools";
import "./styles.scss";

export class TerminalEngine {
    protected logger!: ILogger;
    protected appContainer!: Element;
    protected output!: OutputComponent;
    protected input!: InputComponent;
    protected helpContainer!: HTMLDivElement;
    protected subscriptions: Array<() => unknown> = [];

    constructor(selectorOrElement: string | Element, protected logLevel: LogLevel = 'info') {
        this.logger = new Logger(logLevel);
        const appContainer = selectorOrElement instanceof Element ? selectorOrElement : document.querySelector(selectorOrElement);
        if (!appContainer) {
            this.logger.error(`Container with selector ${selectorOrElement} is not found`);
            throw new Error(`Container with selector ${selectorOrElement} is not found`);
        }

        this.appContainer = appContainer;
        this.startup();
    }

    protected startup() {
        const terminalContainer = createElement('div', 'terminal__container');
        const terminalIOContainer = createElement('div', 'terminal__io flex-2');
        terminalContainer.appendChild(terminalIOContainer);

        this.output = new OutputComponent(terminalIOContainer, this.logger);

        const inputContainer = createElement('div', 'terminal__input-container');
        terminalIOContainer.appendChild(inputContainer);
        this.input = new InputComponent(inputContainer, this.logger);

        this.helpContainer = createElement<HTMLDivElement>('div', 'terminal__help');
        terminalContainer.appendChild(this.helpContainer);

        this.appContainer.appendChild(terminalContainer);

        // store setup
        this.subscriptions.push(inputStore.subscribe((state) => {
            if (state.preview) {
                return;
            }

            const lastCommand = inputStoreGetLastCommandOrNull();
            if (!lastCommand) {
                return;
            }

            this.processCommand(lastCommand);
        }));

        this.logger.debug('TerminalEngine.startup', this.appContainer, terminalContainer, terminalIOContainer, this.output, inputContainer, this.helpContainer);
    }

    public processCommand(command: string, muteCommandDisplay?: boolean) {
        this.logger.debug('TerminalEngine.processCommand', command);
        !muteCommandDisplay && outputStoreAddLines(addInvitationToInput(command));

        const matched = processorsList.find(processor => processor.match(command));
        if (!matched) {
            outputStoreAddLines({
                type: 'text',
                content: {
                    text: 'Command not found',
                    type: 'plain',
                },
            });
            return;
        }

        const chainAction = matched.action(command);
        if (!chainAction) {
            return;
        }

        // if is promise
        if (chainAction instanceof Promise) {
            contextStoreSetOccupied(contextStore, true);
            chainAction.finally(() => {
                contextStoreSetOccupied(contextStore, false);
            });
        }
    }

    public getOutputLinesCapacity(): number {
        return this.output.getMaxLinesCapacity();
    }

    public dispose() {
        this.subscriptions.forEach(unsubscribe => unsubscribe());

        this.input.dispose();
        this.output.dispose();

        this.appContainer.innerHTML = '';
    }
}

