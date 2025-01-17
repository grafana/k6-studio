# Changelog

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
