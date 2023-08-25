export type FileSystemNodeTypes = 'file' | 'directory' | 'executable' | 'link' | 'command';

type _BaseSystemNode<Type extends FileSystemNodeTypes> = {
    type: Type;
    name: string;
    tmp?: boolean;
}

export type FileSystemNodeDirectory = _BaseSystemNode<'directory'> & {
    children: FileSystemNode[];
};

export type FileSystemNodeFile = _BaseSystemNode<'file'> & {
    content: string;
};

export type FileSystemNodeExecutable = _BaseSystemNode<'executable'> & {
    id: string;
}

export type FileSystemNodeLink = _BaseSystemNode<'link'> & {
    link: string;
};

export type FileSystemNodeCommand = _BaseSystemNode<'command'> & {
    link: string;
};

export type FileSystemNode =
    FileSystemNodeDirectory
    | FileSystemNodeFile
    | FileSystemNodeExecutable
    | FileSystemNodeLink
    | FileSystemNodeCommand;