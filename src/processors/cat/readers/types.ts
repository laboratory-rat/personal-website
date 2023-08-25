import {FileSystemNode} from "@/store/file_system";
import {OutputElementTypes} from "@/components/output/types";

export type ContentReaderType = (content: FileSystemNode) => OutputElementTypes[] | OutputElementTypes;
