# Changelog

## [0.13.0](https://github.com/grafana/k6-studio/compare/v0.12.0...v0.13.0) (2025-02-13)


### Features

* Add switch toggle to enabled/disable rules ([#442](https://github.com/grafana/k6-studio/issues/442)) ([963dd6e](https://github.com/grafana/k6-studio/commit/963dd6ed544244df5820a287c64dddc9835d4bbd))
* Show actions menu button when hover over file item ([#466](https://github.com/grafana/k6-studio/issues/466)) ([95cf6ff](https://github.com/grafana/k6-studio/commit/95cf6ffe34930bead3e5963bf2b63f3f49523cc6))
* Simpler default file names ([#453](https://github.com/grafana/k6-studio/issues/453)) ([445202e](https://github.com/grafana/k6-studio/commit/445202e4fbff6e9a4624f6a5b25d819793ea86c3))


### Bug Fixes

* empty state url ([#461](https://github.com/grafana/k6-studio/issues/461)) ([04311a6](https://github.com/grafana/k6-studio/commit/04311a6382d4705cd724067c5b6f39f470094c39))
* Filename tooltip obscures other files ([#449](https://github.com/grafana/k6-studio/issues/449)) ([704be28](https://github.com/grafana/k6-studio/commit/704be28e6792f47b5ea1c3cc84ee8eed2babc590))
* Generated path is incorrect when saving script on Windows ([#452](https://github.com/grafana/k6-studio/issues/452)) ([24577e9](https://github.com/grafana/k6-studio/commit/24577e96d2b88803c7e52fd25982a8eaff8203fb))
* intel mac proxy ([#467](https://github.com/grafana/k6-studio/issues/467)) ([a38c757](https://github.com/grafana/k6-studio/commit/a38c757a59272207f2b9814fc3ec299844e76a3f))
* Security issues reported by NPM audit ([#436](https://github.com/grafana/k6-studio/issues/436)) ([5b1fc2c](https://github.com/grafana/k6-studio/commit/5b1fc2ca02e3467ab50ff23a764d6b3c52bcada7))
* splashscreen not showing ([#462](https://github.com/grafana/k6-studio/issues/462)) ([aeae586](https://github.com/grafana/k6-studio/commit/aeae586a535355096b5a466958d09b97a68a09da))


### Internal Changes

* **Data files:** Generate code for opening data files ([#445](https://github.com/grafana/k6-studio/issues/445)) ([992e516](https://github.com/grafana/k6-studio/commit/992e5166697c34233215bf0e07405495cd86e1de))
* **Data files:** Select data files in Test options ([#441](https://github.com/grafana/k6-studio/issues/441)) ([c01750a](https://github.com/grafana/k6-studio/commit/c01750abb47b2bd84bdbacf25fde6e8af12a649d))
* **Data files:** UI for importing data files ([#427](https://github.com/grafana/k6-studio/issues/427)) ([526dd3b](https://github.com/grafana/k6-studio/commit/526dd3bf83631025d08453f10dfa1b8463295350))
* Parse generator files in main ([#465](https://github.com/grafana/k6-studio/issues/465)) ([cec1a30](https://github.com/grafana/k6-studio/commit/cec1a302f35b20e4e18efc544763e468d98cbd5c))
* **Thresholds:** Generate code for thresholds ([#451](https://github.com/grafana/k6-studio/issues/451)) ([51d21eb](https://github.com/grafana/k6-studio/commit/51d21ebba38b044d8893e7f4ac09c4f21d05043b))
* **Thresholds:** polish UI ([#464](https://github.com/grafana/k6-studio/issues/464)) ([f20710c](https://github.com/grafana/k6-studio/commit/f20710c9c38587841b98ac7909bb6f64343708b6))
* **Thresholds:** Validate and save to Generator file ([#446](https://github.com/grafana/k6-studio/issues/446)) ([fef51d8](https://github.com/grafana/k6-studio/commit/fef51d8e48ddbfd39db5d03d540d68ec72ee6bcd))


### Miscellaneous Chores

* Group URLs in Select component ([#443](https://github.com/grafana/k6-studio/issues/443)) ([14f94da](https://github.com/grafana/k6-studio/commit/14f94da52ba84f0847df66a30005c1244032f680))
* Remove ArrayValueSchema ([#469](https://github.com/grafana/k6-studio/issues/469)) ([1e1aa07](https://github.com/grafana/k6-studio/commit/1e1aa072d5a143137a1d3c7d12296b97c3f03c6c))
* scaffold Thresholds UI behind feature flag ([#438](https://github.com/grafana/k6-studio/issues/438)) ([c54f7c7](https://github.com/grafana/k6-studio/commit/c54f7c7bdbb056f35de81a51ad81aa028da2e237))


### Continuous Integration

* **release:** Increase heap size for publish script ([#433](https://github.com/grafana/k6-studio/issues/433)) ([dbebeed](https://github.com/grafana/k6-studio/commit/dbebeedabb71ae55181362d076bd3345b609ee2f))

## [0.12.0](https://github.com/grafana/k6-studio/compare/v0.11.0...v0.12.0) (2025-01-23)


### Features

* Add text selector ([#426](https://github.com/grafana/k6-studio/issues/426)) ([f1e6826](https://github.com/grafana/k6-studio/commit/f1e68260feb364f3c057ed2c528815114a981e4b))
* move recording selector position ([#413](https://github.com/grafana/k6-studio/issues/413)) ([c73eb40](https://github.com/grafana/k6-studio/commit/c73eb40ff012c99fe190cd7c916de7bb89e2d134))
* Search all request data ([#406](https://github.com/grafana/k6-studio/issues/406)) ([d685ef2](https://github.com/grafana/k6-studio/commit/d685ef22143241f30b9ee49cf3697dce5e1dba54))


### Bug Fixes

* Content preview layout is broken ([#430](https://github.com/grafana/k6-studio/issues/430)) ([a3d2d88](https://github.com/grafana/k6-studio/commit/a3d2d883f989df44e2d11ac16bade9dea115ed43))
* intel mac app ([#420](https://github.com/grafana/k6-studio/issues/420)) ([7969f1f](https://github.com/grafana/k6-studio/commit/7969f1ff22270d50e29a416b0eff4f0b16fc241c))
* sourcemaps not uploading to Sentry ([#424](https://github.com/grafana/k6-studio/issues/424)) ([67d4d1a](https://github.com/grafana/k6-studio/commit/67d4d1aefdeaad5635cf133fdf74ec9e0e8c7cae))
* Type column in Request List takes too much space when window is small ([#421](https://github.com/grafana/k6-studio/issues/421)) ([6fe039a](https://github.com/grafana/k6-studio/commit/6fe039a6e8e2d2f4c186d2c7c89dbc8f45ea36af))


### Styles

* Unify cookie and header previews ([#431](https://github.com/grafana/k6-studio/issues/431)) ([b38dd45](https://github.com/grafana/k6-studio/commit/b38dd456cda8b8961e2f88b377493d26e05dc5ef))


### Miscellaneous Chores

* Add basic feature flags support ([#422](https://github.com/grafana/k6-studio/issues/422)) ([1cf5139](https://github.com/grafana/k6-studio/commit/1cf5139f7aabcae0809198b0469006b2d8eba654))
* Remove yarn usage from pre-commit hook ([#417](https://github.com/grafana/k6-studio/issues/417)) ([08b0c6d](https://github.com/grafana/k6-studio/commit/08b0c6d9e80e2337166b5339ed96d86db5c329fc))
* threshold schema, slice and migration ([#425](https://github.com/grafana/k6-studio/issues/425)) ([411aa79](https://github.com/grafana/k6-studio/commit/411aa79fa74aa4420852d6fd3c4484031734ef8e))


### Code Refactoring

* Extract Json preview into separate component ([#429](https://github.com/grafana/k6-studio/issues/429)) ([81c00db](https://github.com/grafana/k6-studio/commit/81c00dbaaabe24726296f32db577b4622a5880bc))


### Continuous Integration

* Remove bootstrap-sha from release-please config ([#416](https://github.com/grafana/k6-studio/issues/416)) ([1b3255a](https://github.com/grafana/k6-studio/commit/1b3255a0fcfec2da5438ac718be0cf57e230f413))

## [0.11.0](https://github.com/grafana/k6-studio/compare/v0.10.0...v0.11.0) (2025-01-16)


### Features

* ability to disable a rule ([#375](https://github.com/grafana/k6-studio/issues/375)) ([564aab9](https://github.com/grafana/k6-studio/commit/564aab9236587272a0abfc0afdfc1f37c91c1163))
* add type column to WebLogView ([#372](https://github.com/grafana/k6-studio/issues/372)) ([b7a793a](https://github.com/grafana/k6-studio/commit/b7a793a025a627123d26a7fcd7eafabd0e87b65f))
* crash reporter settings ([#393](https://github.com/grafana/k6-studio/issues/393)) ([898bde8](https://github.com/grafana/k6-studio/commit/898bde88d184d452a020114324ddf2afd02bfede))
* enable Sentry in renderer process ([#397](https://github.com/grafana/k6-studio/issues/397)) ([2850e61](https://github.com/grafana/k6-studio/commit/2850e61560c630e6e3d21a0d809fedb55b849838))
* generator schema migration ([#373](https://github.com/grafana/k6-studio/issues/373)) ([1c2d87d](https://github.com/grafana/k6-studio/commit/1c2d87d0a57039f62627273ac78afc66457d877b))
* implement crash reporter ([#365](https://github.com/grafana/k6-studio/issues/365)) ([ff74970](https://github.com/grafana/k6-studio/commit/ff74970cf00262bea0ffa86f5b30b66f754c9f68))
* syntax highlight for log viewer ([#394](https://github.com/grafana/k6-studio/issues/394)) ([44cc415](https://github.com/grafana/k6-studio/commit/44cc4151d0f8d55f733f81fccfba3ec3e82d5d8d))


### Bug Fixes

* Caret icon doesn't change state in Validator dialog ([#391](https://github.com/grafana/k6-studio/issues/391)) ([01bff4a](https://github.com/grafana/k6-studio/commit/01bff4a8cfd7fd5ea67f4bcc9de17c89736365f8))
* File watcher isn't initialized on start-up ([#398](https://github.com/grafana/k6-studio/issues/398)) ([73bf382](https://github.com/grafana/k6-studio/commit/73bf382d3e1222fd909efb3fbec5c4222b70bb51))
* intel mac app ([#414](https://github.com/grafana/k6-studio/issues/414)) ([aac1c14](https://github.com/grafana/k6-studio/commit/aac1c149507c37ac0a43d096c665432a21bddb2c))
* Last item scripts list isn't always accessible ([#389](https://github.com/grafana/k6-studio/issues/389)) ([7d9112b](https://github.com/grafana/k6-studio/commit/7d9112bc8cbedca550d04a8295e434126a512294))
* save generator after migration ([#400](https://github.com/grafana/k6-studio/issues/400)) ([a1c6d02](https://github.com/grafana/k6-studio/commit/a1c6d02edc48c565152059434462fcea0b5fa9f1))
* **windows:** Chrome folder is shown when no starting URL is provided ([#388](https://github.com/grafana/k6-studio/issues/388)) ([7e6fd8a](https://github.com/grafana/k6-studio/commit/7e6fd8ad440428319532bc8cd9850f15c3d52d2e))


### Reverts

* intel changes ([#418](https://github.com/grafana/k6-studio/issues/418)) ([05526a1](https://github.com/grafana/k6-studio/commit/05526a1287212a2ff6e173cebeaf23b7fc4dd374))


### Miscellaneous Chores

* **deps:** bump nanoid from 3.3.7 to 3.3.8 ([#385](https://github.com/grafana/k6-studio/issues/385)) ([a936fbc](https://github.com/grafana/k6-studio/commit/a936fbc7c3b33a6f4891c9933c537bb0ebd99656))
* **main:** release 0.11.0 ([#411](https://github.com/grafana/k6-studio/issues/411)) ([954e3dc](https://github.com/grafana/k6-studio/commit/954e3dc88ec2d3e1ccc938f3411a93d946db8324))
* Stricter ESLint config ([#383](https://github.com/grafana/k6-studio/issues/383)) ([2287eb6](https://github.com/grafana/k6-studio/commit/2287eb6946b12bbc19b870b8bf3627ef53aee00c))
* Use tanstack query for settings ([#384](https://github.com/grafana/k6-studio/issues/384)) ([7ebb02a](https://github.com/grafana/k6-studio/commit/7ebb02a520a5bfd0e7c7f7305a7a29631ef79c51))


### Continuous Integration

* Add release-please action ([#395](https://github.com/grafana/k6-studio/issues/395)) ([5a98e1a](https://github.com/grafana/k6-studio/commit/5a98e1ac3355532fddf1e60832eb22d13852b867))
* Remove PAT reference from release-please config ([#404](https://github.com/grafana/k6-studio/issues/404)) ([8cd1d71](https://github.com/grafana/k6-studio/commit/8cd1d71bcd5e4c97771a8dd871d7e55b6ecc19c5))
* Use croco-bot as release PRs author ([#409](https://github.com/grafana/k6-studio/issues/409)) ([6b67a92](https://github.com/grafana/k6-studio/commit/6b67a92cb3ab4ee646ce469df5d564af48e54cd2))
