import { FileEditAction } from "@DTO";
import { handleFiles } from 'api';


export const handleMoveFile= (targetIds: string[], newDirectory: string, curDirectory: string)=>{
    const body = {
        targetIds: targetIds,
        newdir: newDirectory,
        curdir: curDirectory,
        action: FileEditAction.move,
    }

    return handleFiles('PATCH',body);
}