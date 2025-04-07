## [1.1.3](https://github.com/AlexTesta00/CodeMaster/compare/v1.1.2...v1.1.3) (2025-04-07)

### Bug Fixes

* **codequest-service:** solve eslint/jest errors ([0f93825](https://github.com/AlexTesta00/CodeMaster/commit/0f9382587e267b0148126df46770847b22f3f354))

## [1.1.2](https://github.com/AlexTesta00/CodeMaster/compare/v1.1.1...v1.1.2) (2025-04-04)

### Bug Fixes

* **deps:** update node.js dependencies ([10213af](https://github.com/AlexTesta00/CodeMaster/commit/10213af629cb1ad2648929ff47a3e627c437eac2))

## [1.1.1](https://github.com/AlexTesta00/CodeMaster/compare/v1.1.0...v1.1.1) (2025-03-26)

### Bug Fixes

* **deps:** update node.js dependencies ([8587905](https://github.com/AlexTesta00/CodeMaster/commit/85879058fb1c4a7aede863dbc9e8cc6e09a59f7b))
* **deps:** update node.js dependencies ([102d13b](https://github.com/AlexTesta00/CodeMaster/commit/102d13b5bae395a84a6e387622caacf48074e57d))

## [1.1.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.0.0...v1.1.0) (2025-03-11)

### Features

* **auth-service:** Add file for manage dependencies and gradle build, Add entity user, Add value object user-id for identify user by nickname, add user-factory to create an user in a correct way, add database for create connection to db, add user-repository to retrive user ([5a47593](https://github.com/AlexTesta00/CodeMaster/commit/5a4759380cf236fb979c56fe83d6377a52bbf518))
* **authentication-api:** create authentication-routes.ts authentication-controller.ts db-connection.ts app.ts status.ts for create server and expose API ([f5364a5](https://github.com/AlexTesta00/CodeMaster/commit/f5364a5b177a5c55f1b5e52cc5a9346c96091807))
* **authentication-controller:** now when user logged in recive a cookie ([569e11e](https://github.com/AlexTesta00/CodeMaster/commit/569e11e27f5e6f274e94bb1bf766b7d99ec9f437))
* **authentication-service:** add authentication-service ([192b7c2](https://github.com/AlexTesta00/CodeMaster/commit/192b7c21c00ee053fdaea7f5e0d3c44e2d566926))
* **authentication-service:** add possibility to updateEmail, updatePassword and deleteUser ([01d5dde](https://github.com/AlexTesta00/CodeMaster/commit/01d5dded932b84ef6864ee516b228d969acfcfe9))
* **authentication:** now when user is already logged in, the system don't require credentials but verify user through cookies ([9a1b2e4](https://github.com/AlexTesta00/CodeMaster/commit/9a1b2e421de8e73e024a2e182a64304579d04617))
* **bcrypt-service:** now user-repository not encrypt data, bcrypt-service is used in authentication-service, user-model no longer has salt value ([873b6a0](https://github.com/AlexTesta00/CodeMaster/commit/873b6a02e76fc58b25b0b0a160e7296da4ee39be))
* **docker:** dockerize authentication service ([7f3a67c](https://github.com/AlexTesta00/CodeMaster/commit/7f3a67cb219021d3e0920202b79a9d3eb8a4c691))
* **jwt-service:** add jwt service for manage jwt token ([c70c30c](https://github.com/AlexTesta00/CodeMaster/commit/c70c30cc4d1882bbddfa92944d57ec580536827b))
* **salt:** now user in db have a salt value for more security ([19ce7f4](https://github.com/AlexTesta00/CodeMaster/commit/19ce7f4a559d223dd161a9a9b327f2da7e0447dd))
* **user-model:** add user schema for mongodb ([525fb4b](https://github.com/AlexTesta00/CodeMaster/commit/525fb4be1aca272c77090b2633ed35f227d564d2))
* **user-repository:** add getUserRefreshToken and UpdateUserRefreshToken feature ([aa48298](https://github.com/AlexTesta00/CodeMaster/commit/aa48298f492f0074d0b997da2e2a0e6fcb3121bd))
* **user-repository:** Add method to updateUserEmail, updateUserPassword and delete user ([ff3174a](https://github.com/AlexTesta00/CodeMaster/commit/ff3174a0ba688d8778d40c2dcb3d0de6700d0445))
* **user-repository:** add verifyUserCredentialsByNickname and verifyUserCredentialsByEmail, to check user ([547c9a8](https://github.com/AlexTesta00/CodeMaster/commit/547c9a87178ec440b0feb2dcd117139b0c00e220))
* **user-repository:** now an user can save into db ([dbf1b53](https://github.com/AlexTesta00/CodeMaster/commit/dbf1b5303fe7168320d8291d91049cf126161135))
* **user-repository:** Remove verifyUserCredentials methods ([9518c2f](https://github.com/AlexTesta00/CodeMaster/commit/9518c2fc104a7f788e2ce7498a6f521ca1a81762))
* **validator:** add validator class for check nickname, email, password fairness ([69aa550](https://github.com/AlexTesta00/CodeMaster/commit/69aa550893df3aafe419d3be494bee12e87950bd))

### Bug Fixes

* **ci:** Now build can execute in branch differt of main ([9ccec95](https://github.com/AlexTesta00/CodeMaster/commit/9ccec95216c54f44d87cad8d3dd064fad3855e45))
* **dockerfile:** fix port ([e5e0036](https://github.com/AlexTesta00/CodeMaster/commit/e5e0036ad326667c90608ddf3795f3dfedd6316e))
* **node:** fix dependency ([4257a15](https://github.com/AlexTesta00/CodeMaster/commit/4257a15ae6347a61fcf3909708e19412a1dc52ff))
* **status:** fix status code and export app for testing ([4b5a468](https://github.com/AlexTesta00/CodeMaster/commit/4b5a468ff55166bfc203d25aa2e3fa4e13f6e534))
* **test:** jest ignore dist dir for execute test ([80ff8cb](https://github.com/AlexTesta00/CodeMaster/commit/80ff8cbb393c9bab614c5fad664593a8f0ad86d8))
* **user-repository-test:** Add timeout time ([c8d4310](https://github.com/AlexTesta00/CodeMaster/commit/c8d4310b45591706a5c1f48d89cd2b70179d6a3a))

## 1.0.0 (2025-02-15)

### Features

* **git:** Add .gitignore file config for Intellij, Gradle, Kotlin, VSCode, Node, Vue ([d0170ce](https://github.com/AlexTesta00/CodeMaster/commit/d0170ce6f7d708dcfc212ba3fc496d6fc07683e6))
* **renovate:** Add renovate configuration file for Gradle and Npm dependency versioning ([78015b4](https://github.com/AlexTesta00/CodeMaster/commit/78015b48a118853ea3c09858569bd426f0630668))
* **semantic-release:** Add package.json for semantic-release bot ([0bc1c73](https://github.com/AlexTesta00/CodeMaster/commit/0bc1c7311cc43b1024f7dfa1b6d27c4b82b55411))

### Bug Fixes

* **gradle-wrapper:** Add distributionSha256Sum properties to resolve gradle warning ([3f2972e](https://github.com/AlexTesta00/CodeMaster/commit/3f2972eaa76931d3cd9c168632b4998daa2578e2))
* **gradle:** Add checksum for gradle wrapper ([ca9d62b](https://github.com/AlexTesta00/CodeMaster/commit/ca9d62b9df21727db6c3eb95c4ec265546a23e05))
* **release:** Delete changelog [skip ci] ([d3d5a4e](https://github.com/AlexTesta00/CodeMaster/commit/d3d5a4e0faad4c14500a0c5070668b7b71c298f1))
* **release:** fix package.json for start versioning form 0.1.0 [skip ci] ([60e155f](https://github.com/AlexTesta00/CodeMaster/commit/60e155f8f3284f8cdd3f5df2ab952657759c7796))
* **release:** fix release problem [skip ci] ([600a9fc](https://github.com/AlexTesta00/CodeMaster/commit/600a9fc2c547d4ce03c319b6e8c0ef39cdacd35f))
* **release:** fix version ([1fdd2d4](https://github.com/AlexTesta00/CodeMaster/commit/1fdd2d48df9c7714930f98cfc327080b562007a7))
