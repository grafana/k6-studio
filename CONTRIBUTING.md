# Contributing to Grafana k6 Studio

Thank you for your interest in contributing to Grafana k6 Studio! We welcome all people who want to contribute in a healthy and constructive manner within our community. To help us create a safe and positive community experience for all, we require all participants to adhere to the [Code of Conduct](.github/CODE_OF_CONDUCT.md).

If you want to chat with the team or the community, you can [join our community forums](https://community.grafana.com/c/grafana-k6/k6-studio/)

## Report issues

Before submitting a new issue, try to make sure someone hasn't already reported the problem. Look through the [existing issues](https://github.com/grafana/k6-studio/issues) for similar issues.

Report a bug by submitting a [bug report](https://github.com/grafana/k6-studio/issues/new?template=bug.yaml).

Follow the issue template and add additional information that will help us replicate the problem.

## Contribute to code

1. Pick an issue you'd like to fix. If there isn't one already, or you want to add a feature, please open one, and we can talk about how to do it. Out of respect for your time, please start a discussion about major contributions either in a GitHub Issue or in the [community forums](https://community.grafana.com/c/grafana-k6/k6-studio/) before you start implementing
2. Create a fork and open a feature branch
3. Sign the [Contributor License Agreement](https://cla-assistant.io/grafana/k6-studio) (the process is integrated with the pull request flow through cla-assistant.io)
4. Create a pull request. Make sure to include a description of the changes you made, and reference the issue number if applicable. The PR title should be descriptive and follow the [commit message format](#commit-message-format). Make sure to fill the PR template with the information we need to review your PR
5. GitHub will assign reviewers to your pull request. We will review your PR and provide feedback. We may ask you to make changes or improvements to your code. Once your PR is approved, a maintainer will merge it

### Commit message format

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. This helps us to automate the release process and generate changelogs.

Additionally, we have the following rules:

- Use a complete sentence for your commit message/PR title. The PR title will appear in the changelog, so the message should give a good idea of what the change is about.
- Start with an imperative verb. Example: `Add type column to WebLogView`
  - **Exception:** if the PR fixes a bug, please describe the bug rather than the fix. Example: `fix: Application crashes when opening a HAR file`
- Use _Sentence case_ for the commit message/PR title. Example: `Add type column to WebLogView` instead of `add type column to WebLogView`
