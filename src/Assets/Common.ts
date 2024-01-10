import {Authorization} from "./Authorization";

export interface User {
    id: number;
    name: string;
    branch: string;
    binLocations: boolean;
    authorizations: Authorization[];
}

export interface Item {
    code: string;
    name: string;
    father: string;
    boxNumber?: number;
}

export enum ResponseStatus {
    Error = 'Error',
    Ok = 'Ok'
}

export function distinctItems(items: Item[]): string[] {
    return items
        .map(item => item.father ?? item.code)
        .filter((code, index, array) => array.indexOf(code) === index);
}