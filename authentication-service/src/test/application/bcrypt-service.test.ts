import {BcryptService} from "../../main/nodejs/codemaster/servicies/authentication/application/bcrypt-service";

describe("Test bcrypt service", () => {
    const timeout: number = 10000;
    const password: string = "abcd1234!";
    let hashedPassword: string;

    beforeAll(async () => {
        hashedPassword = await BcryptService.generateHashForPassword(password);
    }, timeout);


    it("should return different hash for same password", async () => {
        const differentHashForSamePassword: string = await BcryptService.generateHashForPassword(password);
        expect(hashedPassword).not.toBe(differentHashForSamePassword);
    }, timeout);

    it("should return true, because hashed password corresponds to clean password", async () => {
        expect(await BcryptService.isSamePassword(hashedPassword, password)).toBeTruthy();
    }, timeout);

    it("should return true, because hashed password not corresponds to clean password", async () => {
        const notSamePassword: string = "abcd";
        expect(await BcryptService.isSamePassword(hashedPassword, notSamePassword)).not.toBeTruthy();
    }, timeout);
});