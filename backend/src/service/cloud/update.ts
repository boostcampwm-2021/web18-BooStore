import { updateFile } from "./file";
import { getFilesForUpdate } from "./file";
import { fileDTO } from '../../DTO'

export const updateDir = (loginId:string, filesInfo : fileDTO[], newDir: any) => {
    Promise.all(filesInfo.map(async(file) => {
		if(file.contentType ==='folder'){
            const folderDir = file.directory==='/'? file.directory+file.name: file.directory+'/'+file.name;
            const docs = await getFilesForUpdate(loginId, folderDir);
            const tempDir = (file.directory === '/' || newDir === '/')? newDir : newDir+file.directory;
            updateDir(loginId,docs,tempDir);
            await updateFile(loginId, file.directory, file.name, tempDir);
		}
		else{
			await updateFile(loginId, file.directory, file.name, newDir);
		}	
	}
    )
    )
}
