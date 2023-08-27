import {Authorization} from "./Authorization";

export interface User {
    id: number;
    name: string;
    branch: string;
    authorizations: Authorization[];
}

