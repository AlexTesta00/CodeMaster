import { UserId } from "./user-id";

export class User{
    constructor(public readonly id: UserId, 
                public readonly email: string,
                public readonly password: string){}
}