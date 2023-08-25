import {createElement} from "@/helpers";
import {ILogger} from "@/utils/logger";
import {inputStore, inputStoreInputCommand} from "@/components/input/store";
import "./styles.scss";
import {
    fileSystemGetDirectoryOfFile,
    fileSystemRelativePathToAbsolute,
    fileSystemStore
} from "@/store/file_system";
import {guessableProcessorsList} from "@/processors";
import {contextStore} from "@/store/context";

export class InputComponent {
    protected container!: HTMLDivElement;
    protected input!: HTMLInputElement;
    protected prefix!: HTMLDivElement;
    protected subscriptions: Array<() => unknown> = [];

    constructor(protected rootElement: Element, protected logger: ILogger) {
        this.setup();
    }

    protected setup() {
        this.container = createElement('div', 'terminal__input');
        this.prefix = createElement<HTMLDivElement>('div', 'terminal__input-prefix');
        this.input = createElement<HTMLInputElement>('input', 'terminal__input-text');

        this.container.appendChild(this.prefix);
        this.container.appendChild(this.input);

        this.subscriptions.push(inputStore.subscribe(this.render.bind(this)));
        this.subscriptions.push(fileSystemStore.subscribe(this.render.bind(this)));
        this.subscriptions.push(contextStore.subscribe(this.render.bind(this)));
        this.render();
        this.rootElement.appendChild(this.container);

        const moveCaretToEnd = () => {
            setTimeout(() => {
                this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
            }, 1);
        }

        window.onkeydown = (e) => {
            const isOccupied = contextStore.value.occupied;
            if (isOccupied) {
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                inputStoreInputCommand(this.input.value);
                this.input.value = '';

            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                inputStoreInputCommand('clear');
                this.input.value = '';

            } else if (e.key === 'ArrowUp' && inputStore.value.history.length > 0) {
                e.preventDefault();
                const newHistoryIndex = inputStore.value.historyIndex == 0 ? inputStore.value.history.length - 1 : inputStore.value.historyIndex - 1;
                inputStore.update((state) => ({
                    ...state,
                    historyIndex: newHistoryIndex,
                    input: inputStore.value.history[newHistoryIndex],
                    preview: true,
                }))
                this.input.focus();
                moveCaretToEnd();

            } else if (e.key === 'ArrowDown' && inputStore.value.history.length > 0) {
                e.preventDefault();
                const newHistoryIndex = inputStore.value.historyIndex == inputStore.value.history.length - 1 ? 0 : inputStore.value.historyIndex + 1;
                inputStore.update((state) => ({
                    ...state,
                    historyIndex: newHistoryIndex,
                    input: inputStore.value.history[newHistoryIndex],
                    preview: true,
                }));
                this.input.focus();
                moveCaretToEnd();

            } else if (e.key == 'Tab') {
                e.preventDefault();

                // guess the command
                const input = this.input.value;
                let parts = input.split(' ');
                if (parts.length < 2) {
                    if (!parts[0].startsWith('./')) {
                        return;
                    }

                    parts = ['', parts[0]];
                }

                const command = parts[0];
                const commandToFilter = command.length ? command : parts[1];
                if (!guessableProcessorsList.some(processor => processor.regex.test(commandToFilter))) {
                    return;
                }

                const route = parts[1];
                if (route.endsWith('/')) {
                    return;
                }

                const routeParts = route.split('/');
                const lastRoutePart = routeParts[routeParts.length - 1];
                const routeWithoutLastPart = routeParts.length > 1 ? routeParts.slice(0, routeParts.length - 1).join('/') : '';
                const absolutePath = fileSystemRelativePathToAbsolute(fileSystemStore.value.currentPath, routeWithoutLastPart)
                const node = fileSystemGetDirectoryOfFile(absolutePath, fileSystemStore.value.root);
                if (!node || node.type !== 'directory') {
                    return;
                }

                const children = node.children;
                const matchingChildren = children.filter(child => child.name.startsWith(lastRoutePart));
                if (!matchingChildren.length) {
                    return;
                }

                let prefix = routeWithoutLastPart.length ? routeWithoutLastPart + '/' : '';
                prefix = command.length ? `${command} ${prefix}` : prefix;

                if (matchingChildren.length == 1) {
                    this.input.value = matchingChildren[0].type == 'directory'
                        ? prefix + matchingChildren[0].name + '/'
                        : prefix + matchingChildren[0].name;
                    return;
                }

                // find the longest match in name
                const longestMatch: string = matchingChildren.reduce((acc, child) => {
                    const name = child.name;
                    if (!acc.length) {
                        return name;
                    }

                    let i = 0;
                    while (i < acc.length && i < name.length && acc[i] === name[i]) {
                        i++;
                    }

                    return acc.slice(0, i);
                }, "");

                this.input.value = `${prefix}${longestMatch}`;
                moveCaretToEnd();
            }
        }

        this.logger.debug('TerminalInputWindow.setup', this.rootElement, this.container);
    }

    public render() {
        if (contextStore.value.occupied) {
            this.container.classList.add('terminal__input--occupied');
            return;
        }

        this.container.classList.remove('terminal__input--occupied');
        this.input.focus();
        this.prefix.innerHTML = `<span class="terminal__input-prefix-content"><span class="terminal__input-prefix-user">${fileSystemStore.value.user}@${fileSystemStore.value.host}:</span><span class="terminal__input-prefix-path">${fileSystemStore.value.currentPath}</span>$</span>`;
        this.input.value = inputStore.value.input;
    }

    public dispose() {
        this.rootElement.innerHTML = '';
        this.subscriptions.forEach(unsubscribe => unsubscribe());
    }
}