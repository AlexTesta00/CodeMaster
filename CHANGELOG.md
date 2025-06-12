## [2.0.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.8.0...v2.0.0) (2025-06-12)

### ⚠ BREAKING CHANGES

* **user:** change route for create level and trophy, now are /create

### Features

* **codequest-service:** add /health route ([b50533f](https://github.com/AlexTesta00/CodeMaster/commit/b50533faef5e77445e7f59d7eafb8bb66b64358d))
* **community-service:** add and integrate rabbitmq ([47be387](https://github.com/AlexTesta00/CodeMaster/commit/47be3871a531f1486418d355c279598ddb041fde))
* **community-service:** add community service repository ([893ffa6](https://github.com/AlexTesta00/CodeMaster/commit/893ffa64934b096427ac1655047cb8773162b2e9))
* **community-service:** add community-service api and tests ([b183afb](https://github.com/AlexTesta00/CodeMaster/commit/b183afb4a6c2300ebb093097243aa6db3bf8909b))
* **community-service:** add community-service service and tests ([6528c91](https://github.com/AlexTesta00/CodeMaster/commit/6528c9189fdfa0f16fc61b22f4eddb5a0eae7922))
* **community-service:** add community-service to nginx configuration file ([eabae3e](https://github.com/AlexTesta00/CodeMaster/commit/eabae3efccf4001a590487947253f93e27a11158))
* **community-service:** add job in workflow to upload community-service code coverage and dockerfile ([06bc2f3](https://github.com/AlexTesta00/CodeMaster/commit/06bc2f34acede1cd7eb166937bad2b3ce2529371))
* **community-service:** add new service community-service ([cc3a5f0](https://github.com/AlexTesta00/CodeMaster/commit/cc3a5f02bdaf6f01df890b1b758fb5cc5f3f9e42))
* **community-service:** add repository tests ([330a32c](https://github.com/AlexTesta00/CodeMaster/commit/330a32c9c90d10f61ae3a961d4e17a35c0ea33b2))
* **community-service:** create comment model with factory ([55b51f4](https://github.com/AlexTesta00/CodeMaster/commit/55b51f40a8e20df6d2a5761479ae68ddd7261ddf))
* **docker:** add community-service container to docker compose file ([506cbc5](https://github.com/AlexTesta00/CodeMaster/commit/506cbc5409d9f022b592c6e6b092777a2b8c4219))
* **solution-service:** add /health route to check if mongo is up ([1bcfdab](https://github.com/AlexTesta00/CodeMaster/commit/1bcfdab478a97087ea4c8bbcfc06713a810cf023))
* **user:** now level have imageUrl fields ([5212d66](https://github.com/AlexTesta00/CodeMaster/commit/5212d6632bc0a34f576277f7d1091807a4f2530e))

### Bug Fixes

* **codequest-service:** set db connection uri for tests ([769536c](https://github.com/AlexTesta00/CodeMaster/commit/769536cfb524881eca65f1bbca2637f9c7c065be))
* **community-service:** resolve issue related to mongodb connection ([639ba28](https://github.com/AlexTesta00/CodeMaster/commit/639ba28c29e7dcb9d768ce96fe174a25cfbf065d))
* **deps:** update node.js dependencies ([c99f26b](https://github.com/AlexTesta00/CodeMaster/commit/c99f26b1ed92827b614034f0fdc554ddbc0340f3))
* **deps:** update node.js dependencies ([3c995bd](https://github.com/AlexTesta00/CodeMaster/commit/3c995bd51aeb94ac0e6be7be8f7609f5cb41923f))
* **solution-service:** fix detekt issues ([34804fd](https://github.com/AlexTesta00/CodeMaster/commit/34804fdccd734da90ab27bb4a4822089283446af))
* **user:** change route for create level and trophy, now are /create ([fa37645](https://github.com/AlexTesta00/CodeMaster/commit/fa376456185a2136fcfbc6950f0ea48d148c2861))

## [1.8.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.7.0...v1.8.0) (2025-06-05)

### Features

* **authenticaton:** add /status route for check if authentication service is ready ([188825e](https://github.com/AlexTesta00/CodeMaster/commit/188825ef5a101987cee119baa1687e42adab49f3))
* **docker:** now when start services in production, the user-service and authentication-service db populating ([e1cda6f](https://github.com/AlexTesta00/CodeMaster/commit/e1cda6f9ad5b4015af260f0d715cd23a790554df))
* **user:** add /status for check if user service is ready or not ([8be2a30](https://github.com/AlexTesta00/CodeMaster/commit/8be2a304eb0d04a703b6856196a91a57aa6cd119))

### Bug Fixes

* **api-gateway:** update nginx configuration file ([ae208f5](https://github.com/AlexTesta00/CodeMaster/commit/ae208f51973f4ad0d61abacb5f5d264ff6361343))
* **solution-service:** files to be executed are compressed before pass them to container ([a957a77](https://github.com/AlexTesta00/CodeMaster/commit/a957a77ba2be02b064fe785b59f5dff28d210ddc))
* **user:** fixing a bug that did not allow multiple users to be saved because trophyschema title and level grade are unique ([d018ac2](https://github.com/AlexTesta00/CodeMaster/commit/d018ac223a07f1017d35f319d5a5a0c3653ed4ce))

## [1.7.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.6.3...v1.7.0) (2025-06-03)

### Features

* **authentication:** add publisher, when user call register or delete API, the events are publish in exchange ([168f94d](https://github.com/AlexTesta00/CodeMaster/commit/168f94dede197a87301497728ff30b206dccb996))
* **authentication:** add publisher, when user call register or delete API, the events are publish in exchange ([0031870](https://github.com/AlexTesta00/CodeMaster/commit/0031870b156e694176af055a5b9b4339ba98cd52))
* **authentication:** add publisher, when user call register or delete API, the events are publish in exchange ([c6a777b](https://github.com/AlexTesta00/CodeMaster/commit/c6a777b0f1df134d1c6e2b1c8dcdb26422a625e7))
* **authentication:** add RabbitMQ dependency ([035e155](https://github.com/AlexTesta00/CodeMaster/commit/035e1550bda23017b5ad89892e7271075db5102f))
* **authentication:** add RabbitMQ dependency ([21586b9](https://github.com/AlexTesta00/CodeMaster/commit/21586b9d1e299a2ab69b812fab2352942b4cbf17))
* **authentication:** add RabbitMQ dependency ([0c58e3a](https://github.com/AlexTesta00/CodeMaster/commit/0c58e3afe19bc927e963ca0cabaa83f2229408df))
* **docker:** now rabbitMq have a healt_check and all depends_on have a condition ([843f4d5](https://github.com/AlexTesta00/CodeMaster/commit/843f4d5d0f2b5367da3dbc0720694d0d004a2063))
* **docker:** now rabbitMq have a healt_check and all depends_on have a condition ([1179077](https://github.com/AlexTesta00/CodeMaster/commit/11790774a55278be64185c485a0847fce21ebe3c))
* **gateway:** add gateway service ([2126f78](https://github.com/AlexTesta00/CodeMaster/commit/2126f782f5bdbba5eef05f77198eb69274f00fe0))
* **user:** add rabbit consumer, when user call register or deleting API, user-service record or delete the user ([fb35db9](https://github.com/AlexTesta00/CodeMaster/commit/fb35db9b288e31838e8c1dd7e5b430085998bc8b))
* **user:** add rabbit consumer, when user call register or deleting API, user-service record or delete the user ([ee6f25e](https://github.com/AlexTesta00/CodeMaster/commit/ee6f25ed48df671b82131ac25d88cc8d4415a879))
* **user:** add rabbit consumer, when user call register or deleting API, user-service record or delete the user ([789ea65](https://github.com/AlexTesta00/CodeMaster/commit/789ea65b1b96fe2a2240b266483bdd3346f26796))
* **user:** add RabbitMQ dependency ([8c07553](https://github.com/AlexTesta00/CodeMaster/commit/8c075533f5b4e5424e15a02aafdc2d581a174592))
* **user:** add RabbitMQ dependency ([5aa4fb7](https://github.com/AlexTesta00/CodeMaster/commit/5aa4fb7568be42c870a44d43149b62fccb73fefe))
* **user:** add RabbitMQ dependency ([3ec400f](https://github.com/AlexTesta00/CodeMaster/commit/3ec400f5164ac786db25b96d82bc6cb1aa8adbf1))

### Bug Fixes

* **ci:** add env variable for rabbitMQ ([2adcdf2](https://github.com/AlexTesta00/CodeMaster/commit/2adcdf276e456a5c2f2ac732a428e2c28d1cea66))
* **ci:** add env variable for rabbitMQ ([8ebc037](https://github.com/AlexTesta00/CodeMaster/commit/8ebc037ab015754b453813afae6eaabed17815a1))
* **ci:** add env variable for rabbitMQ ([bce8340](https://github.com/AlexTesta00/CodeMaster/commit/bce8340f6713e60cca6b8cf2d6cb6ed09c853c34))
* **deps:** update node.js dependencies ([5e8466e](https://github.com/AlexTesta00/CodeMaster/commit/5e8466e75fef204f0b0f5f2c5d295837966cc972))
* **gateway:** remove build task from gradle ([97d91e1](https://github.com/AlexTesta00/CodeMaster/commit/97d91e1943a815ee28fa13dc5dae0176058653ea))

## [1.6.3](https://github.com/AlexTesta00/CodeMaster/compare/v1.6.2...v1.6.3) (2025-05-30)

### Bug Fixes

* **ci:** change command to execute and compile kotlin code ([b513b22](https://github.com/AlexTesta00/CodeMaster/commit/b513b222348edd244263825a46623ab2e8c0fe8c))
* **ci:** set permission for directory /build/tmp/code-run/out ([eb1320d](https://github.com/AlexTesta00/CodeMaster/commit/eb1320db6f56c25d3003f7b7cea5b456880f27aa))
* **solution-service:** set permission directory /out to execute kotlin code ([269cd27](https://github.com/AlexTesta00/CodeMaster/commit/269cd27efb51eb1f6ff5258ec8257b976f3315b4))
* **solution-service:** set permission of /code directory in docker command ([e3f007f](https://github.com/AlexTesta00/CodeMaster/commit/e3f007ff6b0a35f9cf94b78c54459f0fe0c006bb))
* **solution-service:** set permissions when launching docker command ([d6a2a6f](https://github.com/AlexTesta00/CodeMaster/commit/d6a2a6fe43903dd71f26282eee07850585b68576))

## [1.6.2](https://github.com/AlexTesta00/CodeMaster/compare/v1.6.1...v1.6.2) (2025-05-23)

### Bug Fixes

* **docker:** fix docker jar path ([b69a465](https://github.com/AlexTesta00/CodeMaster/commit/b69a465ae7623e3307b3c218378f75ad3a46eb71))
* **docker:** fix dockerfile ([7da1277](https://github.com/AlexTesta00/CodeMaster/commit/7da1277d895e456446d22fe3ab4b91528adc4933))
* **gradle:** add task to build multi-lang-runner docker image ([ffa7499](https://github.com/AlexTesta00/CodeMaster/commit/ffa749989939e69bc55ef417af5b01194e2b6f2d))
* **gradle:** fix task to build multi lang runner ([4232006](https://github.com/AlexTesta00/CodeMaster/commit/42320069fced15549510b608f66a1dec89ee0074))
* **service:** change javascript support to kotlin support ([a69e80e](https://github.com/AlexTesta00/CodeMaster/commit/a69e80e0105b43c94e14d81390929313e9dc3a30))
* **service:** change javascript support to kotlin support ([79453e3](https://github.com/AlexTesta00/CodeMaster/commit/79453e305fada153180ce06642e8c41612e858df))
* **solution:** change container name to multi-lang-runner:latest ([fb01528](https://github.com/AlexTesta00/CodeMaster/commit/fb01528b6e33ae9d74c9fbd6a6016c915c645761))

## [1.6.1](https://github.com/AlexTesta00/CodeMaster/compare/v1.6.0...v1.6.1) (2025-05-23)

### Bug Fixes

* **docker:** fix docker jar path ([1450a9c](https://github.com/AlexTesta00/CodeMaster/commit/1450a9c64d1ef21908d312c80a12784221842d36))

## [1.6.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.5.0...v1.6.0) (2025-05-23)

### Features

* **build:** add uuid dependency ([24ad266](https://github.com/AlexTesta00/CodeMaster/commit/24ad2661cd31e6b4896b575cfa3ec17258121f6c))
* **codemaster:** add solution-service service ([abf3d8a](https://github.com/AlexTesta00/CodeMaster/commit/abf3d8aa92e96c3eb4f6e85a573130b310c824c2))
* **docker:** change dockerfile to run code in a container ([d93817c](https://github.com/AlexTesta00/CodeMaster/commit/d93817caafea8728fad6d763e762921e1cb5bd1e))
* **multi-lang-runner:** add dockerfile with a script for executing solution code and update CI-CD ([48ccab5](https://github.com/AlexTesta00/CodeMaster/commit/48ccab59e5632a4561db1ef0edc949e05ed780d5))
* **solution-repository:** add solution repository and test ([0c18d61](https://github.com/AlexTesta00/CodeMaster/commit/0c18d61e9f2f99b4bb2222766e5461b0b8ca6bcf))
* **solution-service:** add controller and Application with tests ([b5d30c9](https://github.com/AlexTesta00/CodeMaster/commit/b5d30c920601bfa4dc76234b01b8a07e5859ba33))
* **solution-service:** add execution service ([ce22ab7](https://github.com/AlexTesta00/CodeMaster/commit/ce22ab7fafd5d4adeb24f4a79cb9263f38e382bc))
* **solution-service:** add new repository functionalities ([f553051](https://github.com/AlexTesta00/CodeMaster/commit/f55305119b1db4939f172df733d90ac08ec4996e))
* **solution-service:** add new service solution-service ([6744ff8](https://github.com/AlexTesta00/CodeMaster/commit/6744ff8f168695a3f9f6f10c72eb189bb6f1a5a6))
* **solution-service:** add solution factory and test ([2c47d8d](https://github.com/AlexTesta00/CodeMaster/commit/2c47d8d753a346370e24380ee8018de6e3aa05c0))
* **solution-service:** add solution model and tests ([620412f](https://github.com/AlexTesta00/CodeMaster/commit/620412f41211fd35b34281b4ebe32feb59f037fd))
* **solution-service:** add solution repository ([79976c3](https://github.com/AlexTesta00/CodeMaster/commit/79976c3807cec24da53c3d743e1708fb1a9aef0d))
* **solution-service:** add solution service ([47e4106](https://github.com/AlexTesta00/CodeMaster/commit/47e41061d971a45d8f56147848420922642596f0))
* **solution-service:** add solution service dockerfile and update ci-cd ([4e8d34b](https://github.com/AlexTesta00/CodeMaster/commit/4e8d34b589bd2ff78570cd02a4ac4a7267478ff4))
* **solution-service:** add solution-service service with tests ([8a3db19](https://github.com/AlexTesta00/CodeMaster/commit/8a3db19dc3ead29fb353bf21a5b321a6d0fc32e3))
* **solution-service:** add templates to assemble main file to execute ([a7296d5](https://github.com/AlexTesta00/CodeMaster/commit/a7296d56ed4b7eddd66eb11bf3435bb327753965))
* **solution-service:** add testCode field to generate file to execute ([7eddb7e](https://github.com/AlexTesta00/CodeMaster/commit/7eddb7ea29d330a96a4930a66713b0fc1d3462ad))

### Bug Fixes

* **git:** resolve merge conflict ([358ddcd](https://github.com/AlexTesta00/CodeMaster/commit/358ddcd933feda875ae0e8ca6e6f1d0e36545e7a))
* **gradle:** fix gradle test plugins issue ([8a364a9](https://github.com/AlexTesta00/CodeMaster/commit/8a364a90b556178f43b167c20445f283333cab77))
* **solution-repository:** fix tests to pass CI-CD ([b4665b8](https://github.com/AlexTesta00/CodeMaster/commit/b4665b8210ba7bc75dc3f23bce08ab8e5fcf7366))

## [1.5.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.4.0...v1.5.0) (2025-05-22)

### Features

* **authentication:** add possibility to ban and unban user from only admin account ([6c9bc7b](https://github.com/AlexTesta00/CodeMaster/commit/6c9bc7bf67895a1c20e2ac594fb60693734cadc2))
* **authentication:** now it's possible to get all users ([729067b](https://github.com/AlexTesta00/CodeMaster/commit/729067b44c433e1b108c6324378922dd5efdf56f))

### Bug Fixes

* **authentication:** for update, change put with patch ([0725942](https://github.com/AlexTesta00/CodeMaster/commit/072594282b4bcc20798d48dbd01167bb1306c7b6))
* **deps:** update dependency fp-ts to v2.16.10 ([4848095](https://github.com/AlexTesta00/CodeMaster/commit/4848095ea10c8a5eae42d65cc80424bea8bf0130))

## [1.4.0](https://github.com/AlexTesta00/CodeMaster/compare/v1.3.2...v1.4.0) (2025-05-22)

### Features

* **authentication:** add findAllUsers and possibility to ban and unban user ([4ad2808](https://github.com/AlexTesta00/CodeMaster/commit/4ad2808b31d0bfd67628038b662c46c725615011))
* **authentication:** in authentication service, delete jwt-service and bycript-service and rewrite all function in functional programming style in particular function return Either<Error, Somethings>, this makes system more robust ([5ad322c](https://github.com/AlexTesta00/CodeMaster/commit/5ad322cd359d93cc96a58c7b27a68c3651d7acdd))
* **authentication:** now user have role. Role can be type of 'admin' or 'user' ([bf0eb24](https://github.com/AlexTesta00/CodeMaster/commit/bf0eb2430308fc5fe2765b0a5b7e8e879e3b9db0))
* **authentication:** now user-factory and user-repository look like more functional, delete getUserRefreshToken from user-repository because UserManager aggragate contains refresh token ([e39d599](https://github.com/AlexTesta00/CodeMaster/commit/e39d5992c5305f0d266c9e20a2035774dbce30c6))
* **authentication:** remove error-handler middelwere, adapt api controller to current business logic, and adapt test to the current controller ([2cf8207](https://github.com/AlexTesta00/CodeMaster/commit/2cf8207014110d2199052f88814995cdb0855902))
* **authentication:** remove error-handler middelwere, adapt api controller to current business logic, and adapt test to the current controller ([1e70952](https://github.com/AlexTesta00/CodeMaster/commit/1e709528e24b7febe009e8a16194dfcf71a56007))
* **frontend:** in authentication service, delete jwt-service and bycript-service and rewrite all function in functional programming style in particular function return Either<Error, Somethings>, this makes system more robust ([accecaf](https://github.com/AlexTesta00/CodeMaster/commit/accecaf386e62a78f826521385f62d1f6077224f))

### Bug Fixes

* **authentication:** change password regex ([f9a69ba](https://github.com/AlexTesta00/CodeMaster/commit/f9a69ba2a1532fa8fa07a140806156554576b6ec))
* **authentication:** change password regex ([d575231](https://github.com/AlexTesta00/CodeMaster/commit/d5752319965f2fccba20702c2227343a320d5141))
* **authentication:** fix bug that was causing tests fail ([6b9f3e2](https://github.com/AlexTesta00/CodeMaster/commit/6b9f3e2250ebb0ccb035396eee1e48c27a2e4f08))
* **authentication:** fix merge ([7b3e0f6](https://github.com/AlexTesta00/CodeMaster/commit/7b3e0f69830ed1580978a750628f4e02d7bc3599))
* **authentication:** fix port listen into server.ts ([f2c03bd](https://github.com/AlexTesta00/CodeMaster/commit/f2c03bd187cc547ad796ac46599b8880a99573a6))
* **authentication:** fix port listen into server.ts ([95e82be](https://github.com/AlexTesta00/CodeMaster/commit/95e82bec88caa4b0ec4445dd7bc63deade0ec18e))
* **authentication:** integrate latest fix from develop ([30875f0](https://github.com/AlexTesta00/CodeMaster/commit/30875f096582f3bd8fc23ef57e7f934f9498d681))
* **authentication:** launch server.ts and not app.ts ([2b6199a](https://github.com/AlexTesta00/CodeMaster/commit/2b6199a1c433fd8f50a2ed12ac9cffced5aaa62f))
* **authentication:** launch server.ts and not app.ts ([b2244fa](https://github.com/AlexTesta00/CodeMaster/commit/b2244fa9cb821d03304ce58c5c1041c4fcf7f57e))
* **authentication:** merge update from main ([10ed4d3](https://github.com/AlexTesta00/CodeMaster/commit/10ed4d37aea43c3064f6881f25a695af3dc9f61c))
* **deps:** update dependency mongoose to v8.14.3 ([93408f1](https://github.com/AlexTesta00/CodeMaster/commit/93408f169d2473d585d0f76f4914b717660aff8c))
* **deps:** update node.js dependencies ([5cb01a8](https://github.com/AlexTesta00/CodeMaster/commit/5cb01a860727ce9eee0e36121929c5c9b7f73bc0))
* **deps:** update node.js dependencies ([41d01f8](https://github.com/AlexTesta00/CodeMaster/commit/41d01f8d456ca91ffc204e2e5b545beaa180db2b))
* **deps:** update node.js dependencies ([90ef2f1](https://github.com/AlexTesta00/CodeMaster/commit/90ef2f1fd0f6a6fbe6a45c06f3423ada3e589db8))
* **deps:** update node.js dependencies ([4dcdcdb](https://github.com/AlexTesta00/CodeMaster/commit/4dcdcdbe70ee80e528ccf941df4ea5626407feb8))
* **deps:** update node.js dependencies ([50eb3b7](https://github.com/AlexTesta00/CodeMaster/commit/50eb3b759f0de0b68879bad682ee2b9d8dd5c0e8))

## [1.3.2](https://github.com/AlexTesta00/CodeMaster/compare/v1.3.1...v1.3.2) (2025-05-14)

### Bug Fixes

* **authentication:** fix bug that was causing tests fail ([d14f173](https://github.com/AlexTesta00/CodeMaster/commit/d14f1739c8213e8473857ed31e06a9d3bea41408))
* **deps:** update dependency mongoose to v8.14.3 ([b8cf44e](https://github.com/AlexTesta00/CodeMaster/commit/b8cf44e10e89219c5261d63c74622a8bec171905))
* **deps:** update node.js dependencies ([f8af8d3](https://github.com/AlexTesta00/CodeMaster/commit/f8af8d367b5e367d8a48c734ac18beb7c5254123))
* **deps:** update node.js dependencies ([41f3032](https://github.com/AlexTesta00/CodeMaster/commit/41f303293148e0fff05f16714920f65dca7f084c))
* **deps:** update node.js dependencies ([72fffcc](https://github.com/AlexTesta00/CodeMaster/commit/72fffcc8244768dd7bc76a683b2c41c2bcb1bb9e))

## [1.3.1](https://github.com/AlexTesta00/CodeMaster/compare/v1.3.0...v1.3.1) (2025-04-14)

### Bug Fixes

* **coverage:** fix bug in coverage ([ed11fc3](https://github.com/AlexTesta00/CodeMaster/commit/ed11fc3df3944f8485d4e7abd0d758837ab532ad))

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
