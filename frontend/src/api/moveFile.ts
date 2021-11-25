import { FileDTO } from "@DTO"


export const handleMoveFile= (targetIds: string[], newDirectory: string, curDirectory: string)=>{
    return fetch('/cloud/update',{
        method: 'POST',
        credentials: 'include',
        headers : {"Content-Type" : "application/json"},
        body: JSON.stringify(
            {
                files: targetIds,
                newdir: newDirectory,
                curDirectory: curDirectory
            }
        )
    })
        .then((res) => {
            return res.ok;
        });
}