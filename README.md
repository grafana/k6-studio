<p align="center">
  <a href="https://grafana.com/products/cloud/k6/">
    <img src="assets/logo.svg" alt="k6" width="210" height="210" /><br>
    <img src="assets/grafana-labs.svg" alt="Grafana Labs" width="210" /><br>
  </a>
</p>

<p align="center">Desktop application for Mac and Windows designed to help you generate k6 test scripts</p>

<p align="center">
    <a href="https://github.com/grafana/k6-studio/releases">Download</a> ·
    <a href="https://github.com/grafana/k6-studio/issues">Report issues</a>
</p>

<br/>
<img src="assets/github-hr.png" alt="---" />
<br/>

--- 

<p align="center">⚠️</p>

***This application is currently in the experimental stage. Expect bugs, incomplete features, and breaking changes as development progresses. Use at your own risk, and please report any issues or feedback to help us improve.***

---

With **k6 Studio**, you can quickly record a user flow in a browser, generate and inspect a HAR recording, customize your test script using predefined or custom rules, and test and debug your script to ensure it's working as expected.

The goal is to provide **a seamless experience** for generating k6 test scripts, making it easier for anyone to create performance tests in an interactive interface.
## How it works

k6 Studio is composed of three main components:

## Recorder

The recorder is designed to generate a HAR recording of the user flow you want to test. When you start a recording, a new browser window opens, and every request is collected to generate the HAR file. You can also create groups during the recording to better organize your test script.
> The recorder uses a proxy to catch requests from the specific browser window, which is powered by [mitmproxy](https://github.com/mitmproxy/mitmproxy).

> ⚠️ At this stage we require Chrome to be installed for the recording functionality

## Generator

The generator helps you create a k6 test script without having to write a single line of JavaScript.
You can choose a HAR recording to automatically generate a valid k6 script, and then apply rules to fine-tune your script. For example, you can use a correlation rule to extract and replace a variable across your script, or even add custom JavaScript after each request.

You can also configure test options, such as the load profile for your test, see a preview of the script after all the rules are applied, and validate or export the script.

## Validator

The validator can help you test a k6 script by executing a single VU and single iteration test run to make sure that your script is working as intended.
You can view the selected k6 script, all the requests and responses sent with the ability to inspect them in detail, the k6 logs, and also any k6 checks that are in your script.

## Support

If you have any issues with k6 Studio, would like to report a bug, or suggest new features, open a ticket [here](https://github.com/grafana/k6-studio/issues).

## License

k6 Studio is distributed under the [AGPL-3.0 license](https://github.com/grafana/k6-studio/blob/master/LICENSE).

---

## Development

### Requirements

- Node.js >= v20

### Dev install

```
npm install
npm start
```
