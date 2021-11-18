import { Console } from "console";
import { Children } from "react";
import { isParseTreeNode } from "typescript"

interface treeNode{
    relativeDirectory: string; 
    parentDirectory: string;
    children : treeNode[];
}

const root: treeNode = {
    relativeDirectory: '/',
    parentDirectory: '',
    children: []
}

export const makeTree = (arr : Array<string[]>)=>{
     // 루트 디렉토리는 이미 넣어뒀으니까 잘라준다
    console.log("make tree start");

    arr.forEach((el)=>{
        let newNode = arrToNode(el);
       // console.log("newNode:"+JSON.stringify(newNode));
        insertNode(newNode);
    })
    console.log("final\n"+JSON.stringify(root));
}

const insertNode = (node : treeNode) => {
    const copiedNode = {...node};
    const parent = findParent(root,node);
    parent.children.push(copiedNode);
    console.log('parent:'+parent.relativeDirectory+'\n'+"child:"+copiedNode.relativeDirectory);
}

const findParent = (parent: treeNode,node: treeNode) => {
    console.log('curparent:'+parent.relativeDirectory+'...curnode:'+node.relativeDirectory);
    if(parent.relativeDirectory === node.parentDirectory){
        console.log('found!');
        return parent;
    }
    for(let i=0; i<parent.children.length;i++){
        parent= findParent(parent.children[i],node);
        return parent;
    }
    return parent;
}

const deleteNode = (node : treeNode) => {

}

const arrToNode = (arr : string[] ) => {
    return ({
        relativeDirectory: arr.join('/'),
        parentDirectory: arr.length==2? '/' : arr.slice(0,-1).join('/'),
        children: []
    })
}