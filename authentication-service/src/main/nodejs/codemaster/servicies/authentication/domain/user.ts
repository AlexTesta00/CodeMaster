import { UserId } from "./user-id";

export class User{
    readonly id: UserId;
    email: string;
    password: string;

    constructor(id: UserId, email: string, password: string){
        this.id = id;
        this.email = email;
        this.password = password;
    }
}