interface treeNode{
    curDirectory: string;
    relativeDirectory: string; 
    parentDirectory: string;
    children : treeNode[];
}
export const tree = {
    insert:(node : treeNode)=>{

    }
}

const arrToNode = (arr : string[], ) =>{
    if( arr.length === 0){
        return ({
            curDirectory: '내 스토어',
            relativeDirectory: '/',
            parentDirectory: '',
        })
    }
    return ({
        curDirectory: arr[-1],
        relativeDirectory: arr.join('/'),
        parentDirectory: arr.length===1? '/' : arr[-2]
    })
}