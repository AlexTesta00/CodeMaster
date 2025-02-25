import bcrypt from "bcrypt";
export class BcryptService {

    static async generateHashForPassword(password: string):Promise<string> {
        const saltRounds: number = 16;
        const salt: string = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    }

    static async isSamePassword(hashedPassword: string, cleanPassword: string): Promise<boolean> {
        return await bcrypt.compare(cleanPassword, hashedPassword);
    }
}