// 用 Chrome DevTools Protocol 截「整页」图（保留真实视口高度，避免 100vh 被拉伸）
// 用法: node tools/shot.mjs <url> <输出png> [视口宽] [视口高] [是否点击进入页: click|nope]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [url, out, wArg, hArg, action = 'nope'] = process.argv.slice(2);
const W = Number(wArg || 1440);
const H = Number(hArg || 900);
const PORT = 9222;
const target = resolve(out);
mkdirSync(dirname(target), { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdp(ws, method, params = {}, sessionId) {
  const id = Math.floor(Math.random() * 1e9);
  return new Promise((res, rej) => {
    const onMsg = (ev) => {
      let m;
      try { m = JSON.parse(ev.data); } catch { return; }
      if (m.id !== id) return;
      ws.removeEventListener('message', onMsg);
      m.error ? rej(new Error(method + ': ' + JSON.stringify(m.error))) : res(m.result);
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find((t) => t.type === 'page');
if (!page) throw new Error('没有找到可用的标签页');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

await cdp(ws, 'Page.enable');
await cdp(ws, 'Emulation.setDeviceMetricsOverride', {
  width: W, height: H, deviceScaleFactor: 1, mobile: false,
});
await cdp(ws, 'Page.navigate', { url });
await sleep(3500);

if (action === 'click' || action === 'reveal') {
  // 点一下「进入」按钮，跳过遮罩
  await cdp(ws, 'Runtime.evaluate', {
    expression: `document.getElementById('enterBtn').click()`,
  });
  await sleep(2200);
}

if (action === 'reveal') {
  // 整页截图时 IntersectionObserver 不会为视口外元素触发，先强制显示再截
  await cdp(ws, 'Runtime.evaluate', {
    expression: `document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible')); 'ok'`,
  });
  await sleep(900);
}

const { data } = await cdp(ws, 'Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: true,
});
writeFileSync(target, Buffer.from(data, 'base64'));
console.log(`已保存 ${target}`);
ws.close();
process.exit(0);
