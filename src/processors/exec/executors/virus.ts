import {FileSystemNodeDirectory, FileSystemNodeLink, fileSystemStore} from "@/store/file_system";
import {outputStoreAddLines} from "@/components/output/store";

const names = [
    'Fluffy_McHoptails',
    'Cinnabunny_Delight',
    'Hops-a-Lot_Sprinkleton',
    'Carrotop_Whiskerbeans',
    'Lopsy_Glitterfluff',
    'BunBun_Cuddletoes',
    'Daisy_Doodleears',
    'Sunny_Honeybun',
    'Twilight_Twinklewhiskers',
    'Marshmallow_Moonhopper',
    'Buttercup_Bunbreeze',
    'Whiskers_Wigglebottom',
    'Toffee_Tumbletail',
    'Cherry_Cheekfluff',
    'Stardust_Snugglebun',
    'Ginger_Jumpinjive',
    'Blueberry_Bouncepaws',
    'Caramel_Cloudskipper',
    'Velvet_Violetears',
    'Peaches_Pufftail',
];

const adresses = [
    'https://www.xvideos.com/',
    'https://www.pornhub.com/',
    'https://xhamster.com/',
    'https://www.xnxx.com/',
    'https://www.youporn.com/',
    'https://hclips.com/',
    'https://www.porn.com/',
    'https://www.tube8.com/',
    'https://spankbang.com/',
    'https://www.ixxx.com/',
    'https://www.sunporno.com/',
    'https://www.pornhd.com/',
    'https://www.porn300.com/',
    'https://pornone.com/',
]

const getRandomName = () => {
    return names[Math.floor(Math.random() * names.length)] + '.link';
}

const getRandomAdress = () => {
    return adresses[Math.floor(Math.random() * adresses.length)];
}

const generateNewLink = (): FileSystemNodeLink => {
    const name = getRandomName();
    return {
        type: 'link',
        name,
        link: getRandomAdress(),
        tmp: true,
    }

}

const directoriesToInfect = (root: FileSystemNodeDirectory): FileSystemNodeDirectory[] => {
    const result: FileSystemNodeDirectory[] = [];
    root.children.forEach(child => {
        if (child.type == 'directory') {
            result.push(child);
            result.push(...directoriesToInfect(child));
        }
    });
    return result;
}

const sleep = () => new Promise(resolve => setTimeout(resolve, 2000));
const virusPromise = () => new Promise<void>( async resolve => {
    const add = (text: string) => {
        outputStoreAddLines({
            type: 'text',
            content: {
                text,
                type: 'plain',
            },
            padding: 1,
        })
    };

    add('Looking for the puppies...');
    await sleep();

    add('Still looking for the puppies...');
    await sleep();

    add('Almost there...');
    await sleep();

    add('Found the puppies!');
    await sleep();

    add('Infecting the puppies...');
    await sleep();

    add('Oups, I mean, the puppies are safe!');
    await sleep();


    add('But no puppies for you!');
    await sleep();

    add('Have a nice day!');
    resolve();
})

export const virusExecutor = () => {
    const root = fileSystemStore.value.root;
    const directories = directoriesToInfect(root);
    directories.forEach(directory => {
        // from 3 to 10 links
        const linksCount = Math.floor(Math.random() * 7) + 3;
        for (let i = 0; i < linksCount; i++) {
            const newLink = generateNewLink();
            directory.children.push(newLink);
        }
    });

    return virusPromise();
}