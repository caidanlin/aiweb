/* ============================================================
   雷姆色的个人主页 — 交互脚本
   1) 进入按钮：淡出遮罩、解锁滚动、启动打字机
   2) 打字机：首页那句问候语
   3) 滚动揭示 + 侧边导航点高亮
   4) 音乐卡片的均衡器开关
   5) 贴纸跟随鼠标微微位移
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. 进入页
     --------------------------------------------------------- */
  var gate = document.getElementById('gate');
  var enterBtn = document.getElementById('enterBtn');
  var site = document.getElementById('site');
  var body = document.body;

  // 进入前先锁住滚动，避免遮罩还在时页面能滑
  body.classList.add('is-locked');

  var entered = false;

  function enter() {
    if (entered) return;
    entered = true;

    gate.classList.add('is-open');
    body.classList.remove('is-locked');
    site.classList.add('is-in');

    // 遮罩动画结束后从文档流里移除，避免挡住后面的点击
    window.setTimeout(function () {
      gate.style.display = 'none';
      startTyping();
      revealOnScroll();   // 首屏元素立刻检查一次
    }, 1000);
  }

  enterBtn.addEventListener('click', enter);

  // 键盘：回车 / 空格也能进入
  document.addEventListener('keydown', function (e) {
    if (!entered && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      enter();
    }
  });

  /* ---------------------------------------------------------
     2. 打字机
     --------------------------------------------------------- */
  var LINES = [
    '你好，欢迎来到我的主页',
    '我喜欢蓝色，也喜欢雷姆',
    '业余爱好是打乒乓球',
    '最近一直在听《怪咖》'
  ];

  var target = document.getElementById('typeTarget');
  var lineIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function tick() {
    var line = LINES[lineIndex];

    if (!deleting) {
      charIndex++;
      target.textContent = line.slice(0, charIndex);
      if (charIndex === line.length) {
        deleting = true;
        return window.setTimeout(tick, 1600);      // 打完停一下
      }
      return window.setTimeout(tick, 110);
    }

    charIndex--;
    target.textContent = line.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      lineIndex = (lineIndex + 1) % LINES.length;
      return window.setTimeout(tick, 420);
    }
    return window.setTimeout(tick, 45);
  }

  function startTyping() {
    if (!target) return;
    window.setTimeout(tick, 400);
  }

  /* ---------------------------------------------------------
     3. 滚动揭示 + 导航点
     --------------------------------------------------------- */
  var revealItems = document.querySelectorAll('.reveal');

  function revealOnScroll() {
    revealItems.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.86) {
        el.classList.add('is-visible');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    window.addEventListener('scroll', revealOnScroll, { passive: true });
  }

  // 导航点：滚动到哪个区块就高亮哪个
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var sections = dots
    .map(function (d) { return document.querySelector(d.getAttribute('href')); })
    .filter(Boolean);

  function syncDots() {
    var mid = window.scrollY + window.innerHeight * 0.4;
    var current = 0;
    sections.forEach(function (sec, i) {
      if (sec.offsetTop <= mid) current = i;
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === current);
    });
  }

  window.addEventListener('scroll', syncDots, { passive: true });
  syncDots();

  /* ---------------------------------------------------------
     4. 均衡器开关
     --------------------------------------------------------- */
  var eqToggle = document.getElementById('eqToggle');
  var player = document.querySelector('.player');
  var bgm = document.getElementById('bgm');

  if (eqToggle && player) {
    eqToggle.addEventListener('click', function () {
      var paused = player.classList.toggle('is-paused');
      eqToggle.textContent = paused ? '继续律动' : '暂停律动';
      if (bgm) {
        if (paused) { bgm.pause(); } else { bgm.play(); }
      }
    });
  }

  /* ---------------------------------------------------------
     5. 贴纸跟随鼠标（很轻微，只是让画面活一点）
     --------------------------------------------------------- */
  var stickers = document.querySelectorAll('.floater, .deco-item');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (stickers.length && !reduceMotion) {
    var mx = 0, my = 0, cx = 0, cy = 0;

    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    (function loop() {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      stickers.forEach(function (el, i) {
        var depth = 4 + (i % 4) * 2.5;
        el.style.setProperty('--px', (cx * depth).toFixed(2) + 'px');
        el.style.setProperty('--py', (cy * depth).toFixed(2) + 'px');
      });
      window.requestAnimationFrame(loop);
    })();
  }
})();
