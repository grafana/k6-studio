# Changelog

## [1.9.0](https://github.com/grafana/k6-studio/compare/v1.8.0...v1.9.0) (2025-11-25)


### Features

* Add Regex support to Verification rule ([#853](https://github.com/grafana/k6-studio/issues/853)) ([4e2fdd4](https://github.com/grafana/k6-studio/commit/4e2fdd4b7af66dbe15046b17080c424054ac8a23))
* Add waitForNavigation on link clicks and form submissions ([#879](https://github.com/grafana/k6-studio/issues/879)) ([871b16a](https://github.com/grafana/k6-studio/commit/871b16ac35bc305bd5edba5a9a7af5b0f7676ea8))
* **browser:** Expand selection to parent elements when adding text assertions ([3d8fc89](https://github.com/grafana/k6-studio/commit/3d8fc898e8cac117b2c93f8832fda957ab84280c))
* **browser:** Generate `getByAltText`, `getByLabel`, `getByPlaceholder` and `getByTitle` selectors ([#886](https://github.com/grafana/k6-studio/issues/886)) ([2a14290](https://github.com/grafana/k6-studio/commit/2a1429000afaccb622097f2ea09d65c2bdb835b5))
* **browser:** Generate getByRole selectors ([#877](https://github.com/grafana/k6-studio/issues/877)) ([9404fda](https://github.com/grafana/k6-studio/commit/9404fda33ac3f16c7ca426e957de3beb55abe688))
* **browser:** Record browser interactions over Chrome DevTools Protocol (experimental) ([#871](https://github.com/grafana/k6-studio/issues/871)) ([af4dc07](https://github.com/grafana/k6-studio/commit/af4dc0751d30184969d33173f50f274eff0fa836))


### Bug Fixes

* **browser:** Browser event drawer opens and closes when picking an element ([#874](https://github.com/grafana/k6-studio/issues/874)) ([a7a5a92](https://github.com/grafana/k6-studio/commit/a7a5a92b0af20080cbd180f5000aaa07508dc821))
* **browser:** Clicks are not recorded on inputs with type button, submit or reset ([a3d6607](https://github.com/grafana/k6-studio/commit/a3d66077973404151495071ec85174f32582db85))
* discrepancy with chrome handling of whitespace in header ([#892](https://github.com/grafana/k6-studio/issues/892)) ([90466bb](https://github.com/grafana/k6-studio/commit/90466bb1a7e4278855facfd88498a7e0c8205d24))


### Reverts

* "chore(main): release 1.9.0" ([#898](https://github.com/grafana/k6-studio/issues/898)) ([5571a04](https://github.com/grafana/k6-studio/commit/5571a040373406fa963a2ec8a6f72cb4a593aa2b))
* "chore(main): release 1.9.0" ([#905](https://github.com/grafana/k6-studio/issues/905)) ([4e3b089](https://github.com/grafana/k6-studio/commit/4e3b089aaa909ee88c2723dd6dd3b50fc65283ea))
* Revert k6 to 1.2.1 due to bug in k6 1.4.0 ([#899](https://github.com/grafana/k6-studio/issues/899)) ([ad75257](https://github.com/grafana/k6-studio/commit/ad75257021130d5e808eff835c4237b38ef73ab9))


### Internal Changes

* Add ability to manage AI API key ([#860](https://github.com/grafana/k6-studio/issues/860)) ([a547a81](https://github.com/grafana/k6-studio/commit/a547a81a6b26f909148063163a499ede1128cf6b))
* Add auto correlation feature ([#870](https://github.com/grafana/k6-studio/issues/870)) ([9ff4b21](https://github.com/grafana/k6-studio/commit/9ff4b216ebfb0719aaaaad9796e76db679b12c3e))


### Miscellaneous Chores

* Azure trusted signing for windows binaries ([#869](https://github.com/grafana/k6-studio/issues/869)) ([56893f4](https://github.com/grafana/k6-studio/commit/56893f4e44c20346b2ae8499612f3d97d3f22f20))
* Browser events schema v2 ([#861](https://github.com/grafana/k6-studio/issues/861)) ([b6496a1](https://github.com/grafana/k6-studio/commit/b6496a1d0b5c63c7a1a45276957da4bac4deeb45))
* Bump esbuild to address CVE ([#878](https://github.com/grafana/k6-studio/issues/878)) ([7e97780](https://github.com/grafana/k6-studio/commit/7e977807c6b242bf77db08c0d7859255538ceaff))
* **deps-dev:** bump js-yaml from 4.1.0 to 4.1.1 ([#893](https://github.com/grafana/k6-studio/issues/893)) ([93c0011](https://github.com/grafana/k6-studio/commit/93c0011becea49fb6ab6afc7301938b2bb5cbaaa))
* **deps-dev:** bump vite from 5.4.20 to 5.4.21 ([#867](https://github.com/grafana/k6-studio/issues/867)) ([b0a3ac7](https://github.com/grafana/k6-studio/commit/b0a3ac7339e3dccaa7a7e47530b59ecf79906c3c))
* **deps:** bump ai and @ai-sdk/react ([#895](https://github.com/grafana/k6-studio/issues/895)) ([5333ea6](https://github.com/grafana/k6-studio/commit/5333ea629936adcadd75a00ab7d705f5cfda43ef))
* **main:** release 1.9.0 ([#857](https://github.com/grafana/k6-studio/issues/857)) ([60f564b](https://github.com/grafana/k6-studio/commit/60f564b5659a771e00b6a89d0e3c377c01d63331))
* **main:** release 1.9.0 ([#897](https://github.com/grafana/k6-studio/issues/897)) ([757f82a](https://github.com/grafana/k6-studio/commit/757f82a360307fda8f749b334df145ce4d69389c))
* update k6 version to v1.4.0 ([#896](https://github.com/grafana/k6-studio/issues/896)) ([221739e](https://github.com/grafana/k6-studio/commit/221739ece2c8d924ded9ce023d6cc7d0e9797c2b))
* Update PR template ([#859](https://github.com/grafana/k6-studio/issues/859)) ([4adcd05](https://github.com/grafana/k6-studio/commit/4adcd05b762d84fd25b8137c0261dbc4c3638040))


### Code Refactoring

* Break debugging logic out into a hook in validator ([#894](https://github.com/grafana/k6-studio/issues/894)) ([1b2303c](https://github.com/grafana/k6-studio/commit/1b2303c7b139ec9ae6c12c24ebc7fc4d75a824f8))
* Simplify code when opening scripts ([#883](https://github.com/grafana/k6-studio/issues/883)) ([c2008c3](https://github.com/grafana/k6-studio/commit/c2008c3cbd98c450067f1912585ecc03aa19c793))
* Use consistent naming for enum members ([#866](https://github.com/grafana/k6-studio/issues/866)) ([8aabe85](https://github.com/grafana/k6-studio/commit/8aabe85b701d60fe618243b241f594bcc2db670f))

## [1.8.0](https://github.com/grafana/k6-studio/compare/v1.7.0...v1.8.0) (2025-10-06)


### Features

* **Browser:** Add getByTestId support ([#849](https://github.com/grafana/k6-studio/issues/849)) ([e735867](https://github.com/grafana/k6-studio/commit/e73586717054e61c789f9487762fb9a6412b7c9b))
* Capture network traffic when running browser scripts ([#807](https://github.com/grafana/k6-studio/issues/807)) ([429f8ae](https://github.com/grafana/k6-studio/commit/429f8aeb73341196d4f528b7d57d8b352c52a8d7))
* Improved formatting in Logs panel ([#823](https://github.com/grafana/k6-studio/issues/823)) ([44183db](https://github.com/grafana/k6-studio/commit/44183db33eb6194d85a66c2df2b26edd4815937e))
* **Recorder:** Add create test menu to make exporting browser tests easier ([#845](https://github.com/grafana/k6-studio/issues/845)) ([6b8bdb6](https://github.com/grafana/k6-studio/commit/6b8bdb6510e5a879ebfccc6a07fbb15704229e5e))


### Bug Fixes

* Add rule button is displayed in two places ([#817](https://github.com/grafana/k6-studio/issues/817)) ([0ca4b6f](https://github.com/grafana/k6-studio/commit/0ca4b6f374fd693ff24d0455c68c434c8e41be60))
* App crashing when pasting into custom code editor ([#806](https://github.com/grafana/k6-studio/issues/806)) ([37ca961](https://github.com/grafana/k6-studio/commit/37ca9615af11efdc71288a0f5b6bb73bc69d4505))
* Browser events tab is enabled when no browser events are present ([#827](https://github.com/grafana/k6-studio/issues/827)) ([e530cf7](https://github.com/grafana/k6-studio/commit/e530cf7edc2c42f40cb727fc318c5f2631ef5817))
* Duplicate call to click when recording a submit button click ([#824](https://github.com/grafana/k6-studio/issues/824)) ([d384d07](https://github.com/grafana/k6-studio/commit/d384d07d45d682390d17c8530760873e4a13e43c))
* UI becomes inert after interacting with dialogs opened from dropdown menu ([#826](https://github.com/grafana/k6-studio/issues/826)) ([af87e6c](https://github.com/grafana/k6-studio/commit/af87e6c6a68ee30701613a25a128efb53ab8c0f6))


### Reverts

* "chore(main): release 1.8.0 ([#804](https://github.com/grafana/k6-studio/issues/804))" ([#855](https://github.com/grafana/k6-studio/issues/855)) ([f6891ea](https://github.com/grafana/k6-studio/commit/f6891ea92954ae09c9865cd187cfb28c021d60b8))


### Internal Changes

* **prerelease:** Include shims folder in extra resources when building app ([#856](https://github.com/grafana/k6-studio/issues/856)) ([1e732f8](https://github.com/grafana/k6-studio/commit/1e732f8854ec1fb8d10f60a6616215e4704c186c))
* Setup server for tracking browser actions when validating scripts ([#811](https://github.com/grafana/k6-studio/issues/811)) ([ca3cc4a](https://github.com/grafana/k6-studio/commit/ca3cc4a91d0f7b0c3e48074d14e6511ca2f1b49d))


### Dependency Updates

* Bump [@dnd-kit](https://github.com/dnd-kit) packages ([#844](https://github.com/grafana/k6-studio/issues/844)) ([19cc55d](https://github.com/grafana/k6-studio/commit/19cc55d81a2113ef5bb7e1f5a367304517558945))
* Bump `react-select` and `@microlink/react-json-view` ([#846](https://github.com/grafana/k6-studio/issues/846)) ([02e29fb](https://github.com/grafana/k6-studio/commit/02e29fb3b980d3d5389a8516e5a2b7220b5b4b50))


### Styles

* Display spinner when opening large recordings ([#829](https://github.com/grafana/k6-studio/issues/829)) ([46865c8](https://github.com/grafana/k6-studio/commit/46865c80838f83abcad40a446dd4905445e168b8))


### Miscellaneous Chores

* **deps-dev:** bump electron from 37.2.4 to 37.3.1 ([#810](https://github.com/grafana/k6-studio/issues/810)) ([1f7cbda](https://github.com/grafana/k6-studio/commit/1f7cbda8384feb610994b579369fc3f92004979c))
* **deps-dev:** bump vite from 5.4.19 to 5.4.20 ([#819](https://github.com/grafana/k6-studio/issues/819)) ([dac7e87](https://github.com/grafana/k6-studio/commit/dac7e87e8e5d5ea6722d5d685f9321cf61032e59))
* **deps:** bump tar-fs from 3.0.9 to 3.1.1 ([#850](https://github.com/grafana/k6-studio/issues/850)) ([686fa65](https://github.com/grafana/k6-studio/commit/686fa6545224266ca79d016adef6f483967aae69))
* **main:** release 1.8.0 ([#804](https://github.com/grafana/k6-studio/issues/804)) ([c27f019](https://github.com/grafana/k6-studio/commit/c27f0192aad2a61f7c911444fc29690c10b00b42))
* Remove redundant generator extension renaming code ([#831](https://github.com/grafana/k6-studio/issues/831)) ([00567d5](https://github.com/grafana/k6-studio/commit/00567d525ccb12416b20a2ba2404496560613855))
* Track external script usage ([#821](https://github.com/grafana/k6-studio/issues/821)) ([c5d2d63](https://github.com/grafana/k6-studio/commit/c5d2d6390152fb88cd93ec5c37dd28edcb6883af))
* Track where script is copied from ([#820](https://github.com/grafana/k6-studio/issues/820)) ([23836a0](https://github.com/grafana/k6-studio/commit/23836a058eab9036a181bb099050f6680b7427f1))


### Code Refactoring

* Separate validator components for script and generator views ([#808](https://github.com/grafana/k6-studio/issues/808)) ([7d2c020](https://github.com/grafana/k6-studio/commit/7d2c0202381b099aca9c72c107190dd1e5d4d3ba))
* Use K6Client as interface for running scripts ([#809](https://github.com/grafana/k6-studio/issues/809)) ([b4fba08](https://github.com/grafana/k6-studio/commit/b4fba0863bca422641f929d3457ae51ecefdcfb6))


### Continuous Integration

* Add type checking to CI checks ([#828](https://github.com/grafana/k6-studio/issues/828)) ([af4e90d](https://github.com/grafana/k6-studio/commit/af4e90dcacec635e261440deb8c4ad9b13d3d893))

## [1.7.0](https://github.com/grafana/k6-studio/compare/v1.6.0...v1.7.0) (2025-08-28)


### Features

* Add assertions of values in text inputs ([#770](https://github.com/grafana/k6-studio/issues/770)) ([a570e5d](https://github.com/grafana/k6-studio/commit/a570e5dda242be9e8c797ae2327e6b14a9920199))
* Add assertions on checkbox/radio button state ([#738](https://github.com/grafana/k6-studio/issues/738)) ([89c0dcb](https://github.com/grafana/k6-studio/commit/89c0dcb88bdb8475767e5b3692cea48c036468b9))
* Improved error handling when starting a recording ([#795](https://github.com/grafana/k6-studio/issues/795)) ([6483add](https://github.com/grafana/k6-studio/commit/6483add8ced2a72b6cc17a54b784faddad62702a))
* Improved in-browser toolbar design ([#781](https://github.com/grafana/k6-studio/issues/781)) ([b685029](https://github.com/grafana/k6-studio/commit/b685029bbff9c039d0ccc5f35af007cc2d1caa3a))
* Improved selector stability for click events ([#791](https://github.com/grafana/k6-studio/issues/791)) ([135d35c](https://github.com/grafana/k6-studio/commit/135d35c28e0198fbd600a34072b6bf09671e921b))


### Bug Fixes

* Clicking the label of a checkbox/radio records two events ([#798](https://github.com/grafana/k6-studio/issues/798)) ([994815a](https://github.com/grafana/k6-studio/commit/994815ae22e576919990a06dabd1463a57e53ff5))
* Initial navigation event is sometimes not captured when starting a recording ([#769](https://github.com/grafana/k6-studio/issues/769)) ([1d26926](https://github.com/grafana/k6-studio/commit/1d2692648fb4c2bdc685f85f2c8ad2598bdafa4a))
* Modals close when trying to interact with the toolbar ([#782](https://github.com/grafana/k6-studio/issues/782)) ([de03354](https://github.com/grafana/k6-studio/commit/de03354d8c63590c3f984c322e2eb26417b6ef74))
* Navigation events are captures while typing in address bar ([#799](https://github.com/grafana/k6-studio/issues/799)) ([9245d7f](https://github.com/grafana/k6-studio/commit/9245d7fa48a890639716a201e40702654d0148dd))
* Use `.fill()` instead of `.type()` when a text input has changed ([#788](https://github.com/grafana/k6-studio/issues/788)) ([86c06d0](https://github.com/grafana/k6-studio/commit/86c06d01fdb729fbdf1b5723c6382ac4e9346dfb))


### Reverts

* "chore(main): release 1.7.0 ([#776](https://github.com/grafana/k6-studio/issues/776))" ([#803](https://github.com/grafana/k6-studio/issues/803)) ([03d46b0](https://github.com/grafana/k6-studio/commit/03d46b0454f2d2e9fe8b3e8ead59ed148bba62f4))


### Internal Changes

* [POC] Render JSON suggestions ([#678](https://github.com/grafana/k6-studio/issues/678)) ([458f0fc](https://github.com/grafana/k6-studio/commit/458f0fc076a7198fad7c63dc7c9b70535018e1fd))
* **fix:** Infinite loop when recording clicks ([#797](https://github.com/grafana/k6-studio/issues/797)) ([50469cc](https://github.com/grafana/k6-studio/commit/50469cc38f99b47479b1fc7cb102602cd6cae404))
* Unwrap AggregateErrors before logging ([#794](https://github.com/grafana/k6-studio/issues/794)) ([b7b106e](https://github.com/grafana/k6-studio/commit/b7b106e0b688b649c665877826fb656f4cd48f6f))


### Dependency Updates

* Bump Electron version and [@electron-forge](https://github.com/electron-forge) packages ([#775](https://github.com/grafana/k6-studio/issues/775)) ([cad5ef5](https://github.com/grafana/k6-studio/commit/cad5ef5900d6042e3874e877065f8f8bae79332b))


### Miscellaneous Chores

* Additional usage collection ([#796](https://github.com/grafana/k6-studio/issues/796)) ([85b82c8](https://github.com/grafana/k6-studio/commit/85b82c8520643a5a0629ac913a50e53b654536ed))
* **deps:** bump brace-expansion ([#800](https://github.com/grafana/k6-studio/issues/800)) ([b22a79e](https://github.com/grafana/k6-studio/commit/b22a79e0a4e1c3476cdc7d4651e02d0d651e9f56))
* **main:** release 1.7.0 ([#776](https://github.com/grafana/k6-studio/issues/776)) ([ed0aa89](https://github.com/grafana/k6-studio/commit/ed0aa897b83d72a55cc6c456064b975416cbd3a0))
* Pin get-vault-secrets action to a hash ([#777](https://github.com/grafana/k6-studio/issues/777)) ([a862ad3](https://github.com/grafana/k6-studio/commit/a862ad3cf93484c2a9bd8b852d5a38c2451c11d9))
* update k6 version to v1.2.1 ([#783](https://github.com/grafana/k6-studio/issues/783)) ([d593ad2](https://github.com/grafana/k6-studio/commit/d593ad28ab4ec9c1b269410dd1e4044234fae4f6))


### Build System

* Rollback to electron-forge 7.4.0 due to build issues ([#802](https://github.com/grafana/k6-studio/issues/802)) ([0289d9a](https://github.com/grafana/k6-studio/commit/0289d9ae9320d4ba37233bf5d07a7216e75eef69))

## [1.6.0](https://github.com/grafana/k6-studio/compare/v1.5.0...v1.6.0) (2025-07-28)


### Features

* Add custom protocol support ([#763](https://github.com/grafana/k6-studio/issues/763)) ([c2d6be4](https://github.com/grafana/k6-studio/commit/c2d6be44cbb1f941527e42b5563a8a4996d55a36))
* Add JSON path explanation ([#759](https://github.com/grafana/k6-studio/issues/759)) ([df46dbf](https://github.com/grafana/k6-studio/commit/df46dbf36b47c6435020675ec5c0c8eb7d4b247e))
* Allow in-browser toolbar to be re-positioned ([#765](https://github.com/grafana/k6-studio/issues/765)) ([3c397d7](https://github.com/grafana/k6-studio/commit/3c397d7f333a9377870a64c16044d99d1c913268))


### Bug Fixes

* windows build ([#762](https://github.com/grafana/k6-studio/issues/762)) ([87fba5b](https://github.com/grafana/k6-studio/commit/87fba5bacd74384424c5444b377b86a5c81ef518))


### Internal Changes

* Improved tools for developing the browser extension ([#766](https://github.com/grafana/k6-studio/issues/766)) ([7648d27](https://github.com/grafana/k6-studio/commit/7648d2722489c27529338d7f1aa3722d695c9e18))


### Dependency Updates

* Replace `papaparse` with `k6/experimental/csv` ([#758](https://github.com/grafana/k6-studio/issues/758)) ([fc48842](https://github.com/grafana/k6-studio/commit/fc488422eb7192d0cae5026f5003062fcbf4b5fb))


### Miscellaneous Chores

* Add more flexible usage tracking service ([#732](https://github.com/grafana/k6-studio/issues/732)) ([ff71b92](https://github.com/grafana/k6-studio/commit/ff71b92ed9491f2055395dc6c6d5baeae9d3497b))
* Anonymous usage tracking for Recorder, Generator, Validator ([#771](https://github.com/grafana/k6-studio/issues/771)) ([96906c0](https://github.com/grafana/k6-studio/commit/96906c0acbc1e421680daa2e1f7163239be99bc4))
* **deps:** bump form-data from 4.0.0 to 4.0.4 ([#772](https://github.com/grafana/k6-studio/issues/772)) ([317d44a](https://github.com/grafana/k6-studio/commit/317d44a068e80ea4afb7f5da35ccc331cbc5d228))

## [1.5.0](https://github.com/grafana/k6-studio/compare/v1.4.0...v1.5.0) (2025-06-24)


### Features

* Display recent URLs in Recorder ([#748](https://github.com/grafana/k6-studio/issues/748)) ([815762f](https://github.com/grafana/k6-studio/commit/815762f2bf7bbbe1cc60efc88d7e344335c7255a))


### Bug Fixes

* Add support for Chromium path from Flatpak ([#750](https://github.com/grafana/k6-studio/issues/750)) ([b35b9ea](https://github.com/grafana/k6-studio/commit/b35b9eae4c811447f575856fcebbaaf25ce78ced))
* Cloud sign-in fails when user is behind a network proxy ([#756](https://github.com/grafana/k6-studio/issues/756)) ([660399d](https://github.com/grafana/k6-studio/commit/660399dd77fc6fdff9c747b0ca7561e99c167a7d))
* Threshold metric for http_req_failed ([#734](https://github.com/grafana/k6-studio/issues/734)) ([bc84b7e](https://github.com/grafana/k6-studio/commit/bc84b7eed5f172f2f617901efc5771ea397dc5b8))


### Miscellaneous Chores

* update k6 version to v1.0.0 ([#760](https://github.com/grafana/k6-studio/issues/760)) ([c8ad5ed](https://github.com/grafana/k6-studio/commit/c8ad5edb384c6805ce4cf7fd62bf6f475672bc71))

## [1.4.0](https://github.com/grafana/k6-studio/compare/v1.3.0...v1.4.0) (2025-06-11)


### Features

* Display Rule preview in Rule editor ([#740](https://github.com/grafana/k6-studio/issues/740)) ([83ff7eb](https://github.com/grafana/k6-studio/commit/83ff7eb80ec86f8ddb1b7eab5cd7286e6399d4b0))
* Implement proxy health check ([#716](https://github.com/grafana/k6-studio/issues/716)) ([f05ed08](https://github.com/grafana/k6-studio/commit/f05ed08a3226dec94014d29c90531ce0bdd89f3f))


### Bug Fixes

* **browser:** Extension doesn't load when starting a recording in Chrome ([#742](https://github.com/grafana/k6-studio/issues/742)) ([1ab1eaa](https://github.com/grafana/k6-studio/commit/1ab1eaaf4b684bb0322283a6c10f9592adc43282))
* Running validator causes 'Maximum call stack size exceeded' error ([#746](https://github.com/grafana/k6-studio/issues/746)) ([cae2276](https://github.com/grafana/k6-studio/commit/cae22763342c2d9daa103c1757b9e2726486a92d))


### Miscellaneous Chores

* **deps:** bump tar-fs from 3.0.8 to 3.0.9 ([#739](https://github.com/grafana/k6-studio/issues/739)) ([150df5e](https://github.com/grafana/k6-studio/commit/150df5e93e8be0df4945dbe080b03027c9902887))
* migrate secrets to vault ([#737](https://github.com/grafana/k6-studio/issues/737)) ([22fe5f5](https://github.com/grafana/k6-studio/commit/22fe5f5ba517c68f41ac16b6f27276ba5b257e76))
* Set studio-specific User-Agent ([#733](https://github.com/grafana/k6-studio/issues/733)) ([8459ed4](https://github.com/grafana/k6-studio/commit/8459ed49ef0334b2a0bf3df149aa45fbc6b426a3))
* Switch to Lucide icons ([#711](https://github.com/grafana/k6-studio/issues/711)) ([d81f19d](https://github.com/grafana/k6-studio/commit/d81f19da2a29ac9fddadf4b472781f190d0266a0))


### Continuous Integration

* Fix release please workflow ([#745](https://github.com/grafana/k6-studio/issues/745)) ([7d6f167](https://github.com/grafana/k6-studio/commit/7d6f1676f2e4ccc408b6a8331af3122c1bab9adf))

## [1.3.0](https://github.com/grafana/k6-studio/compare/v1.2.0...v1.3.0) (2025-05-14)


### Features

* Add support to start proxy with --ssl-insecure flag ([#713](https://github.com/grafana/k6-studio/issues/713)) ([b818b0c](https://github.com/grafana/k6-studio/commit/b818b0c6ef38469b77b7e61ce1d6f7d8697d8c47))
* **browser:** Add assertions to check if elements are visible or not. ([#725](https://github.com/grafana/k6-studio/issues/725)) ([61a5ada](https://github.com/grafana/k6-studio/commit/61a5adaa4da64906ef3b6f554e77a18b96d28e3b))
* Highlight values replaced by rules ([#665](https://github.com/grafana/k6-studio/issues/665)) ([a3f1a2d](https://github.com/grafana/k6-studio/commit/a3f1a2de9d9d8c736546f6cab3ce6965156bcebb))
* Prompt to save recording when closing app ([#726](https://github.com/grafana/k6-studio/issues/726)) ([e1b1f1b](https://github.com/grafana/k6-studio/commit/e1b1f1b9887f4cc75f0fbc503345a02767ddcf7a))


### Bug Fixes

* Can't delete file after restoring window on macOS ([#722](https://github.com/grafana/k6-studio/issues/722)) ([7563bb1](https://github.com/grafana/k6-studio/commit/7563bb109f2fa8e88b444f840e75fa52a8f2bef9))


### Miscellaneous Chores

* Add issue template for Feature Requests and Project Spec ([#708](https://github.com/grafana/k6-studio/issues/708)) ([078b3d9](https://github.com/grafana/k6-studio/commit/078b3d93f1d7677439801cd672dbfae24fd3cad1))
* add software catalog yaml ([#715](https://github.com/grafana/k6-studio/issues/715)) ([8e26c17](https://github.com/grafana/k6-studio/commit/8e26c179211ed8f8d67bbf13df4bb37feeee902f))
* **deps-dev:** bump vite from 5.4.18 to 5.4.19 ([#723](https://github.com/grafana/k6-studio/issues/723)) ([1697d6a](https://github.com/grafana/k6-studio/commit/1697d6a317a7ffff6792ceced82959733070f048))
* Lock node version in package.json ([#701](https://github.com/grafana/k6-studio/issues/701)) ([06664e1](https://github.com/grafana/k6-studio/commit/06664e1bb3150901327ee1ac57f296b26ad7d445))
* Preload fonts ([#714](https://github.com/grafana/k6-studio/issues/714)) ([d9eccc7](https://github.com/grafana/k6-studio/commit/d9eccc791dab75d3e968f68713a6c6ea50059ccc))
* Remove default bug label ([#709](https://github.com/grafana/k6-studio/issues/709)) ([07c7fbc](https://github.com/grafana/k6-studio/commit/07c7fbc0c0cf06839a13fff9e4a100fc2607633b))
* update actions ([#710](https://github.com/grafana/k6-studio/issues/710)) ([834cf31](https://github.com/grafana/k6-studio/commit/834cf31466200b437f8156359f1bde30ee33506e))


### Code Refactoring

* Move "main" files to "main" directory ([#700](https://github.com/grafana/k6-studio/issues/700)) ([1957dcb](https://github.com/grafana/k6-studio/commit/1957dcbfd0c534ea814a5cded88bceb142833b69))

## [1.2.0](https://github.com/grafana/k6-studio/compare/v1.1.0...v1.2.0) (2025-04-25)


### Features

* Add stop recording button to in-browser controls ([#688](https://github.com/grafana/k6-studio/issues/688)) ([0a3dad5](https://github.com/grafana/k6-studio/commit/0a3dad500f7be7826da4085ab7ddfa647bd3a1d3))
* Add support for content preview in request payload ([#613](https://github.com/grafana/k6-studio/issues/613)) ([260579b](https://github.com/grafana/k6-studio/commit/260579ba586272f45d3293ce4c1e2cb41fa6d202))
* **browser:** Public preview of browser recording ([#622](https://github.com/grafana/k6-studio/issues/622)) ([81dfea2](https://github.com/grafana/k6-studio/commit/81dfea29973bddc46b5ff44f23445b04aa226541))
* Pre-select first host in rercording ([#616](https://github.com/grafana/k6-studio/issues/616)) ([f1f035a](https://github.com/grafana/k6-studio/commit/f1f035a0993deb9a9eff851d38e0f85432b065f4))


### Bug Fixes

* Cursor is inconsistent across different buttons ([#698](https://github.com/grafana/k6-studio/issues/698)) ([ea120ac](https://github.com/grafana/k6-studio/commit/ea120acea7bcbb3f0d494e6434d9cd76ef4f645b))
* Preview payload when correlating numeric properties ([#671](https://github.com/grafana/k6-studio/issues/671)) ([ae4c428](https://github.com/grafana/k6-studio/commit/ae4c4287552d3f0af6f93c987aee4c27fcceb89b))
* Replace falsy values with json selector ([#666](https://github.com/grafana/k6-studio/issues/666)) ([c6cd3f2](https://github.com/grafana/k6-studio/commit/c6cd3f2f71f27d16f7eed6de87d05170e99b1cf2))
* Resolving script error switches focus to script preview ([1c343ce](https://github.com/grafana/k6-studio/commit/1c343ce549d168a7a25a993c77d9c1a5bdf2edc9))
* Validator run is available when proxy is offline ([#660](https://github.com/grafana/k6-studio/issues/660)) ([82e7ffa](https://github.com/grafana/k6-studio/commit/82e7ffaa3381e4eaca4bc10b8e949056c45b9874))


### Reverts

* Revert "chore(main): release 1.2.0 ([#633](https://github.com/grafana/k6-studio/issues/633))" ([#699](https://github.com/grafana/k6-studio/issues/699)) ([aae57e6](https://github.com/grafana/k6-studio/commit/aae57e6091cead7b868665748ddeb5dbf79a3d24))
* Revert "chore(main): release 1.2.0 ([#697](https://github.com/grafana/k6-studio/issues/697))" ([#706](https://github.com/grafana/k6-studio/issues/706)) ([eaabaf0](https://github.com/grafana/k6-studio/commit/eaabaf0f44af855438b1bf4bfc9f2875914fd418))


### Internal Changes

* **browser:** Add beaker icon to Browser Events tab ([#691](https://github.com/grafana/k6-studio/issues/691)) ([f989ead](https://github.com/grafana/k6-studio/commit/f989ead778f33fae44ee7e4ac25c7822dc79b846))
* **browser:** Add header to generated browser scripts ([#703](https://github.com/grafana/k6-studio/issues/703)) ([fae46f3](https://github.com/grafana/k6-studio/commit/fae46f393183cb05239920b0e3221af11b227e87))
* **browser:** Add toggle for browser events to start recording page ([#689](https://github.com/grafana/k6-studio/issues/689)) ([560ee05](https://github.com/grafana/k6-studio/commit/560ee05dd8aedd45b79a80fb7af2530493523c25))
* **browser:** Element highlights get out of sync with content when resizing/scrolling page ([#681](https://github.com/grafana/k6-studio/issues/681)) ([006d168](https://github.com/grafana/k6-studio/commit/006d168c741f6c1088649fa1b779b0bf2a38d1c9))
* **browser:** Elements are not highlighted when hovering selector in k6 Studio ([#680](https://github.com/grafana/k6-studio/issues/680)) ([6992ce7](https://github.com/grafana/k6-studio/commit/6992ce712f49b7c27e2654c25c4137a9310aa439))
* **browser:** In-browser UI breaks selector generation ([#684](https://github.com/grafana/k6-studio/issues/684)) ([a8c9bcb](https://github.com/grafana/k6-studio/commit/a8c9bcb222a6c20eedf2c0dd5ae8c3760482d28a))
* **browser:** In-browser UI crashes when entering an invalid selector ([#694](https://github.com/grafana/k6-studio/issues/694)) ([2464629](https://github.com/grafana/k6-studio/commit/2464629188b2a789d46e8ef17752bfc91d5b4018))
* **browser:** Styles are not applied to in-browser UI in production ([#702](https://github.com/grafana/k6-studio/issues/702)) ([9be0f2d](https://github.com/grafana/k6-studio/commit/9be0f2dbcaf9546ceb300d33c280e0cda9b57d8e))
* **browser:** Unified schema for assertion events ([#669](https://github.com/grafana/k6-studio/issues/669)) ([fdae74a](https://github.com/grafana/k6-studio/commit/fdae74a3462aa7c13f5819d0df87fc00473f5b2c))
* fix macos build action ([#705](https://github.com/grafana/k6-studio/issues/705)) ([cca9744](https://github.com/grafana/k6-studio/commit/cca9744c240dfec367616bcf04f28253e08b0fb2))
* main window cannot be restored on macOS ([#668](https://github.com/grafana/k6-studio/issues/668)) ([1848282](https://github.com/grafana/k6-studio/commit/1848282f0435cba293255b54701e2f882a6c192e))


### Documentation

* Link contributing guide in readme ([#640](https://github.com/grafana/k6-studio/issues/640)) ([ccd0a1a](https://github.com/grafana/k6-studio/commit/ccd0a1ab9ff259161d21fc934611b737f9c3664c))


### Miscellaneous Chores

* **deps-dev:** bump vite from 5.4.14 to 5.4.18 ([#652](https://github.com/grafana/k6-studio/issues/652)) ([a4bebc9](https://github.com/grafana/k6-studio/commit/a4bebc90d6511a2d3ad6867e1d743bea45c7e563))
* **deps:** bump @babel/helpers from 7.24.8 to 7.27.0 ([#648](https://github.com/grafana/k6-studio/issues/648)) ([c5d4032](https://github.com/grafana/k6-studio/commit/c5d40323863f7776b0383f6c47a144b0623de7cc))
* **deps:** bump @babel/runtime from 7.24.8 to 7.27.0 ([#647](https://github.com/grafana/k6-studio/issues/647)) ([3900f40](https://github.com/grafana/k6-studio/commit/3900f409c4ef5974bda8e0bf7fdd2293b3af36b4))
* **deps:** bump @sentry/node and @sentry/electron ([#649](https://github.com/grafana/k6-studio/issues/649)) ([e984723](https://github.com/grafana/k6-studio/commit/e984723e98844e5d36ccec208319884b50222fb3))
* **deps:** bump tar-fs from 3.0.6 to 3.0.8 ([#612](https://github.com/grafana/k6-studio/issues/612)) ([6bae41a](https://github.com/grafana/k6-studio/commit/6bae41a5216225d505bef83eda897b17a8521c22))
* **main:** release 1.2.0 ([#633](https://github.com/grafana/k6-studio/issues/633)) ([6c39ce4](https://github.com/grafana/k6-studio/commit/6c39ce468c1bb92a5e4bfa48bff448b1f585e1e8))
* **main:** release 1.2.0 ([#697](https://github.com/grafana/k6-studio/issues/697)) ([8290d75](https://github.com/grafana/k6-studio/commit/8290d754c197f146c3f676ab2badff14b896966c))
* manual release action & update runner to ubuntu-latest ([#645](https://github.com/grafana/k6-studio/issues/645)) ([cb5d97e](https://github.com/grafana/k6-studio/commit/cb5d97ed68e2e7465b31279a30ad8e78d6bb70bf))
* release test version action ([#644](https://github.com/grafana/k6-studio/issues/644)) ([f4cb277](https://github.com/grafana/k6-studio/commit/f4cb277fae821500e9773e27a070eb4b8638b617))
* update k6 version to v0.58 ([#693](https://github.com/grafana/k6-studio/issues/693)) ([0f4ef9e](https://github.com/grafana/k6-studio/commit/0f4ef9e429fdbc2af560159de1ff70f7aec0cf23))


### Code Refactoring

* **Split main:** Move app handlers out of main.ts ([#690](https://github.com/grafana/k6-studio/issues/690)) ([fd16d2b](https://github.com/grafana/k6-studio/commit/fd16d2bdcc5b0c4282d3b7553379e82b4c78d7e4))
* **split main:** Move browser handlers out of main.ts ([#627](https://github.com/grafana/k6-studio/issues/627)) ([7ff55af](https://github.com/grafana/k6-studio/commit/7ff55afb9ffa4f9c931c9aa27d8880c43b0bebbb))
* **Split main:** Move data file handlers out of main.ts ([#682](https://github.com/grafana/k6-studio/issues/682)) ([6a993a4](https://github.com/grafana/k6-studio/commit/6a993a4e481392c7dfaf52cf58edd7e3c90847ff))
* **Split main:** Move generator handlers out of main.ts  ([#676](https://github.com/grafana/k6-studio/issues/676)) ([b3afd72](https://github.com/grafana/k6-studio/commit/b3afd724d84612092a6450ed1c57c1d05b368e16))
* **Split main:** Move log handlers out of main.ts  ([#683](https://github.com/grafana/k6-studio/issues/683)) ([9ad597b](https://github.com/grafana/k6-studio/commit/9ad597b45a344149ad7dcd782cb81222f9e158df))
* **Split main:** Move proxy handlers out of main.ts  ([#673](https://github.com/grafana/k6-studio/issues/673)) ([a5e3fda](https://github.com/grafana/k6-studio/commit/a5e3fdad692141e18f0887660e1e6a7320b921b4))
* **split main:** Move script handlers out of main.ts ([#642](https://github.com/grafana/k6-studio/issues/642)) ([a6c0929](https://github.com/grafana/k6-studio/commit/a6c092928acbe6e8b2b406773d6fda3d66f0bd8e))
* **Split main:** Move settings handlers out of main.ts ([#662](https://github.com/grafana/k6-studio/issues/662)) ([955d392](https://github.com/grafana/k6-studio/commit/955d392cca2bd7bbc729f88743b7b13673a528c7))
* **Split main:** Move ui handlers out of main.ts ([#675](https://github.com/grafana/k6-studio/issues/675)) ([26726b6](https://github.com/grafana/k6-studio/commit/26726b6b2e4545b839e431933cba6ced1f9483db))

## [1.1.0](https://github.com/grafana/k6-studio/compare/v1.0.2...v1.1.0) (2025-04-07)


### Features

* Ability to control proxy status ([#581](https://github.com/grafana/k6-studio/issues/581)) ([1a10464](https://github.com/grafana/k6-studio/commit/1a10464f9214672975a29c218c0c46c7ad83a142))
* Add a way to rename files from View header ([#588](https://github.com/grafana/k6-studio/issues/588)) ([a4df3ad](https://github.com/grafana/k6-studio/commit/a4df3ad454de03df7aeb903d65fcc24d385e4e77))
* Add correlation extraction label ([#577](https://github.com/grafana/k6-studio/issues/577)) ([e6018fb](https://github.com/grafana/k6-studio/commit/e6018fb008a07a5082b797161e9713f0dc07e261))
* add logical operator labels ([#587](https://github.com/grafana/k6-studio/issues/587)) ([466e427](https://github.com/grafana/k6-studio/commit/466e4276e698cf26df1cd800d1799bc875428781))
* add support for Chromium on all platforms ([#535](https://github.com/grafana/k6-studio/issues/535)) ([951fb20](https://github.com/grafana/k6-studio/commit/951fb208c66f9247a1acc63713245f394d8d6d9d))
* Pre-fill OS and app version when reporting issues ([#592](https://github.com/grafana/k6-studio/issues/592)) ([748778f](https://github.com/grafana/k6-studio/commit/748778fca29ebad230407ba3bfd30adce890b507))
* Update splashscreen ([#573](https://github.com/grafana/k6-studio/issues/573)) ([197bdf4](https://github.com/grafana/k6-studio/commit/197bdf4e7a89fdd166040157b68053d587aae112))


### Bug Fixes

* Add parameterization rule custom code preview ([#608](https://github.com/grafana/k6-studio/issues/608)) ([824cca3](https://github.com/grafana/k6-studio/commit/824cca3eb5f29230f0f9c0c031b97e4ee39f6dac))
* Highlight URL search matches in request inspector ([#580](https://github.com/grafana/k6-studio/issues/580)) ([f1a9888](https://github.com/grafana/k6-studio/commit/f1a9888129da4bf96ba60db1633a4a0faa1d5f63))
* Keep request inspector open when switching from script tab ([#611](https://github.com/grafana/k6-studio/issues/611)) ([4b2aff4](https://github.com/grafana/k6-studio/commit/4b2aff4ea3b9a44f9f6f2526bd73ad2b74913892))
* Use text value comparison as default option for body verification rules ([#591](https://github.com/grafana/k6-studio/issues/591)) ([b0d978a](https://github.com/grafana/k6-studio/commit/b0d978ae0ac197fe9e26755edea79675c5f120f4))


### Documentation

* Add `CONTRIBUTING.md` ([#615](https://github.com/grafana/k6-studio/issues/615)) ([8dbf34c](https://github.com/grafana/k6-studio/commit/8dbf34c83e12b274f6555a66bcbd0e9e88ac201f))
* Add CODE_OF_CONDUCT.md ([#614](https://github.com/grafana/k6-studio/issues/614)) ([6ae9a99](https://github.com/grafana/k6-studio/commit/6ae9a99b50720075b7a1dedc231bbffee18e5f5e))


### Styles

* Use Inter font even if it's not installed ([#610](https://github.com/grafana/k6-studio/issues/610)) ([11a0f50](https://github.com/grafana/k6-studio/commit/11a0f50f0e1dcff87a7e587ddb6df36cab19a84f))


### Miscellaneous Chores

* Add ESLint import/order rule ([#585](https://github.com/grafana/k6-studio/issues/585)) ([d93b5df](https://github.com/grafana/k6-studio/commit/d93b5df199c01bb49a2e0ba5f65c209aaf4eea95))
* Update bug template ([#590](https://github.com/grafana/k6-studio/issues/590)) ([76f6bc6](https://github.com/grafana/k6-studio/commit/76f6bc669c57d5aade42929a5549ee481d4f44ef))
* update demo video ([#586](https://github.com/grafana/k6-studio/issues/586)) ([0afd232](https://github.com/grafana/k6-studio/commit/0afd2323ac87e875e2ab46376b8b26dd931d3fee))
* Use ExternalLink component for docs and GitHub links ([#584](https://github.com/grafana/k6-studio/issues/584)) ([6404942](https://github.com/grafana/k6-studio/commit/6404942cf7e7166f200bc1f59d69af79c9c298b6))


### Code Refactoring

* **Split main:** Move HAR handlers out of main.ts ([#620](https://github.com/grafana/k6-studio/issues/620)) ([5cf1413](https://github.com/grafana/k6-studio/commit/5cf1413814ff00d4917a55c6f0a90d0d4db7f07e))

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
