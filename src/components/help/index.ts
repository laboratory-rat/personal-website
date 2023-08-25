import {ILogger} from "@/utils/logger";

export class HelpComponent {
    private subscriptions: Array<() => unknown> = [];

    constructor(protected rootElement: HTMLElement, protected logger: ILogger) {
        this.setup();
    }

    protected setup() {
        this.logger.debug('HelpComponent.setup', this.rootElement);
    }
}