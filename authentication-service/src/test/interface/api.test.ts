import {app} from "../../main/nodejs/codemaster/servicies/authentication/app";
import supertest from "supertest";
import {
    BAD_REQUEST, CONFLICT,
    CREATED, INTERNAL_ERROR,
    OK,
    UNAUTHORIZED
} from "../../main/nodejs/codemaster/servicies/authentication/interfaces/status";


describe('Test API', () => {
   const timeout: number = 10000;
   const request = supertest(app);
    const newUser = {
        "nickname": "example",
        "email": "example@example.com",
        "password": "Test1234!"
    };

   describe('Test Register', () => {
       it('should return 201 and user register', async () => {
           const response = await request
               .post("/authentication/register")
               .send(newUser)
               .set("Accept", "application/json")

           expect(response.status).toBe(CREATED);
           expect(response.body.message).toBe("User registered");
           expect(response.body.success).toBe(true);
           expect(response.body.user).toHaveProperty("id.value", newUser.nickname);
           expect(response.body.user).toHaveProperty("email", newUser.email);
       }, timeout);

       it('should return 400 and user not register because wrong password format', async () => {
           const badPasswordNewUser = {
               "nickname": "example",
               "email": "example@example.com",
               "password": "weakpassword"
           };

           const response = await request
               .post("/authentication/register")
               .send(badPasswordNewUser)
               .set("Accept", "application/json")

           expect(response.status).toBe(BAD_REQUEST);
           expect(response.body.success).toBe(false);
           expect(response.body.message).toBe("Invalid password format, at least 8 characters, one uppercase letter, one number and one special character");
       }, timeout);

       it('should return 400 and user not register because wrong nickname format', async () => {
           const badNicknameNewUser = {
               "nickname": "example@%$^@(#%!^@(%^",
               "email": "example@example.com",
               "password": "Test1234!"
           };

           const response = await request
               .post("/authentication/register")
               .send(badNicknameNewUser)
               .set("Accept", "application/json")

           expect(response.status).toBe(BAD_REQUEST);
           expect(response.body.success).toBe(false);
           expect(response.body.message).toBe("Invalid nickname format, only letter, number and underscore. Min 3, max 10 characters");
       }, timeout);

       it('should return 400 and user not register because wrong email format', async () => {
           const badEmailNewUser = {
               "nickname": "example",
               "email": "example.com",
               "password": "Test1234!"
           };

           const response = await request
               .post("/authentication/register")
               .send(badEmailNewUser)
               .set("Accept", "application/json")

           expect(response.status).toBe(BAD_REQUEST);
           expect(response.body.success).toBe(false);
           expect(response.body.message).toBe("Invalid email format");
       }, timeout);

       it('should return 409 and user not register because user already exist', async () => {
           const newUser = {
               "nickname": "example",
               "email": "example@example.com",
               "password": "Test1234!"
           };

           const response = await request
               .post("/authentication/register")
               .send(newUser)
               .set("Accept", "application/json")

           expect(response.status).toBe(CONFLICT);
           expect(response.body.success).toBe(false);
           expect(response.body.message).toBe("User already exist");
       }, timeout);
   });

    describe('Test Login', () => {

        it('should return 200 and user correct logged in by nickname', async () => {
            const existUserNickname = {
                'nickname': newUser.nickname,
                'password': newUser.password
            };

            const response = await request
                .post("/authentication/login")
                .send(existUserNickname)
                .set("Accept", "application/json")

            expect(response.status).toBe(OK);
            expect(response.body.message).toBe("User LoggedIn")
            expect(response.body.success).toBe(true)
            expect(response.body.token).toBeDefined()
        }, timeout);

        it('should return 200 and user correct logged in by email', async () => {
            const existUserEmail = {
                'email': newUser.email,
                'password': newUser.password
            };

            const response = await request
                .post("/authentication/login")
                .send(existUserEmail)
                .set("Accept", "application/json")

            expect(response.status).toBe(OK);
            expect(response.body.message).toBe("User LoggedIn")
            expect(response.body.success).toBe(true)
            expect(response.body.token).toBeDefined()
        }, timeout);

        it('should return 400 beacause user have insert an incorrect password but correct nickname', async () => {
            const incorrectPassword = {
                'nickname': newUser.nickname,
                'password': 'incorrect'
            };

            const response = await request
                .post("/authentication/login")
                .send(incorrectPassword)
                .set("Accept", "application/json")

            expect(response.status).toBe(BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid Credentials");
        }, timeout);

        it('should return 400 beacause user have insert an incorrect password but correct email', async () => {
            const incorrectPassword = {
                'email': newUser.email,
                'password': 'incorrect'
            };

            const response = await request
                .post("/authentication/login")
                .send(incorrectPassword)
                .set("Accept", "application/json")

            expect(response.status).toBe(BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid Credentials");
        }, timeout);

        it('should return 400 beacause user not exist', async () => {
            const incorrectNickname = {
                'nickname': 'notExistUser',
                'password': 'incorrect'
            };

            const response = await request
                .post("/authentication/login")
                .send(incorrectNickname)
                .set("Accept", "application/json")

            expect(response.status).toBe(BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("User not found");
        }, timeout);
    });

    describe('Test Logout', () => {

        it('should return 200 for correct user logout', async () => {
            const correctUser = {
                'nickname': newUser.nickname
            };

            const response = await request
                .post("/authentication/logout")
                .send(correctUser)
                .set("Accept", "application/json")

            expect(response.status).toBe(OK);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User LoggedOut");
        }, timeout);

        it('should return 400 because user not exist', async () => {
            const incorrectUser = {
                'nickname': 'imnotexist'
            };

            const response = await request
                .post("/authentication/logout")
                .send(incorrectUser)
                .set("Accept", "application/json")

            expect(response.status).toBe(BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("User not found");
        }, timeout);


    });

    describe('Test RefreshToken', () => {

        beforeAll(async () => {
            const existUserNickname = {
                'nickname': newUser.nickname,
                'password': newUser.password
            };

            await request
                .post("/authentication/login")
                .send(existUserNickname)
                .set("Accept", "application/json")
        }, timeout);

        it('should return 200 and correct refreshing token', async () => {
            const correctUser = {
                'nickname': newUser.nickname
            };

            const response = await request
                .post("/authentication/refresh-access-token")
                .send(correctUser)
                .set("Accept", "application/json")

            expect(response.status).toBe(OK);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("User Access Token refreshed");
            expect(response.body.token).toBeDefined();
        }, timeout);

        it('should return 400 beacuse user not exist', async () => {
            const incorrectUser = {
                'nickname': 'imnotexist'
            };

            const response = await request
                .post("/authentication/refresh-access-token")
                .send(incorrectUser)
                .set("Accept", "application/json")

            expect(response.status).toBe(BAD_REQUEST);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("User not found");
        }, timeout);

        it('should return 500 beacuse user not logged in', async () => {
            const correctUser = {
                'nickname': newUser.nickname
            };

            await request
                .post("/authentication/logout")
                .send(correctUser)
                .set("Accept", "application/json")

            const response = await request
                .post("/authentication/refresh-access-token")
                .send(correctUser)
                .set("Accept", "application/json")

            expect(response.status).toBe(INTERNAL_ERROR);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid RefreshToken");
        }, timeout);
    });
});