import {homeDirectory} from "./file_system";
import {FileSystemNode, FileSystemNodeDirectory} from "@/store/file_system/types";

export const fileSystemGetDirectoryOfFile = (path: string, root: FileSystemNode): FileSystemNode | null => {
    const pathParts = path.split('/').filter(part => part !== '');
    let currentNode = root;
    for (const pathPart of pathParts) {
        if (currentNode.type != 'directory') {
            if (pathPart == pathParts[pathParts.length - 1]) {
                return currentNode;
            }

            return null;
        }

        const child = currentNode.children.find(child => child.name === pathPart);
        if (!child) {
            return null;
        }
        currentNode = child;
    }
    return currentNode;
}

const specialSymbolToAction: Map<string, (arr: string[]) => string[]> = new Map([
    ['~', (arr) => homeDirectory.split('/').filter(part => part !== '')],
    ['.', (arr) => arr],
    ['..', (arr) => {
        arr.length && arr.pop();
        return arr;
    }],
    ['', (arr) => arr],
]);

export const fileSystemRelativePathToAbsolute = (currentPath: string, relativePath: string): string => {
    const mergedArr = relativePath.startsWith('/')
        ? relativePath.split('/')
        : [...currentPath.split('/'), ...relativePath.split('/')];


    const merged = mergedArr
        .reduce<string[]>((acc, part) => {
            const shortcut = specialSymbolToAction.get(part);
            if (shortcut) {
                return shortcut(acc);
            }

            acc.push(part);
            return acc;
        }, []);

    return '/' + merged.join('/');
}

const specialSymbolToActionPure: Map<string, (arr: string[], home: string) => string[]> = new Map([
    ['~', (arr, home) => home.split('/').filter(part => part !== '')],
    ['.', (arr) => arr],
    ['..', (arr) => {
        arr.length && arr.pop();
        return arr;
    }],
    ['', (arr) => arr],
]);

export const fileSystemRelativePathToAbsolutePure = (currentPath: string, relativePath: string, homePath: string): string => {
    const mergedArr = relativePath.startsWith('/')
        ? relativePath.split('/')
        : [...currentPath.split('/'), ...relativePath.split('/')];


    const merged = mergedArr
        .reduce<string[]>((acc, part) => {
            const shortcut = specialSymbolToActionPure.get(part);
            if (shortcut) {
                return shortcut(acc, homePath);
            }

            acc.push(part);
            return acc;
        }, []);

    return '/' + merged.join('/');
}

export const fileSystemAddNode = (path: string, node: FileSystemNode, root: FileSystemNodeDirectory): FileSystemNode | null => {
    const pathParts = path.split('/').filter(part => part !== '');
    let currentNode: FileSystemNodeDirectory = root;
    for (const pathPart of pathParts) {
        if (currentNode.type != 'directory') {
            return null;
        }

        const child = currentNode.children.find(child => child.name === pathPart);
        if (!child || child.type != 'directory') {
            return null;
        }

        currentNode = child;
    }
    currentNode.children.push(node);
    return currentNode;
}

export const fileSystemDeleteNode = (path: string, root: FileSystemNodeDirectory): FileSystemNode | null => {
    const pathParts = path.split('/').filter(part => part !== '');
    let currentNode: FileSystemNodeDirectory = root;
    let parent: FileSystemNodeDirectory | null = null;
    for (const pathPart of pathParts) {
        if (currentNode.type != 'directory') {
            return null;
        }

        const child = currentNode.children.find(child => child.name === pathPart);
        if (!child) {
            return null;
        }

        if (pathPart == pathParts[pathParts.length - 1]) {
            currentNode.children = currentNode.children.filter(child => child.name !== pathPart);
            return child;
        }

        if (child.type != 'directory') {
            return null;
        }

        currentNode = child;
    }

    return null;
}

export const fileSystemRemoveAllTmpNodes = (root: FileSystemNodeDirectory): void => {
    root.children = root.children.filter(child => !child.tmp);
    root.children.forEach(child => {
        if (child.type == 'directory') {
            fileSystemRemoveAllTmpNodes(child);
        }
    });
};

export const fileSystemAnyTmpNodes = (root: FileSystemNodeDirectory): boolean => {
    if (root.children.some(child => child.tmp)) {
        return true;
    }

    return root.children.some(child => {
        if (child.type == 'directory') {
            return fileSystemAnyTmpNodes(child);
        }

        return false;
    });
}