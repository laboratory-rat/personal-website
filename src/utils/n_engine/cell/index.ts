import {ActivationType} from "@/utils/n_engine/activation";

export type Cell<CellType> = {
    type: CellType;
}

export type CellInput = Cell<'input'> & {
    type: 'input';
}

export type CellHidden = Cell<'hidden'> & {
    type: 'hidden';
    activation: ActivationType;
}

export type CellOutput = Cell<'output'> & {
    type: 'output';
    activation: ActivationType;
}