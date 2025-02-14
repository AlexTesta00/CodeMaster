import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserRepository } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-repository';
import { UserRepositoryImpl } from '../../main/nodejs/codemaster/servicies/authentication/infrastructure/user-repository-impl';
import { UserModel } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-model';
import { UserFactory } from '../../main/nodejs/codemaster/servicies/authentication/domain/user-factory';
import { User } from '../../main/nodejs/codemaster/servicies/authentication/domain/user';

describe('TestUserRepository', () => {
    let mongoServer: MongoMemoryServer;
    let repository: UserRepository;
    const nickname: string = 'example';
    const email: string = 'example@example.com';
    const password: string = 'Test1234!';
    const user: User = UserFactory.createUser(nickname, email, password);
    const emailNotInDatabase: string = 'exampleexample@example.com';
    const nicknameNotInDatabase: string = 'nonexistent';
    const timeout: number = 10000;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri);
        repository = new UserRepositoryImpl();
    }, timeout);

    beforeEach(async () => {
        await repository.save(user);
    }, timeout);

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    }, timeout);

    afterEach(async () => {
        await UserModel.deleteMany({});
    }, timeout);

    async function computeHashedPassword(password: string, salt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) reject(err);
                resolve(hash);
            });
        });
    }

    describe('Test save operation', () => {
        it('should save a user to the database', async () => {
            const foundUser = await UserModel.findOne({ nickname: nickname }).exec();
            expect(foundUser).not.toBeNull();
            expect(foundUser?.nickname).toBe(nickname);
            expect(foundUser?.email).toBe(email);
            const hashedPassword: string = await computeHashedPassword(password, foundUser!.salt);
            expect(foundUser?.password).toBe(hashedPassword);
        }, timeout);

    });

    describe('Test findUserByNickname operation', () => {
        it('should find a user by nickname', async () => {
            const foundUser = await repository.findUserByNickname(nickname);
            expect(foundUser).not.toBeNull();
            const user = foundUser![0];
            const salt = foundUser![1];
            expect(user.id.value).toBe(nickname);
            expect(user.email).toBe(email);
            const hashedPassword: string = await computeHashedPassword(password, salt.value);
            expect(user.password).toBe(hashedPassword);
        }, timeout);

        it('should return null if user is not found', async () => {
            const foundUser = await repository.findUserByNickname(nicknameNotInDatabase);
            expect(foundUser).toBeNull();
        }, timeout);
    });

    describe('Test findUserByEmail operation', () => {
        it('should find a user by email', async () => {
            const foundUser = await repository.findUserByEmail(email);
            expect(foundUser).not.toBeNull();
            const user = foundUser![0];
            const salt = foundUser![1];
            expect(user.id.value).toBe(nickname);
            expect(user.email).toBe(email);
            const hashedPassword: string = await computeHashedPassword(password, salt.value);
            expect(user.password).toBe(hashedPassword);
        }, timeout);

        it('should return null if user is not found', async () => {
            const foundUser = await repository.findUserByEmail(emailNotInDatabase);
            expect(foundUser).toBeNull();
        }, timeout);
    });

    describe('Test update function', () => {
        it('should update user email', async () => {
            const newEmail: string = 'example.example@example.com';
            await repository.updateUserEmail(nickname, newEmail);
            const foundUser = await UserModel.findOne({ nickname: nickname }).exec();
            expect(foundUser).not.toBeNull();
            expect(foundUser?.email).toBe(newEmail);
        }, timeout);

        it('should update user password', async () => {
            const newPassword: string = 'Test12345!';
            await repository.updateUserPassword(nickname, newPassword);
            const foundUser = await UserModel.findOne({ nickname: nickname }).exec();
            expect(foundUser).not.toBeNull();
            const hashedPassword: string = await computeHashedPassword(newPassword, foundUser!.salt);
            expect(foundUser?.password).toBe(hashedPassword);
        }, timeout);
    });

    describe('Test delete function', () => {
        it('should delete a user', async () => {
            await repository.deleteUser(nickname);
            const foundUser = await UserModel.findOne({ nickname: nickname }).exec();
            expect(foundUser).toBeNull();
        }, timeout);
    });
    
});