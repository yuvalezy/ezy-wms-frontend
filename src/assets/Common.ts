import {Authorization} from "./Authorization";

export interface User {
    id: number;
    name: string;
    branch: string;
    authorizations: Authorization[];
}

export interface Item {
    code: string;
    name: string;
    father: string;
    boxNumber?: number;
}

export function distinctItems(items: Item[]): string[] {
    return items
        .map(item => item.father??item.code)
        .filter((code, index, array) => array.indexOf(code) === index);
}