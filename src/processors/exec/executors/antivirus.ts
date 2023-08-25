import {outputStoreAddLines} from "@/components/output/store";
import {fileSystemAnyTmpNodes, fileSystemRemoveAllTmpNodes, fileSystemStore} from "@/store/file_system";

const sleep = () => new Promise(resolve => setTimeout(resolve, 2000));

const antivirusPromise = () => new Promise<void>(async resolve => {
    const add = (text: string) => {
        outputStoreAddLines({
            type: 'text',
            content: {
                text,
                type: 'plain',
            },
            padding: 1,
        });
    };

    add('Looking for the puppies...');
    await sleep();

    const root = fileSystemStore.value.root;
    const isTmpFilesExists = fileSystemAnyTmpNodes(root);

    if (!isTmpFilesExists) {
        add('No puppies found!');
        await sleep();
        add('Have a nice day!');
        resolve();
        return;
    }

    fileSystemRemoveAllTmpNodes(root);
    add('Oh no! The puppies are infected!');
    await sleep();

    add('Cleaning the puppies...');
    await sleep();

    add('So much puppies...');
    await sleep();

    add('Almost done...');
    await sleep();

    add('Still cleaning the puppies...');
    await sleep();

    add('Done!');
    await sleep();

    add('The puppies are safe!');
    await sleep();

    add('Have a nice day!');
    resolve();
});

export const antivirusExecutor = () => {
    return antivirusPromise();
};
