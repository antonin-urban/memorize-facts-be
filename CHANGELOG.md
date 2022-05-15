# Changelog

### [1.0.2](https://github.com/antonin-urban/memorize-facts-be/compare/v1.0.1...v1.0.2) (2022-05-15)


### Bug Fixes

* **Docker Compose:** remove needless second postgres container for testing ([aa0d919](https://github.com/antonin-urban/memorize-facts-be/commit/aa0d9195d85ed925ffd4e0368f6f96bc8f849123))


### Other Changes

* **code structure:** rename schemas folder to lists ([034dd37](https://github.com/antonin-urban/memorize-facts-be/commit/034dd37117e9801bd822bfb87690b9e07f570645))

### [1.0.1](https://github.com/antonin-urban/memorize-facts-be/compare/v1.0.0...v1.0.1) (2022-04-11)


### Documentation

* **README:** update basic info about project ([6e81d0a](https://github.com/antonin-urban/memorize-facts-be/commit/6e81d0a5e4c762fe1e3bf1cd627314412bbfd3ce))


### Other Changes

* **dependencies:** update node.js to 16.14 ([8c17025](https://github.com/antonin-urban/memorize-facts-be/commit/8c170257f23e167cd9c5e92372da45fe7da75f68))
* **SemanticRelease:** update rules for changelog ([c5ea609](https://github.com/antonin-urban/memorize-facts-be/commit/c5ea60973160a9b00e0997f683736187846e703c))

## 1.0.0 (2022-04-11)


### Features

* **build:** add build command alias for deploy ([5b99a04](https://github.com/antonin-urban/memorize-facts-be/commit/5b99a0445b3005633ad68f6cef999841461e3630))
* **SemanticRelease:** add config ([0b560ce](https://github.com/antonin-urban/memorize-facts-be/commit/0b560ceb3d8edfb264c395f3e8374e89f34772b9))
* add ScheduleParameters validation, init testing ([3ffe148](https://github.com/antonin-urban/memorize-facts-be/commit/3ffe1480f085e657abd780587f6156c91d92c0c4))
* **CI:** add semantic releasing (locally) ([efb3c05](https://github.com/antonin-urban/memorize-facts-be/commit/efb3c05c77f34f0d751405fd9872ad06c1a4fb11))
* **CI:** init github workflows ([e0a5c6f](https://github.com/antonin-urban/memorize-facts-be/commit/e0a5c6fc8a276f2b8bf56d10ee8154b83b380da5))
* initial commit ([50382a0](https://github.com/antonin-urban/memorize-facts-be/commit/50382a0ddeae564f82eb0710cd09a45fa7ae374f))
* **CI:** split push and merge action to two jobs ([5114021](https://github.com/antonin-urban/memorize-facts-be/commit/51140213402f5e1b800bb19289fa3382291e8347))
* **SemanticRelease:** write changes to changelog files ([3b8c223](https://github.com/antonin-urban/memorize-facts-be/commit/3b8c2233fae42d2eb4842aa5b1522e842571a4d0))


### Bug Fixes

* **release:** add ajv to package.json ([61b0bfc](https://github.com/antonin-urban/memorize-facts-be/commit/61b0bfc7742b2cc71585ad8b80130b7a550e45ed))
* **dependencies:** add ajv-formats dependecy and fix tests ([35121b8](https://github.com/antonin-urban/memorize-facts-be/commit/35121b890ef85074bc652ab11f2d465c69db1e4f))
* **release:** add missing extra pluggin to relese job ([63b99bb](https://github.com/antonin-urban/memorize-facts-be/commit/63b99bb032ad55320ddcbca98bc62db50d0168ec))
* **SemanticRelease:** change changelog commit style ([dd15b56](https://github.com/antonin-urban/memorize-facts-be/commit/dd15b5602afed388fba74bbc9972598ddecd337b))
* **SemanticRelease:** change changelog commit style ([b565333](https://github.com/antonin-urban/memorize-facts-be/commit/b56533396633054c70ded131661e58db786fa3ed))
* **CI:** db port ([7f219b2](https://github.com/antonin-urban/memorize-facts-be/commit/7f219b21fc4487335c6d9d64141b03a9f9db85c0))
* enable migrations, add initial migration, cleaup yarn.lock ([fa9ec8c](https://github.com/antonin-urban/memorize-facts-be/commit/fa9ec8c0ae75020cf1133011e3a3871dcb01e8fc))
* **CI:** expose postgres port number ([61b8d38](https://github.com/antonin-urban/memorize-facts-be/commit/61b8d3895223bd6cfab250949a5860db8c0883d3))
* **SemanticRelease:** fix changelog generating ([406085f](https://github.com/antonin-urban/memorize-facts-be/commit/406085f7b1d17f9e9581794e7e4d6503c0b44bf1))
* **CI:** fix github push and merge ci script ([85d3501](https://github.com/antonin-urban/memorize-facts-be/commit/85d35017479638c5bc558d822724bdb0c86e7993))
* **CI:** fix postgres port ([70b64c9](https://github.com/antonin-urban/memorize-facts-be/commit/70b64c9d236c24547a4cbf9630813c4d8e3f55cb))
* **CI:** remove duplicate job from push_or_merge_to_main_branch ([e2bd73a](https://github.com/antonin-urban/memorize-facts-be/commit/e2bd73a94ff081dee3a7a352f76fdb1e501dca51))
* **CI:** use yarn cache, fix test job ([938364f](https://github.com/antonin-urban/memorize-facts-be/commit/938364f6f3181f6fda5f037a55173ceedb8d5464))
* **CI:** yml file ([4117dac](https://github.com/antonin-urban/memorize-facts-be/commit/4117dac59688248db5313abea3ff62b878f43f7d))


### Other Changes

* **package.json:** add keystone commands ([7e4664e](https://github.com/antonin-urban/memorize-facts-be/commit/7e4664e122e9da5ee1c84bb641ff3e3a6e7b962d))
* **CI:** add release to push or merge action ([6c66210](https://github.com/antonin-urban/memorize-facts-be/commit/6c66210dfffed44b3b0432091ab87a88d1a5755c))
* **CI:** add release workflow ([7149e24](https://github.com/antonin-urban/memorize-facts-be/commit/7149e243d5d85b0c272d2a47f56e0c0f0378d174))
* **CI:** add testing before release ([6a676b8](https://github.com/antonin-urban/memorize-facts-be/commit/6a676b8fe21a9f24ef5e6b0f79148a14e48cd9c0))
* **dependencies:** generate new yarn.lock with public registry ([43dc9fb](https://github.com/antonin-urban/memorize-facts-be/commit/43dc9fb1aa82a0dcbe002935fff9270d71e3e47c))
* **SemanticRelease:** move and update semantic-release config ([f0ccde3](https://github.com/antonin-urban/memorize-facts-be/commit/f0ccde31cca4015d55a087617e90d99198893da3))
* refactor scripts, add coverage to test CI ([bd05451](https://github.com/antonin-urban/memorize-facts-be/commit/bd0545129a78dac3fab4eef90569971fff81a3c1))
* **CI:** remove manual trigger from push_or_merge_to_main_branch ([c936494](https://github.com/antonin-urban/memorize-facts-be/commit/c9364942ecd9592e99d50751dc866aa60d70b2a8))
* **SemanticRelease:** remove unneeded beta release channels and release command ([a8c3623](https://github.com/antonin-urban/memorize-facts-be/commit/a8c362362d1ca6a9cc2da7b25189c6065d8b6d25))
* switch to postgresql, setup local dev enviroment with docker ([3908b17](https://github.com/antonin-urban/memorize-facts-be/commit/3908b17286d328da26627cbe6360ce543d16c073))
