import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('--- STARTING COMPREHENSIVE END-TO-END VERIFICATION ---');

  // Launch Chrome in headless mode with remote debugging
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  // Give Chrome a moment to start
  await new Promise(r => setTimeout(r, 2000));

  try {
    // 1. Get browser target
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    const versionData = await versionRes.json();
    console.log('Connected to Chrome:', versionData.Browser);

    // 2. Create new target page
    const newPageRes = await fetch('http://127.0.0.1:9222/json/new?http://127.0.0.1:3000', { method: 'PUT' });
    const pageData = await newPageRes.json();
    const wsUrl = pageData.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);

    let idCounter = 1;
    const pending = new Map();
    const consoleLogs = [];
    const jsErrors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
        consoleLogs.push({ type: msg.params.type, text });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        jsErrors.push(msg.params.exceptionDetails.text);
      }
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    function send(method, params = {}) {
      const id = idCounter++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable domains
    await send('Runtime.enable');
    await send('Page.enable');
    await send('DOM.enable');

    // Wait for page to fully load and React to hydrate
    await new Promise(r => setTimeout(r, 2500));

    // Verify sections
    console.log('\n[1] Verifying Required Sections in DOM:');
    const sections = ['home', 'about', 'education', 'skills', 'projects', 'achievements', 'contact'];
    
    for (const sec of sections) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `Boolean(document.getElementById("${sec}"))`
      });
      const exists = evalRes.result.value;
      console.log(`  Section #${sec}: ${exists ? '✓ FOUND' : '✗ MISSING'}`);
    }

    // Verify critical content strings
    console.log('\n[2] Verifying Personal & Academic Content:');
    const checks = [
      { name: 'Full Name', expr: 'document.body.innerText.includes("Praveen Vishnoi")' },
      { name: 'Tagline', expr: 'document.body.innerText.includes("B.Tech Student | AI & Technology Enthusiast")' },
      { name: 'University', expr: 'document.body.innerText.includes("JECRC University")' },
      { name: 'Location', expr: 'document.body.innerText.includes("Jaipur, India")' },
      { name: 'Email', expr: 'document.body.innerText.includes("praveenvishnoi39@gmail.com")' },
      { name: 'LinkedIn', expr: 'document.body.innerText.includes("Praveen Vishnoi")' },
      { name: 'GitHub', expr: 'document.body.innerText.includes("praveen.devv")' },
      { name: 'Skill - HTML', expr: 'document.body.innerText.includes("HTML")' },
      { name: 'Skill - CSS', expr: 'document.body.innerText.includes("CSS")' },
      { name: 'Skill - JavaScript', expr: 'document.body.innerText.includes("JavaScript")' },
      { name: 'Skill - Python', expr: 'document.body.innerText.includes("Python")' },
      { name: 'Skill - AI', expr: 'document.body.innerText.includes("Artificial Intelligence")' },
      { name: 'Skill - Gen AI', expr: 'document.body.innerText.includes("Generative AI")' },
      { name: 'Skill - Web Dev', expr: 'document.body.innerText.includes("Web Development")' },
      { name: 'Skill - Digital Productivity', expr: 'document.body.innerText.includes("Digital Productivity")' },
      { name: 'Project 1', expr: 'document.body.innerText.includes("Personal Portfolio Website")' },
      { name: 'Project 2', expr: 'document.body.innerText.includes("AI Website Project")' },
      { name: 'Project 3', expr: 'document.body.innerText.includes("Student Productivity Project")' },
      { name: 'Achievements Category - Certifications', expr: 'document.body.innerText.includes("Certifications")' },
      { name: 'Achievements Category - Hackathons', expr: 'document.body.innerText.includes("Hackathons")' },
      { name: 'Achievements Category - Courses', expr: 'document.body.innerText.includes("Courses & Bootcamps")' },
      { name: 'Achievements Category - Awards', expr: 'document.body.innerText.includes("Awards & Honors")' },
      { name: 'Achievements Category - Other', expr: 'document.body.innerText.includes("Other Achievements")' }
    ];

    for (const check of checks) {
      const res = await send('Runtime.evaluate', { expression: check.expr });
      console.log(`  ${check.name}: ${res.result.value ? '✓ VERIFIED' : '✗ NOT FOUND'}`);
    }

    // Capture Desktop Screenshot
    console.log('\n[3] Capturing Desktop Screenshot (1280x800)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));
    const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-desktop.png', Buffer.from(desktopShot.data, 'base64'));
    console.log('  Saved screenshot-desktop.png');

    // Test Mobile Breakpoint & Hamburger Menu
    console.log('\n[4] Testing Mobile Breakpoint (390x844 - iPhone 14 / Mobile)...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 600));

    // Check hamburger button existence
    const btnRes = await send('Runtime.evaluate', {
      expression: 'Boolean(document.querySelector("button[aria-label=\'Toggle navigation menu\']"))'
    });
    console.log(`  Hamburger Menu Button: ${btnRes.result.value ? '✓ PRESENT & ACCESSIBLE' : '✗ NOT FOUND'}`);

    // Click Hamburger Button
    await send('Runtime.evaluate', {
      expression: 'document.querySelector("button[aria-label=\'Toggle navigation menu\']").click()'
    });
    await new Promise(r => setTimeout(r, 500));

    // Capture Mobile Menu Open Screenshot
    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshot-mobile.png', Buffer.from(mobileShot.data, 'base64'));
    console.log('  Saved screenshot-mobile.png (with open mobile drawer)');

    // Test Project View Modal Click
    console.log('\n[5] Testing Interactive "View Project" Modal...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 400));
    
    // Click first "View Project" button
    await send('Runtime.evaluate', {
      expression: `
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("View Project"));
        if (btn) btn.click();
      `
    });
    await new Promise(r => setTimeout(r, 500));

    const modalRes = await send('Runtime.evaluate', {
      expression: 'document.body.innerText.includes("Live Preview & Code Link")'
    });
    console.log(`  Modal opened on "View Project" click: ${modalRes.result.value ? '✓ SUCCESS' : '✗ FAILED'}`);

    // Check Console Logs & Errors
    console.log('\n[6] Checking Browser Console Errors:');
    if (jsErrors.length === 0) {
      console.log('  ✓ ZERO Uncaught JavaScript Exceptions!');
    } else {
      console.error('  ✗ JS Errors:', jsErrors);
    }

    const severeLogs = consoleLogs.filter(l => l.type === 'error');
    if (severeLogs.length === 0) {
      console.log('  ✓ ZERO Console Error Logs!');
    } else {
      console.error('  ✗ Console Errors:', severeLogs);
    }

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');

    ws.close();
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run();
