import {helpProcessor} from "@/processors/help";
import {fallbackProcessor} from "@/processors/fallback";
import {clearProcessor} from "@/processors/clear";
import {lsProcessor} from "@/processors/ls";
import {cdProcessor} from "@/processors/cd";
import {catProcessor} from "@/processors/cat";
import {execProcessor} from "@/processors/exec";

export const processorsList = [
    helpProcessor,
    lsProcessor,
    cdProcessor,
    catProcessor,
    execProcessor,
    clearProcessor,
    fallbackProcessor,
];

export const guessableProcessorsList = processorsList.filter((processor) => processor.guessable);
