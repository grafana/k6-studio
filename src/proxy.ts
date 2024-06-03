import { app, BrowserWindow } from 'electron';
import path from 'path';
import { spawn, ChildProcessWithoutNullStreams } from 'node:child_process';
import { getPlatform, getArch } from './utils';
import forge from 'node-forge';
import { readFile } from 'fs/promises';
import { ProxyData } from './lib/types';
import { Buffer } from 'node:buffer';

export type ProxyProcess = ChildProcessWithoutNullStreams;

export const launchProxy = (browserWindow: BrowserWindow): ProxyProcess => {
  let proxyScript: string;
  let proxyPath: string;
  const certificatesPath = getCertificatesPath();

  // if we are in dev server we take resources directly, otherwise look in the app resources folder.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    proxyScript = path.join(app.getAppPath(), 'resources', 'json_output.py');
    proxyPath = path.join(app.getAppPath(), 'resources', getPlatform(), getArch(), 'mitmdump');
  } else {
    proxyScript = path.join(process.resourcesPath, 'json_output.py');
    // only the architecture directory will be in resources on the packaged app
    proxyPath = path.join(process.resourcesPath, getArch(), 'mitmdump');
  }

  // add .exe on windows
  proxyPath += getPlatform() === 'win' ? '.exe' : ''

  const proxy = spawn(proxyPath, ['-q', '-s', proxyScript, '--set', `confdir=${certificatesPath}`]);

  let proxyDataBuffer: Buffer;

  proxy.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);

    if (data.toString() === 'Proxy Started~\n') {
      browserWindow.webContents.send('proxy:started');
      return;
    }

    // we buffer data since messages could be coming by multiple stdout data events
    if (proxyDataBuffer) {
      proxyDataBuffer = Buffer.concat([proxyDataBuffer, data]);
    } else {
      proxyDataBuffer = data;
    }

    // try to parse the json and if it fails we just wait for more data
    // when the buffer is used we also clean it up in here.
    try {
      const proxyData: ProxyData = JSON.parse(proxyDataBuffer.toString());
      browserWindow.webContents.send('proxy:data', proxyData);
      proxyDataBuffer = null;
    } catch (error) {
      return;
    }
  });

  proxy.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  proxy.on('close', (code) => {
    console.log(`proxy process exited with code ${code}`);
  });

  return proxy
}

export const getCertificatesPath = () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return path.join(app.getAppPath(), 'resources', 'certificates');
  } else {
    return path.join(process.resourcesPath, 'certificates');
  }
}

export const getCertificateSPKI = async () => {
  const certificatePath = path.join(getCertificatesPath(), 'mitmproxy-ca-cert.pem')
  const certificatePem = await readFile(certificatePath, { encoding: 'utf-8' });

  const certificate = forge.pki.certificateFromPem(certificatePem);
  const spki = forge.pki.getPublicKeyFingerprint(certificate.publicKey, {
    type: 'SubjectPublicKeyInfo',
    md: forge.md.sha256.create(),
    encoding: 'binary',
  });

  // base64 encoded spki
  return forge.util.encode64(spki);
}
