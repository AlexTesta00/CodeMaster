## [1.3.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.2.0...v1.3.0) (2025-04-13)

### Features

* create docker-compose.yml file to start all microservice ([85b65d9](https://github.com/AlexTesta00/CodeMaster/commit/85b65d9cf63ddef06aa62633331e934e57f640ae))

## [1.2.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.1.4...v1.2.0) (2025-04-12)

### Features

* add entity, value objects and aggregate ([d83a86e](https://github.com/AlexTesta00/CodeMaster/commit/d83a86e4227bb4c648191e9036a5834d00a18b33))
* add entity, value objects and aggregate ([6e3e0dd](https://github.com/AlexTesta00/CodeMaster/commit/6e3e0ddf9f51036cd1964348ee5e3f6b4ffd2775))
* **api:** add api for user-service ([c8b2682](https://github.com/AlexTesta00/CodeMaster/commit/c8b2682e3b0515b24882aa1bac33fc5a3b586c59))
* **api:** add api for user-service ([2b4f52f](https://github.com/AlexTesta00/CodeMaster/commit/2b4f52fd950a97c5400366c98568e825d72ee65f))
* **conversion:** add methods to convert TrophyDocument into Trophy and LevelDocument into Level ([ae62205](https://github.com/AlexTesta00/CodeMaster/commit/ae622053339f8a5ef09845516ee34dcddcec3f96))
* **conversion:** add methods to convert TrophyDocument into Trophy and LevelDocument into Level ([08c4baf](https://github.com/AlexTesta00/CodeMaster/commit/08c4baffa90598c69919a1e6c3aabd1a92677487))
* dockerize user-service ([fd1db0d](https://github.com/AlexTesta00/CodeMaster/commit/fd1db0d1732a82188a4a40c85b32819608a6ba92))
* **factory:** now user, trophy and level can be create trought factory ([d972dcb](https://github.com/AlexTesta00/CodeMaster/commit/d972dcbe826b183192b2009825c395dc3fe21c16))
* **factory:** now user, trophy and level can be create trought factory ([e8e19a0](https://github.com/AlexTesta00/CodeMaster/commit/e8e19a02b41ed1ee9e097014f8e2f80b8c964129))
* implement getAllTophies method and getAllLevels method ([af6fb75](https://github.com/AlexTesta00/CodeMaster/commit/af6fb7586d2a14646d8785af9ee031b81dedfaa4))
* implement getAllTophies method and getAllLevels method ([0ccbd7f](https://github.com/AlexTesta00/CodeMaster/commit/0ccbd7f1e803d6785c168643274be65e6e163a43))
* **level-repository:** now level can be stored in db ([e323480](https://github.com/AlexTesta00/CodeMaster/commit/e3234801dc6d4f4f6f58f0405739b352e84b7850))
* **level-repository:** now level can be stored in db ([1c2c5e9](https://github.com/AlexTesta00/CodeMaster/commit/1c2c5e9245105fbc4707d9fc0ad98eec0268a426))
* **trophy-repository:** now can store trophy ([796b19b](https://github.com/AlexTesta00/CodeMaster/commit/796b19be58ae1852c82820591344fa6bddb88e41))
* **trophy-repository:** now can store trophy ([1d8560b](https://github.com/AlexTesta00/CodeMaster/commit/1d8560bf6fd22c94872b78b458c0cd9ef5411d6f))
* **user-repository:** Add repository to save,find,update,delete user ([93f693c](https://github.com/AlexTesta00/CodeMaster/commit/93f693ce1e9b31917843a8ad8938eeae322cea87))
* **user-repository:** Add repository to save,find,update,delete user ([8b4213e](https://github.com/AlexTesta00/CodeMaster/commit/8b4213ed836a11dd0f83e79f8b79cd0c1d91002f))
* **user-service:** add deleteUser method ([42dd686](https://github.com/AlexTesta00/CodeMaster/commit/42dd686f4bc17423778b1b4a07cf8089816e016c))
* **user-service:** add deleteUser method ([da0922d](https://github.com/AlexTesta00/CodeMaster/commit/da0922d0d6df6f2ffe60883cfc2c0a5f7ca3d3f1))
* **user-service:** implement user-service ([50588be](https://github.com/AlexTesta00/CodeMaster/commit/50588bef2227a8cf2d1ac38a5c74e07322d6b3a3))
* **user-service:** implement user-service ([6d81570](https://github.com/AlexTesta00/CodeMaster/commit/6d8157073e8578934e683f0b57536b05d1d885cf))

### Bug Fixes

* **deps:** update node.js dependencies ([3d21c23](https://github.com/AlexTesta00/CodeMaster/commit/3d21c23ce626d863ca4219c69824b84aa14d1c3a))
* **deps:** update node.js dependencies ([4db0f55](https://github.com/AlexTesta00/CodeMaster/commit/4db0f558e88c3024393d6987307a14300e5a537e))
* **domain:** now classes control the input fileds ([c4dad43](https://github.com/AlexTesta00/CodeMaster/commit/c4dad432f04760f17ba839e6789b4897f33069e4))
* **domain:** now classes control the input fileds ([38f1105](https://github.com/AlexTesta00/CodeMaster/commit/38f110526b261175e4982e9b10389404f0d0d2b3))
* in getAllLevels and in getAllTrophies when trophies and levels are empty return left error ([f0a3c19](https://github.com/AlexTesta00/CodeMaster/commit/f0a3c19502d13bd26cf32498a9eab3672af61350))
* in getAllLevels and in getAllTrophies when trophies and levels are empty return left error ([43f91ec](https://github.com/AlexTesta00/CodeMaster/commit/43f91ecd0697c9a2431f60326fd9336ae73f25e2))
* merge conflict ([ef58c0a](https://github.com/AlexTesta00/CodeMaster/commit/ef58c0a75c08bca5b18af796c912e2531525390f))
* **rebase:** resolve rebase conflict ([0b9960d](https://github.com/AlexTesta00/CodeMaster/commit/0b9960db6948b769e2fe91ed7217abb221af68ad))
* **repository:** now trophy and level repository when get allTrophies or allLevels return an Iterable element without either option ([7ca171c](https://github.com/AlexTesta00/CodeMaster/commit/7ca171c6b50ef70cd04292ed120db87c960d813c))
* **repository:** now trophy and level repository when get allTrophies or allLevels return an Iterable element without either option ([ad1587b](https://github.com/AlexTesta00/CodeMaster/commit/ad1587bafc2b138163a63d35b4a93fa72b238e49))
* **test:** delete console.log ([bea7f37](https://github.com/AlexTesta00/CodeMaster/commit/bea7f37978934feba55ec72ddef2647470cf6ce5))
* **test:** delete console.log ([f20439a](https://github.com/AlexTesta00/CodeMaster/commit/f20439a64147c445b50e065f8ad4b37dafc40dee))
* **user-service:** now in changeTrophies method, old trophies are concat with new trophies ([1d5fbd7](https://github.com/AlexTesta00/CodeMaster/commit/1d5fbd73033eed5b3a57380956b472d3edf295e9))
* **user-service:** now in changeTrophies method, old trophies are concat with new trophies ([821d80f](https://github.com/AlexTesta00/CodeMaster/commit/821d80f73b9405db8bb25862b5b5024539afc265))
* **user:** now when user insert an incorrect URL for CV or Profile Picture cause error ([4a52fea](https://github.com/AlexTesta00/CodeMaster/commit/4a52fea4afa8e4cae09253d3107fabb1bd034ef9))
* **user:** now when user insert an incorrect URL for CV or Profile Picture cause error ([0d85ee0](https://github.com/AlexTesta00/CodeMaster/commit/0d85ee07060fec8c331fe23054a41bb99eaa91b9))

## [1.1.4](https://github.com/AlexTesta00/CodeMaster/compare/v1.1.3...v1.1.4) (2025-04-08)

### Bug Fixes

* **deps:** update node.js dependencies ([1c29cb7](https://github.com/AlexTesta00/CodeMaster/commit/1c29cb790751077cc30b07355dae6fa102e93e0c))

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
