import { FileDTO } from "@DTO"


export const handleMoveFile= (selectedFiles: FileDTO[], newDirectory: string)=>{
    return fetch('/cloud/update',{
        method: 'POST',
        credentials: 'include',
        headers : {"Content-Type" : "application/json"},
        body: JSON.stringify(
            {
                "files":{selectedFiles},
                "newdir":{newDirectory}
            }
        )
    })
        .then((res) => {
            return res.status;
        });
}