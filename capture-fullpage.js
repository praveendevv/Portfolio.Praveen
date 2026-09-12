import { spawn } from 'child_process';
import fs from 'fs';

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const newPageRes = await fetch('http://127.0.0.1:9222/json/new?http://127.0.0.1:3000', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const ws = new WebSocket(pageData.webSocketDebuggerUrl);

    let id = 1;
    const pending = new Map();
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve } = pending.get(msg.id);
        pending.delete(msg.id);
        resolve(msg.result);
      }
    };
    await new Promise(r => ws.onopen = r);

    const call = (method, params = {}) => new Promise(resolve => {
      const callId = id++;
      pending.set(callId, { resolve });
      ws.send(JSON.stringify({ id: callId, method, params }));
    });

    await call('Page.enable');
    await call('DOM.enable');
    await new Promise(r => setTimeout(r, 2000));

    // Get layout metrics for full page height
    const metrics = await call('Page.getLayoutMetrics');
    const contentSize = metrics.contentSize;
    console.log('Page Content Height:', contentSize.height);

    await call('Emulation.setDeviceMetricsOverride', {
      width: 1200,
      height: Math.min(Math.round(contentSize.height), 8000),
      deviceScaleFactor: 1,
      mobile: false
    });

    await new Promise(r => setTimeout(r, 1000));

    const shot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync('screenshot-fullpage.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot-fullpage.png');

    // Also take targeted shots of Skills and Projects sections
    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

capture();
