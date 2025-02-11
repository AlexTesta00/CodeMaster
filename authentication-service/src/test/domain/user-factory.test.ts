import bcrypt from 'bcrypt';
import { UserFactory } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-factory';
import { UserId } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-id';

describe('TestUserFactory', () => {
    it('should create user with correct value', async () => {
        const userId = new UserId('example');
        const email = 'test@example.com';
        const password = 'Test1234!';

        const user = await UserFactory.createUser(userId.value, email, password);
        const salt = user[1];
        const hashedPassword = await bcrypt.hash(password, salt);

        expect(user[0].id.value).toBe(userId.value);
        expect(user[0].email).toBe(email);
        expect(salt).toBeDefined();
        expect(user[0].password).toBe(hashedPassword);
    }, 10000);

    it('should throw error when create user with invalid email', async () => {
        const userId = new UserId('example');
        const email = 'testexample.com';
        const password = 'Test1234!';

        try{
            await UserFactory.createUser(userId.value, email, password);
            expect(true).toBe(false);
        } catch (error){
            expect(error instanceof Error).toBe(true);
            if(error instanceof Error){
                expect(error.message).toBe('Invalid email format');
            }else{
                fail('Expected an instance of Error')
            }
        }

    }, 10000);

    it('should throw error when create user with invalid nickname', async () => {
        const userId = new UserId('example@!1232');
        const email = 'test@example.com';
        const password = 'Test1234!';

        try{
            await UserFactory.createUser(userId.value, email, password);
            expect(true).toBe(false);
        } catch (error){
            expect(error instanceof Error).toBe(true);
            if(error instanceof Error){
                expect(error.message).toBe('Invalid nickname: must contain only letters, numbers or underscores and be between 3 and 10 characters long.');
            }else{
                fail('Expected an instance of Error')
            }
        }

    }, 10000);

    it('should throw error when create user with invalid password', async () => {
        const userId = new UserId('example');
        const email = 'test@example.com';
        const password = 'test1234';

        try{
            await UserFactory.createUser(userId.value, email, password);
            expect(true).toBe(false);
        } catch (error){
            expect(error instanceof Error).toBe(true);
            if(error instanceof Error){
                expect(error.message).toBe('Invalid password: must contain at least 8 characters, one uppercase letter, one number and one special character.');
            }else{
                fail('Expected an instance of Error')
            }
        }

    }, 10000);
});