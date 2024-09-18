<p align="center">
  <a href="https://k6.io/">
    <img src="assets/logo.svg" alt="k6" width="210" height="210" /><br>
    <img src="assets/grafana-labs.svg" alt="Grafana Labs" width="210" /><br>
  </a>
</p>

<h3 align="center">Like unit testing, for performance</h3>
<p align="center">Modern load testing for developers and testers in the DevOps era.</p>

<p align="center">
    <a href="https://github.com/grafana/k6-studio/releases">Download</a> ·
    <a href="https://github.com/grafana/k6-studio/issues">Report Issues</a>
</p>

<br/>
<img src="assets/github-hr.png" alt="---" />
<br/>

**k6 Studio** is a free desktop application designed to help you generate k6 tests scripts.
It aids in the creation and inspections of HAR recordings, it provides an interface to modify your recording interactively and finally it includes a debugger to help you debug your scripts.
The goal is to provide **a seamless experience** for generating k6 tests, allowing to create tests in an interactive interface.

The application is composed of three main components:

**Recorder**

A view designed for generating a recording of the flow you want to test, a browser will spawn and every request will be collected for generating an HAR file, you will also be able to create groups to better organize your flow under test!
This happens via a proxy catching requests from this specific browser, the proxy is powered by [mitmproxy](https://github.com/mitmproxy/mitmproxy).

**Generator**

This component allows the generation of a k6 script without having to touch a single line of javascript.
By picking an HAR recording you automatically generate a valid k6 script from it and from this interface you can apply rules to fine-tune your script generation by applying correlations and more, you can even add custom javascript!

In this component you will be able to configure test options, apply rules, see the script preview of what would be generated and even validate it by doing a validation run and finally export the script.

**Validator**

In this final component you will be able to select a k6 script and do a single VU and single iteration run to make sure that your script is working as intended.
The interface provides a view into the selected script, all the requests and responses sent with the ability to inspect them in detail, a view into k6 logs and finally you can also inspect k6 checks.

## Support

To get help, report bugs, suggest features, and discuss k6 Studio please open a ticket [here](https://github.com/grafana/k6-studio/issues).

## License

k6 Studio is distributed under the [AGPL-3.0 license](https://github.com/grafana/k6-studio/blob/master/LICENSE).

## Development

### Requirements

- nodejs >= v20

### Dev install

```
npm install
npm start
```

### Troubleshooting

Currently any code change will trigger an hotreload causing the proxy service to possibly leak while starting a new one. 
If you encounter issues with the proxy please kill the service:

```
ps aux | grep k6-studio-proxy
kill -9 <id>
```
