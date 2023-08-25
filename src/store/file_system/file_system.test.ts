import {fileSystemRelativePathToAbsolutePure} from './file_system.tools';

describe('fileSystemRelativePathToAbsolute', () => {
    it('should return absolute path', () => {
        const path = fileSystemRelativePathToAbsolutePure('/home/oleh', 'Projects', '/home/oleh');
        expect(path).toBe('/home/oleh/Projects');
    });

    it('should return absolute path', () => {
        const path = fileSystemRelativePathToAbsolutePure('/home/oleh', 'Projects/terminal', '/home/oleh');
        expect(path).toBe('/home/oleh/Projects/terminal');
    });

    it('should return absolute path', () => {
        const path = fileSystemRelativePathToAbsolutePure('/home/oleh', '../Projects', '/home/oleh');
        expect(path).toBe('/home/Projects');
    });

    it('should return absolute path', () => {
        const path = fileSystemRelativePathToAbsolutePure('/home/oleh', '/home/..', '/home/oleh');
        expect(path).toBe('/');
    });
});