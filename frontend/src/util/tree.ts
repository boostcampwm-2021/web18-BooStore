import { Console } from 'console';
import { Children } from 'react';
import { isParseTreeNode } from 'typescript';

export interface treeNode {
	relativeDirectory: string;
	parentDirectory: string;
	children: Map<string, treeNode>;
}

export const makeTree = (arr: Array<string[]>) => {
	const root: treeNode = {
		relativeDirectory: '/',
		parentDirectory: '',
		children: new Map(),
	};

	arr.forEach((el) => {
		let newNode = arrToNode(el);
		insertNode(root, newNode);
	});
	return root;
};

const insertNode = (root: treeNode, node: treeNode) => {
	const copiedNode = { ...node };
	const parent = findParent(root, copiedNode);
	parent.children.set(copiedNode.relativeDirectory, copiedNode);
};

const findParent = (parent: treeNode, node: treeNode) => {
	if (parent.relativeDirectory === node.parentDirectory) {
		return parent;
	}

	for (let child of parent.children) {
		parent = findParent(child[1], node);
		if (parent.relativeDirectory === node.parentDirectory) {
			break;
		}
	}

	return parent;
};

const arrToNode = (arr: string[]) => {
	return {
		relativeDirectory: arr.join('/'),
		parentDirectory: arr.length == 2 ? '/' : arr.slice(0, -1).join('/'),
		children: new Map(),
	};
};
