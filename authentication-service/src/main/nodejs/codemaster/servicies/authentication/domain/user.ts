import { UserId } from "./user-id";

export class User{
    constructor(public readonly id: UserId, 
                public email: string, 
                public password: string){}
}