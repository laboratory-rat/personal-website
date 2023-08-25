export class AppStore<T> {
    private state!: T;
    private listeners: Array<(store: T) => void> = [];

    constructor(initialState: T) {
        this.state = initialState;
    }

    public get value(): T {
        return this.state;
    }

    public set value(value: T) {
        this.state = value;
        this.listeners.forEach(listener => listener(this.state));
    }

    public update(updateFn: (state: T) => T) {
        this.value = updateFn(this.value);
    }

    public updatePartial(updateFn: (state: Partial<T>) => Partial<T>) {
        this.value = {
            ...this.value,
            ...updateFn(this.value),
        } as T;
    }

    public subscribe(listener: (store: T) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        }
    }
}