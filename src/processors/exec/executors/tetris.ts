import {outputStoreAddLines, outputStoreClear} from "@/components/output/store";
import {OutputElementTypes, TextLinePlainContent} from "@/components/output/types";

const boardWidth = 14;
const boardHeight = 14;
const gameScale = 2;

const timeoutToPromise = (timeout: number) => new Promise<void>(resolve => setTimeout(resolve, timeout));
const figuresList: string[][][] = [
    [
        ['@', '@', '@'],
    ],
    [
        ['.', '@', '.'],
        ['@', '@', '@'],
    ],
    [
        ['.', '@', '@'],
        ['@', '@', '.'],
    ],
    [
        ['@', '@', '.'],
        ['.', '@', '@'],
    ],
    [
        ['@', '.', '.'],
        ['@', '@', '@'],
    ],
    [
        ['.', '.', '@'],
        ['@', '@', '@'],
    ],
    [
        ['@', '@'],
        ['@', '@'],
    ],
];

const getRandomFigure = () => figuresList[Math.floor(Math.random() * figuresList.length)];

const createEmptyBoard = () => {
    const board: string[][] = [];
    for (let i = 0; i < boardHeight; i++) {
        board.push([]);
        for (let j = 0; j < boardWidth; j++) {
            // set walls
            if (j == 0 || j == boardWidth - 1) {
                board[i].push('|');
                continue;
            }

            // set floor
            if (i == boardHeight - 1) {
                board[i].push('-');
                continue;
            }

            // set empty space
            board[i].push('.');
        }
    }

    return board;
}

const squaredClasses = ['terminal__output-line-content--squared'];
const boardSymbolToTextLinePlainContent: Map<string, TextLinePlainContent> = new Map([
    ['.', {text: ' ', type: 'plain'}],
    ['#', {text: '#', type: 'plain', classes: ['terminal__output-line-content--file']}],
    ['@', {text: '@', type: 'plain', classes: ['terminal__output-line-content--executable']}],
    ['-', {text: '-', type: 'plain', classes: ['terminal__output-line-content--directory']}],
    ['|', {text: '|', type: 'plain', classes: ['terminal__output-line-content--directory']}],
]);

const rotateFigureOrNull = (board: string[][]): string[][] | null => {
    const updatedBoard = board.map(row => [...row.map(x => x == '@' ? '.' : x)]);
    const allFigureCoordinates = locateAllFigureSymbols(board);

    if (allFigureCoordinates.length == 1) {
        return null;
    }

    const minX = Math.min(...allFigureCoordinates.map(({x}) => x));
    const maxX = Math.max(...allFigureCoordinates.map(({x}) => x));
    const minY = Math.min(...allFigureCoordinates.map(({y}) => y));
    const maxY = Math.max(...allFigureCoordinates.map(({y}) => y));

    const pivot = {
        x: Math.ceil((minX + maxX) / 2),
        y: Math.ceil((minY + maxY) / 2),
    };

    const rotatedCoordinates = allFigureCoordinates.map(({x, y}) => {
        const relativeX = x - pivot.x;
        const relativeY = y - pivot.y;

        const rotatedX = -relativeY;
        const rotatedY = relativeX;

        return {x: rotatedX + pivot.x, y: rotatedY + pivot.y};
    });

    // check if new coordinates are valid
    if (rotatedCoordinates.some(({x, y}) => x < 1 || x > boardWidth - 2 || y < 0 || y > boardHeight - 2)) {
        return null;
    }

    // check if new coordinates are empty
    if (rotatedCoordinates.some(({x, y}) => !['.', '@'].includes(board[y][x]))) {
        return null;
    }

    // update board
    for (const {x, y} of rotatedCoordinates) {
        updatedBoard[y][x] = '@';
    }

    return updatedBoard;
}

const upScaleResolution = (matrix: string[][], scale: number): string[][] => {
    const updatedMatrix: string[][] = [];
    for (let i = 0; i < matrix.length; i++) {
        const row = matrix[i];
        const upScaledRow: string[][] = [];
        for (let j = 0; j < row.length; j++) {
            const symbol = row[j];
            for (let k = 0; k < scale; k++) {
                if (upScaledRow.length - 1 < k) {
                    upScaledRow.push([]);
                }

                upScaledRow[k].push(...Array.from(Array(scale).keys()).map(() => symbol));
            }
        }

        updatedMatrix.push(...upScaledRow);
    }

    return updatedMatrix;
}

const boardToNodes = (board: string[][]): OutputElementTypes[] =>
    board.map(row =>
        ({
            type: 'text' as 'text',
            content: row.map(symbol => {
                let newSymbol = boardSymbolToTextLinePlainContent.get(symbol);
                if (!newSymbol) {
                    newSymbol = {text: symbol, type: 'plain', classes: []};
                }

                return {
                    ...newSymbol,
                    classes: newSymbol.classes ? [...newSymbol.classes, ...squaredClasses] : [...squaredClasses],
                }
            }),
        }))

const checkIfFigureFits = (board: string[][], figure: string[][], x: number, y: number): boolean => {
    for (let i = 0; i < figure.length; i++) {
        for (let j = 0; j < figure[i].length; j++) {
            const boardX = x + j;
            const boardY = y + i;
            if (board[boardY][boardX] != '.' && figure[i][j] != '.') {
                return false;
            }
        }
    }

    return true;
}

const addFigureToTheBoard = (board: string[][], figure: string[][]): boolean => {
    const findTheMiddleOfTheBoard = () => {
        const middle = Math.floor(boardWidth / 2);
        const isEven = boardWidth % 2 == 0;
        return isEven ? middle : middle + 1;
    }

    if (!checkIfFigureFits(board, figure, findTheMiddleOfTheBoard(), 0)) {
        return false;
    }

    for (let i = 0; i < figure.length; i++) {
        for (let j = 0; j < figure[i].length; j++) {
            const boardX = findTheMiddleOfTheBoard() + j;
            if (figure[i][j] != '.') {
                board[i][boardX] = figure[i][j];
            }
        }
    }

    return true;
}

const mergeMatrixHorizontally = (matrix1: string[][], matrix2: string[][]): string[][] => {
    // Determine the number of rows in the resulting matrix
    const rows = Math.max(matrix1.length, matrix2.length);

    // Initialize an empty result matrix
    const mergedMatrix: string[][] = [];

    for (let i = 0; i < rows; i++) {
        // Check if both matrices have a row at the current index
        const boardRow = matrix1[i] || []; // Default to empty row if it doesn't exist
        const UIRow = matrix2[i] || [];       // Default to empty row if it doesn't exist

        // Concatenate the two rows and push to the result
        mergedMatrix.push([...boardRow, ...UIRow]);
    }

    return mergedMatrix;
}

const wrapBoardWithUI = (board: string[][], nextFigure: string[][], score: number, level: number): string[][] => {
    const UIWidth = 20;
    const UI: string[][] = [];

    const fillAndCenterText = (text: string, width: number) => {
        const textStart = Math.floor((width - text.length) / 2);
        const textEnd = textStart + text.length;
        return Array.from(Array(width).keys()).map((_, index) => index >= textStart && index < textEnd ? text[index - textStart] : ' ');
    }

    const emptyLine = ['|', ...Array.from(Array(UIWidth - 2).keys()).map(() => ' '), '|'];

    const titleUI = fillAndCenterText('TETRIS', UIWidth - 2);
    const scoreUI = fillAndCenterText(`Score: ${score}`, UIWidth - 2);
    const levelUI = fillAndCenterText(`Level: ${level}`, UIWidth - 2);

    UI.push(['+', ...Array.from(Array(UIWidth - 2).keys()).map(() => '-'), '+']);
    UI.push(['|', ...titleUI, '|']);
    UI.push(['+', ...Array.from(Array(UIWidth - 2).keys()).map(() => '-'), '+']);
    UI.push(emptyLine);
    UI.push(['|', ...scoreUI, '|']);
    UI.push(emptyLine);
    UI.push(['|', ...levelUI, '|']);
    UI.push(emptyLine);

    // draw next figure
    const nextFigureText = fillAndCenterText('Next:', UIWidth - 2);
    UI.push(['|', ...nextFigureText, '|']);
    UI.push(emptyLine);
    for (let i = 0; i < nextFigure.length; i++) {
        UI.push(['|', ...fillAndCenterText(nextFigure[i].join(''), UIWidth - 2), '|']);
    }

    UI.push(emptyLine);
    UI.push(emptyLine);
    UI.push(['+', ...Array.from(Array(UIWidth - 2).keys()).map(() => '-'), '+']);
    UI.push(['|', ...fillAndCenterText('Controls:', UIWidth - 2), '|']);
    UI.push(['|', ...fillAndCenterText('Left/Right - move', UIWidth - 2), '|']);
    UI.push(['|', ...fillAndCenterText('Up - rotate', UIWidth - 2), '|']);
    UI.push(['|', ...fillAndCenterText('Esc - exit', UIWidth - 2), '|']);
    UI.push(['+', ...Array.from(Array(UIWidth - 2).keys()).map(() => '-'), '+']);

    return mergeMatrixHorizontally(board, UI);
}

const locateAllFigureSymbols = (b: string[][]) => {
    const result: { x: number, y: number }[] = [];
    for (let i = 0; i < boardHeight; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (b[i][j] == '@') {
                result.push({x: j, y: i});
            }
        }
    }

    return result;
}

const moveFigureDownOrNull = (board: string[][]): string[][] | null => {
    const figureSymbols = locateAllFigureSymbols(board);
    const canMove = figureSymbols.every(({x, y}) => {
        if (y + 1 > boardHeight) {
            return false;
        }

        return ['.', '@'].includes(board[y + 1][x]);
    });

    if (!canMove) {
        return null;
    }

    const updatedBoard = board.map(row => [...row]);
    figureSymbols.reverse().forEach(({x, y}) => {
        updatedBoard[y + 1][x] = board[y][x];
        updatedBoard[y][x] = '.';
    });

    return updatedBoard;
}

const moveFigureHorizontallyOrNull = (board: string[][], direction: 'left' | 'right'): string[][] | null => {
    const figureSymbols = locateAllFigureSymbols(board);
    const canMove = figureSymbols.every(({x, y}) => {
        if (direction == 'left' && x - 1 < 1) {
            return false;
        }

        if (direction == 'right' && x + 1 > boardWidth - 1) {
            return false;
        }

        return ['.', '@'].includes(board[y][direction == 'left' ? x - 1 : x + 1]);
    });

    if (!canMove) {
        return null;
    }

    const updatedBoard = board.map(row => [...row]);
    const symbolsInCorrectOrder = direction == 'left' ? figureSymbols : figureSymbols.reverse();
    for (const {x, y} of symbolsInCorrectOrder) {
        updatedBoard[y][direction == 'left' ? x - 1 : x + 1] = board[y][x];
        updatedBoard[y][x] = '.';
    }

    return updatedBoard;
}

const transformAllFigureSymbolsToInactive = (board: string[][]): string[][] => {
    const updatedBoard = board.map(row => [...row]);
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < boardWidth; j++) {
            if (board[i][j] == '@') {
                updatedBoard[i][j] = '#';
            }
        }
    }

    return updatedBoard;
}

const destroyLastFilledRow = (board: string[][]): string[][] | null => {
    const updatedRow = board.map(row => [...row]);
    for (let i = board.length - 1; i >= 0; i--) {
        // ignore first and last columns
        const row = board[i];
        if (row.every(x => ['|', '#'].includes(x))) {
            updatedRow.splice(i, 1);
            updatedRow.unshift(Array.from(Array(boardWidth).keys()).map((_, index) => {
                if (index == 0 || index == boardWidth - 1) {
                    return '|';
                }

                return '.';
            }));

            return updatedRow;
        }
    }

    return null;
}

const gameLoop = () => new Promise<void>(async resolve => {
            const eventsBackup = window.onkeydown;
            let cancel = false;
            let nextFigure = getRandomFigure();
            let currentFigure: string[][] | null = null;
            let board = createEmptyBoard();
            let score = 0;

            const getLevel = () => Math.floor(score / 2) + 1;
            const getSpeed = () => 250 - (getLevel() - 1) * 25;


            const render = () => {
                outputStoreClear();
                const resizedBoard = upScaleResolution(board, gameScale);
                const wrappedBoard = wrapBoardWithUI(resizedBoard, upScaleResolution(nextFigure, gameScale), score, getLevel());
                outputStoreAddLines(...boardToNodes(wrappedBoard));
            }

            const endCycle = async () => {
                render();
                await timeoutToPromise(getSpeed());
            }

            const endGame = () => {
                const endMessage = "Game over!";
                const finalScore = `Your score: ${score}`;

                outputStoreAddLines({
                    type: 'text',
                    padding: 1,
                    content: {text: endMessage, type: 'plain' as 'plain'}
                });
                outputStoreAddLines({
                    type: 'text',
                    padding: 1,
                    content: {text: finalScore, type: 'plain' as 'plain'}
                });


                window.onkeydown = eventsBackup;
                cancel = true;
                resolve();
            }


            window.onkeydown = (e) => {
                if (e.key == 'Escape' || (e.key == 'c' && e.ctrlKey)) {
                    e.preventDefault();
                    endGame();
                    return;
                }

                if (e.key == 'ArrowLeft') {
                    e.preventDefault();
                    if (!currentFigure) {
                        return;
                    }

                    const updatedBoard = moveFigureHorizontallyOrNull(board, 'left');
                    if (!updatedBoard) {
                        return;
                    }

                    board = updatedBoard;
                    render();
                    return;
                }

                if (e.key == 'ArrowRight') {
                    e.preventDefault();
                    if (!currentFigure) {
                        return;
                    }

                    const updatedBoard = moveFigureHorizontallyOrNull(board, 'right');
                    if (!updatedBoard) {
                        return;
                    }

                    board = updatedBoard;
                    render();
                    return;
                }

                if (e.key == 'ArrowUp') {
                    e.preventDefault();
                    if (!currentFigure) {
                        return;
                    }

                    const updatedBoard = rotateFigureOrNull(board);
                    if (!updatedBoard) {
                        return;
                    }

                    board = updatedBoard;
                    render();
                    return;
                }
            };

            while (!cancel) {
                // if game started or figure was dropped
                if (!currentFigure) {
                    currentFigure = nextFigure;
                    nextFigure = getRandomFigure();
                    if (!addFigureToTheBoard(board, currentFigure)) {
                        endGame();
                        return;
                    }

                    await endCycle();
                    continue;
                }

                // if game is running
                const updatedBoard = moveFigureDownOrNull(board);
                if (!updatedBoard) {
                    board = transformAllFigureSymbolsToInactive(board);
                    await endCycle();

                    let updatedBoard;
                    while ((updatedBoard = destroyLastFilledRow(board)) != null) {
                        score++;
                        board = updatedBoard;
                        await endCycle();
                    }

                    currentFigure = null;
                    continue;
                }

                board = updatedBoard;
                await endCycle();
            }
        }
    )
;

export const tetrisExecutor = () => {
    return gameLoop();
}