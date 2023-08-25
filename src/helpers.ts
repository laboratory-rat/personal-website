export const createElement = <T = HTMLDivElement>(tagName: string, className?: string): T => {
    const element = document.createElement(tagName);
    if (className) {
        element.classList.add(...className.split(' '));
    }
    return element as T;
}
