export class Validator{
    private static NICKNAME_REGEX: RegExp = /^[a-zA-Z0-9_]{3,10}$/; //Only letter, number and underscore. Min 3, max 10 characters
    private static EMAIL_REGEX: RegExp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    private static PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

    static isValidEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }

    static isValidNickname(nickname: string): boolean{
        return this.NICKNAME_REGEX.test(nickname);
    }

    static isValidPassword(password: string): boolean{
        return this.PASSWORD_REGEX.test(password);
    }
}