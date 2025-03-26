# Changelog

## [1.1.0](https://github.com/grafana/k6-studio/compare/v1.0.2...v1.1.0) (2025-03-26)


### Features

* Ability to control proxy status ([#581](https://github.com/grafana/k6-studio/issues/581)) ([1a10464](https://github.com/grafana/k6-studio/commit/1a10464f9214672975a29c218c0c46c7ad83a142))
* Add correlation extraction label ([#577](https://github.com/grafana/k6-studio/issues/577)) ([e6018fb](https://github.com/grafana/k6-studio/commit/e6018fb008a07a5082b797161e9713f0dc07e261))
* add logical operator labels ([#587](https://github.com/grafana/k6-studio/issues/587)) ([466e427](https://github.com/grafana/k6-studio/commit/466e4276e698cf26df1cd800d1799bc875428781))
* add support for Chromium on all platforms ([#535](https://github.com/grafana/k6-studio/issues/535)) ([951fb20](https://github.com/grafana/k6-studio/commit/951fb208c66f9247a1acc63713245f394d8d6d9d))
* Pre-fill OS and app version when reporting issues ([#592](https://github.com/grafana/k6-studio/issues/592)) ([748778f](https://github.com/grafana/k6-studio/commit/748778fca29ebad230407ba3bfd30adce890b507))
* Update splashscreen ([#573](https://github.com/grafana/k6-studio/issues/573)) ([197bdf4](https://github.com/grafana/k6-studio/commit/197bdf4e7a89fdd166040157b68053d587aae112))


### Bug Fixes

* Highlight URL search matches in request inspector ([#580](https://github.com/grafana/k6-studio/issues/580)) ([f1a9888](https://github.com/grafana/k6-studio/commit/f1a9888129da4bf96ba60db1633a4a0faa1d5f63))
* Use text value comparison as default option for body verification rules ([#591](https://github.com/grafana/k6-studio/issues/591)) ([b0d978a](https://github.com/grafana/k6-studio/commit/b0d978ae0ac197fe9e26755edea79675c5f120f4))


### Miscellaneous Chores

* Add ESLint import/order rule ([#585](https://github.com/grafana/k6-studio/issues/585)) ([d93b5df](https://github.com/grafana/k6-studio/commit/d93b5df199c01bb49a2e0ba5f65c209aaf4eea95))
* Update bug template ([#590](https://github.com/grafana/k6-studio/issues/590)) ([76f6bc6](https://github.com/grafana/k6-studio/commit/76f6bc669c57d5aade42929a5549ee481d4f44ef))
* update demo video ([#586](https://github.com/grafana/k6-studio/issues/586)) ([0afd232](https://github.com/grafana/k6-studio/commit/0afd2323ac87e875e2ab46376b8b26dd931d3fee))
* Use ExternalLink component for docs and GitHub links ([#584](https://github.com/grafana/k6-studio/issues/584)) ([6404942](https://github.com/grafana/k6-studio/commit/6404942cf7e7166f200bc1f59d69af79c9c298b6))

## [1.0.2](https://github.com/grafana/k6-studio/compare/v1.0.1...v1.0.2) (2025-03-19)


### Bug Fixes

* App not opening after closing on macOS ([#578](https://github.com/grafana/k6-studio/issues/578)) ([c4611b4](https://github.com/grafana/k6-studio/commit/c4611b485e4c522463f28c772480605a608b4001))
* It's not possible to select browser executable on macOS ([#576](https://github.com/grafana/k6-studio/issues/576)) ([6f17b97](https://github.com/grafana/k6-studio/commit/6f17b9712e00c63ce72744bb8ccdb85e1a13a20c))

## [1.0.1](https://github.com/grafana/k6-studio/compare/v1.0.0...v1.0.1) (2025-03-17)


### Bug Fixes

* Race condition when migrating to k6g ([#570](https://github.com/grafana/k6-studio/issues/570)) ([4837714](https://github.com/grafana/k6-studio/commit/48377148a41607c3d8ad197bd4826fe4f19c33d5))


### Documentation

* Update README for v1 ([#568](https://github.com/grafana/k6-studio/issues/568)) ([b6f2077](https://github.com/grafana/k6-studio/commit/b6f2077769532e19c1bcd33b33e47e485345d9fc))

## [1.0.0](https://github.com/grafana/k6-studio/compare/v0.14.0...v1.0.0) (2025-03-14)


### Features

* Add a way to import data files directly from Test Data popover ([#528](https://github.com/grafana/k6-studio/issues/528)) ([619bd60](https://github.com/grafana/k6-studio/commit/619bd604e9a7d8a6da4cbdf1108a16e3129a6398))
* Add data files support ([#510](https://github.com/grafana/k6-studio/issues/510)) ([c0f625b](https://github.com/grafana/k6-studio/commit/c0f625b41eb1a32da4a8e79466c06be5b0e3c0c1))
* Add support for Load Zones in Test Options ([#543](https://github.com/grafana/k6-studio/issues/543)) ([cb5a775](https://github.com/grafana/k6-studio/commit/cb5a7758f8b17d692f46b410835603eaec458aa6))
* Apply rules in request list in generators ([#499](https://github.com/grafana/k6-studio/issues/499)) ([d14fe68](https://github.com/grafana/k6-studio/commit/d14fe686a7c3bc5c8a4377969c1b876079eee2b4))
* Cloud authentication via Grafana Cloud ([#500](https://github.com/grafana/k6-studio/issues/500)) ([5f0bb58](https://github.com/grafana/k6-studio/commit/5f0bb58e8977624bad867714792dece85a803674))
* Configurable verification rule ([#554](https://github.com/grafana/k6-studio/issues/554)) ([42acd00](https://github.com/grafana/k6-studio/commit/42acd0036cb1aa796c77fe766c5652422b797459))
* Highlight requests affected by rules ([#512](https://github.com/grafana/k6-studio/issues/512)) ([af658a7](https://github.com/grafana/k6-studio/commit/af658a7e9c7e07141ac85cab2ca835f2acbc51c9))
* Implement keyboard shortcuts for saving generator ([#550](https://github.com/grafana/k6-studio/issues/550)) ([c514cd7](https://github.com/grafana/k6-studio/commit/c514cd706254482bd047e368474201e29f2e6ae4))
* Improve spinner visibility in Validator dialog ([#560](https://github.com/grafana/k6-studio/issues/560)) ([b697315](https://github.com/grafana/k6-studio/commit/b697315d546a69fb6bb7feffef7f2f82a6806646))
* linux support ([#513](https://github.com/grafana/k6-studio/issues/513)) ([9ebc136](https://github.com/grafana/k6-studio/commit/9ebc136bd1e01562d0b5b3565f4e1043630b2386))
* Make it possible to open Settings with specific tab selected ([#551](https://github.com/grafana/k6-studio/issues/551)) ([9260004](https://github.com/grafana/k6-studio/commit/9260004dc3a20eb9647cce4082114f513275f5cb))
* migrate generator extension json -&gt; k6g ([#537](https://github.com/grafana/k6-studio/issues/537)) ([bef9714](https://github.com/grafana/k6-studio/commit/bef97149bd3c20fbb25090e4477974733bd916b3))
* multiple correlation extraction support ([#505](https://github.com/grafana/k6-studio/issues/505)) ([8e2378e](https://github.com/grafana/k6-studio/commit/8e2378e4c6c66d54c48c91209c7591a84f1e4fae))
* Rule editor form improvements ([#529](https://github.com/grafana/k6-studio/issues/529)) ([fdfce94](https://github.com/grafana/k6-studio/commit/fdfce94bb1de6f1ee7b56a4e04b73480b602513d))
* Run generated scripts in Grafana Cloud k6 ([#539](https://github.com/grafana/k6-studio/issues/539)) ([9012900](https://github.com/grafana/k6-studio/commit/9012900e6dff9b3b8ddf946b55b7ded4daa8f0ef))
* Update generator layout and improve empty state screens ([#428](https://github.com/grafana/k6-studio/issues/428)) ([4db4b32](https://github.com/grafana/k6-studio/commit/4db4b323200a3acdc691ebbca60ee438cd6b82d4))
* Use labels to highlight matched requests ([#559](https://github.com/grafana/k6-studio/issues/559)) ([1567d2a](https://github.com/grafana/k6-studio/commit/1567d2a769db4e36ed695826e5e38525a2d9339c))


### Bug Fixes

* App logo is not clickable ([#527](https://github.com/grafana/k6-studio/issues/527)) ([a9d9973](https://github.com/grafana/k6-studio/commit/a9d997322985033e971256bd6e4db0fd0f75f36c))
* Code editor scrollbars aren't consistent with app UI ([#509](https://github.com/grafana/k6-studio/issues/509)) ([e765f09](https://github.com/grafana/k6-studio/commit/e765f09bf1ab7e045e4cafa83faf272bf05589e6))
* Columns in Rule Editor don't have clear separation ([#546](https://github.com/grafana/k6-studio/issues/546)) ([6996c30](https://github.com/grafana/k6-studio/commit/6996c30cfde4865b7463d65822d92e69596413cc))
* executable name ([#538](https://github.com/grafana/k6-studio/issues/538)) ([d808ce8](https://github.com/grafana/k6-studio/commit/d808ce88fd3bd2ee776585d861ccb6f358adbc1a))
* Filter field hint and placeholder incorrectly refer to URL as path ([#516](https://github.com/grafana/k6-studio/issues/516)) ([ac23dd4](https://github.com/grafana/k6-studio/commit/ac23dd45df3977f73f2d29917801b44f815c7e15))
* It's possible to start a recording with no supported browser installed ([#523](https://github.com/grafana/k6-studio/issues/523)) ([1dd0947](https://github.com/grafana/k6-studio/commit/1dd09476f168660e4c728d48ee7bf968b7be8c64))
* parameterization custom code is not defined ([#503](https://github.com/grafana/k6-studio/issues/503)) ([1f1cdfc](https://github.com/grafana/k6-studio/commit/1f1cdfcf04373b1e38fa301b0fbc1f009d77ca4f))
* Proxy status is offline during initial start ([#524](https://github.com/grafana/k6-studio/issues/524)) ([eef65a2](https://github.com/grafana/k6-studio/commit/eef65a2815a34631485e990024072147caed9012))
* Query params list style is inconsistent with other tabs ([#517](https://github.com/grafana/k6-studio/issues/517)) ([e58252d](https://github.com/grafana/k6-studio/commit/e58252d2440fa4cace2a73e12d5d81ac4ffa2481))
* Renaming generator with unsaved changes creates extra file ([#534](https://github.com/grafana/k6-studio/issues/534)) ([bd74513](https://github.com/grafana/k6-studio/commit/bd74513e0b1bf8ef05b82831324b55e9113dfeb8))
* Render error when extracting JSON and Arrays in correlation rule ([#548](https://github.com/grafana/k6-studio/issues/548)) ([d924cfc](https://github.com/grafana/k6-studio/commit/d924cfcfc77e7d19e36d39244711e4a51bd642bb))
* Selected rule is not reset when opening another generator ([#508](https://github.com/grafana/k6-studio/issues/508)) ([80b951a](https://github.com/grafana/k6-studio/commit/80b951a3c13ddd4d063e26dd11ffe994536ea70c))
* **Validator:** Scripts with no k6/execution import cannot be run ([#561](https://github.com/grafana/k6-studio/issues/561)) ([fbe6138](https://github.com/grafana/k6-studio/commit/fbe61382c2bde9ffe7a42d499aa5bf022aaa0186))


### Internal Changes

* **Data files:** Add data files support in Parameterization rules ([#497](https://github.com/grafana/k6-studio/issues/497)) ([5435959](https://github.com/grafana/k6-studio/commit/5435959ced950ef1a7ac2104027ca134d0ca1e3b))
* Fixed requests to access secrets. ([#536](https://github.com/grafana/k6-studio/issues/536)) ([7870009](https://github.com/grafana/k6-studio/commit/78700097b945f0d9714d0c17d4a85d4634cbf079))
* **fix:** UX is poor when signing in to paused instances ([#549](https://github.com/grafana/k6-studio/issues/549)) ([874a508](https://github.com/grafana/k6-studio/commit/874a5084aa2fa8372df9d13a04404e161c026147))
* **Load Zones:** Ability to add load zones ([#518](https://github.com/grafana/k6-studio/issues/518)) ([7301d18](https://github.com/grafana/k6-studio/commit/7301d1891cf3bd7594b6575c04f78df08574775c))
* **Load Zones:** Generate code for load zones ([#526](https://github.com/grafana/k6-studio/issues/526)) ([1d55758](https://github.com/grafana/k6-studio/commit/1d55758f005a4a0ecefd464d266736de3ac049a8))
* **Load Zones:** Scaffold UI, schema and state ([#511](https://github.com/grafana/k6-studio/issues/511)) ([6b04583](https://github.com/grafana/k6-studio/commit/6b04583d1e706456c4d29cba6fba1a92a823063b))
* **Load Zones:** UI improvements for Load Zones feature ([#531](https://github.com/grafana/k6-studio/issues/531)) ([ba0be43](https://github.com/grafana/k6-studio/commit/ba0be43236c3554780a381900658a6709a7420ac))


### Styles

* Remove dots from short tooltips ([#552](https://github.com/grafana/k6-studio/issues/552)) ([2687e03](https://github.com/grafana/k6-studio/commit/2687e03ceddf71e06067ebba199ca1b6c74d8f72))


### Miscellaneous Chores

* Add Grafana prefix ([#494](https://github.com/grafana/k6-studio/issues/494)) ([bb0d54a](https://github.com/grafana/k6-studio/commit/bb0d54a5edaa57220c6aa777b7f6eed0b392e08e))
* **deps-dev:** bump vitest from 1.6.0 to 1.6.1 ([#519](https://github.com/grafana/k6-studio/issues/519)) ([51a0cb6](https://github.com/grafana/k6-studio/commit/51a0cb6388b35af12e36cab118b8c7c2172fd5d8))
* Update bug issue template ([#558](https://github.com/grafana/k6-studio/issues/558)) ([6f861fe](https://github.com/grafana/k6-studio/commit/6f861fec8347904dadb092ad9a3cdb26a7aee87f))
* update proxy version ([#553](https://github.com/grafana/k6-studio/issues/553)) ([2bfb489](https://github.com/grafana/k6-studio/commit/2bfb489d628414779791e419bc8be2cc0c561f0a))
* v1 release preparations ([#555](https://github.com/grafana/k6-studio/issues/555)) ([b9f2d7b](https://github.com/grafana/k6-studio/commit/b9f2d7bcf29bf3fc1c232f52c5a8edca9207aaf2))


### Build System

* Configure oauth client and urls for production ([#556](https://github.com/grafana/k6-studio/issues/556)) ([edf8c1f](https://github.com/grafana/k6-studio/commit/edf8c1f5beefd79d75146411b43ba77cabaa2df0))

## [0.14.0](https://github.com/grafana/k6-studio/compare/v0.13.0...v0.14.0) (2025-02-17)


### Features

* Add Thresholds support in Test options ([#468](https://github.com/grafana/k6-studio/issues/468)) ([2960535](https://github.com/grafana/k6-studio/commit/2960535c3a52ec4fe462071f91eee5aa86a46880))


### Bug Fixes

* Old name is shown when trying to rename file again ([#487](https://github.com/grafana/k6-studio/issues/487)) ([cf9e462](https://github.com/grafana/k6-studio/commit/cf9e462c5dab2aafb084cd9f29d8bf2965d5f4b9))
* Validator requires admin role on Windows ([#492](https://github.com/grafana/k6-studio/issues/492)) ([7f1cb65](https://github.com/grafana/k6-studio/commit/7f1cb6534d4173191d4010e5cb6ac207279c103d))

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
