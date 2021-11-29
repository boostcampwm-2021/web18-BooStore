import { FileDTO, FileEditAction } from "@DTO"


export const handleMoveFile= (targetIds: string[], newDirectory: string, curDirectory: string)=>{
    const body = {
        targetIds: targetIds,
        newdir: newDirectory,
        curdir: curDirectory,
        action: FileEditAction.move,
    }

    return fetch('/cloud/files',{
        method: 'PATCH',
        credentials: 'include',
        headers : {"Content-Type" : "application/json"},
        body: JSON.stringify(body)
    })
        .then((res) => {
            return res.ok;
        });
}