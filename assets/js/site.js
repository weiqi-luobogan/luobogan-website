    // 全局脚本懒加载器 v2：超时 + 重试 + 失败可恢复
    window.__luoboLoadScript = function(url, _attempt) {
      window.__luoboLoadedScripts = window.__luoboLoadedScripts || {};
      if (window.__luoboLoadedScripts[url]) return window.__luoboLoadedScripts[url];
      var attempt = _attempt || 0;
      var p = new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        var timer = setTimeout(function() {
          s.onload = s.onerror = null;
          if (s.parentNode) s.parentNode.removeChild(s);
          reject(new Error('timeout: ' + url));
        }, 15000);
        s.src = url;
        s.async = true;
        s.onload = function() { clearTimeout(timer); resolve(); };
        s.onerror = function() { clearTimeout(timer); if (s.parentNode) s.parentNode.removeChild(s); reject(new Error('failed: ' + url)); };
        document.head.appendChild(s);
      }).catch(function(err) {
        // 清除缓存使重试成为可能
        delete window.__luoboLoadedScripts[url];
        if (attempt < 1) {
          // 2 秒后自动重试一次
          return new Promise(function(r) { setTimeout(r, 2000); }).then(function() {
            return window.__luoboLoadScript(url, attempt + 1);
          });
        }
        // 重试用尽，通知用户
        console.warn('[luobo-load]', err.message);
        if (window.showToast) window.showToast('加载失败，请检查网络后重试');
        throw err;
      });
      window.__luoboLoadedScripts[url] = p;
      return p;
    };
    // 骨架屏注入/移除工具
    window.__luoboSkeleton = {
      show: function(container) {
        if (!container || container.querySelector('.luobo-skeleton')) return;
        var sk = document.createElement('div');
        sk.className = 'luobo-skeleton';
        sk.innerHTML = '<div class="luobo-skeleton-text"></div><div class="luobo-skeleton-text"></div><div class="luobo-skeleton-text"></div>';
        container.appendChild(sk);
      },
      hide: function(container) {
        if (!container) return;
        var sk = container.querySelector('.luobo-skeleton');
        if (sk) sk.parentNode.removeChild(sk);
      }
    };
    // ===== 微信/iOS 分享图统一工具 v1 =====
    // 策略：navigator.share(files) → 弹窗长按保存 → clipboard 兜底
    window.__luoboShareImage = function(canvasOrBlob, filename) {
      var getBlob = function(cb) {
        if (canvasOrBlob instanceof Blob) { cb(canvasOrBlob); return; }
        if (canvasOrBlob instanceof HTMLCanvasElement) {
          canvasOrBlob.toBlob(function(b) { cb(b); }, 'image/png');
          return;
        }
        cb(null);
      };
      getBlob(function(blob) {
        if (!blob) { if(window.showToast) window.showToast('图片生成失败'); return; }
        var file = new File([blob], filename || 'share.png', { type: 'image/png' });
        // 优先：Web Share API Level 2（Android Chrome、iOS Safari 15+）
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: '萝卜干围棋' }).catch(function(){});
          return;
        }
        // 次选：弹窗显示图片 → 长按保存（微信/iOS 通用方案）
        var url = URL.createObjectURL(blob);
        var modal = document.createElement('div');
        modal.className = 'luobo-share-modal';
        modal.innerHTML = '<img src="' + url + '" alt="分享图">' +
          '<div class="share-tip">长按图片保存到相册<br>再打开微信分享到朋友圈</div>' +
          '<button class="share-close">关闭</button>';
        document.body.appendChild(modal);
        modal.querySelector('.share-close').addEventListener('click', function() {
          document.body.removeChild(modal);
          setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
        });
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            document.body.removeChild(modal);
            setTimeout(function(){ URL.revokeObjectURL(url); }, 500);
          }
        });
        // 兜底：尝试复制到剪贴板
        if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
          try {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
              if(window.showToast) window.showToast('图片已复制到剪贴板');
            }).catch(function(){});
          } catch(e){}
        }
      });
    };

;
    // header 更多下拉 v2：统一状态管理，消除 inline onclick 冲突
    (function(){
      function closeAllDropdowns() {
        document.querySelectorAll('.header-dropdown').forEach(function(dd) {
          dd.style.display = 'none';
        });
      }
      // toggle 绑定：button 紧邻 .header-dropdown
      document.querySelectorAll('.header-dropdown').forEach(function(dd) {
        var btn = dd.previousElementSibling;
        if (btn) btn.addEventListener('click', function(e) {
          e.stopPropagation();
          var isOpen = dd.style.display === 'block';
          closeAllDropdowns();
          if (!isOpen) {
            dd.style.display = 'block';
            dd.style.animation = 'fadeSlideIn .2s ease-out';
          }
        });
        // 点击下拉项后关闭
        dd.addEventListener('click', function(e) {
          if (e.target.closest('a')) closeAllDropdowns();
        });
      });
      // 点击外部关闭
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-dropdown') && !e.target.closest('.relative button')) {
          closeAllDropdowns();
        }
      });
      // ESC 关闭
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeAllDropdowns();
      });
    })();
    
;
function toggleShixunDetail(btn) {
  var detail = document.getElementById('shixun-detail');
  detail.classList.toggle('open');
  if (detail.classList.contains('open')) {
    btn.textContent = '收起详情 ↑';
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    btn.textContent = '查看课程详情 ↓';
  }
}
;
(function(){
  function openTool(id){
    document.querySelectorAll('#tools .tool-panel').forEach(function(p){p.classList.remove('active');});
    var panel = document.getElementById(id);
    if(panel){
      panel.classList.add('active');
      setTimeout(function(){panel.scrollIntoView({behavior:'smooth', block:'start'});}, 100);
    }
  }
  function closeTool(){
    document.querySelectorAll('#tools .tool-panel').forEach(function(p){p.classList.remove('active');});
    var section = document.getElementById('tools');
    if(section){section.scrollIntoView({behavior:'smooth', block:'start'});}
  }
  window.openTool = openTool;
  window.closeTool = closeTool;

  // 查看全部工具 展开/收起
  function toggleToolsExtra(btn){
    var group = btn.closest('.toolgroup');
    if(!group) return;
    var expanded = group.classList.toggle('show-all');
    btn.textContent = expanded ? '收起 ↑' : '查看全部工具 ↓';
  }
  window.toggleToolsExtra = toggleToolsExtra;

  // tab 切换
  document.addEventListener('click', function(e){
    var btn = e.target.closest('#tools .tab-btn');
    if(!btn) return;
    var tab = btn.getAttribute('data-tab');
    document.querySelectorAll('#tools .tab-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    document.querySelectorAll('#tools .toolgroup').forEach(function(g){
      g.classList.toggle('active', g.getAttribute('data-group') === tab);
    });
    document.querySelectorAll('#tools .tool-panel').forEach(function(p){p.classList.remove('active');});
  });
})();
;
(function(){
  'use strict';
  if (window.__luoboCTInit) return;
  window.__luoboCTInit = true;

  // ==== 常量：常模参考区间（秒） ====
  var NORM = {
    'under18': {min:28, max:38, label:'18 岁以下'},
    '18-25':   {min:30, max:40, label:'18-25 岁'},
    '26-35':   {min:35, max:45, label:'26-35 岁'},
    '36-45':   {min:40, max:55, label:'36-45 岁'},
    '46-55':   {min:50, max:65, label:'46-55 岁'},
    '55+':     {min:55, max:70, label:'55 岁以上'}
  };
  // 围棋教师群体基准（真实测试样本，2026-07-14 更新自内测种子）
  var TEACHER_BASELINE = { n:16, avg:16.4, label:'围棋教师中位数' };
  var STORAGE_KEY = 'luobo_ct_history_v1';
  var LAST_INFO_KEY = 'luobo_ct_lastinfo_v1';

  // ==== 状态 ====
  var state = {
    order: [],       // 打乱后的 25 个数字（下标 -> 数字）
    next: 1,         // 下一个要点的数字
    startTs: 0,      // performance.now() 起点
    rafId: 0,
    elapsed: 0,      // 毫秒
    info: null       // 最近提交的用户信息
  };

  function fmtTime(ms){
    var s = ms / 1000;
    return s.toFixed(2);
  }

  // Fisher-Yates 洗牌
  function shuffle(arr){
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function getRadio(name){
    var els = document.querySelectorAll('#concentration-test input[type=radio][name="'+name+'"]:checked');
    return els.length ? els[0].value : '';
  }
  function setRadio(name, value){
    var els = document.querySelectorAll('#concentration-test input[type=radio][name="'+name+'"]');
    els.forEach(function(el){ el.checked = (el.value === value); });
  }

  function collectInfo(){
    var nick = (document.getElementById('ct-nick').value || '').trim() || '匿名棋友';
    var wx = (document.getElementById('ct-wx').value || '').trim();
    var role = getRadio('ct-role') || '围观群众';
    var age = getRadio('ct-age') || '26-35';
    return { nick:nick, wx:wx, role:role, age:age };
  }

  function saveLastInfo(info){
    try { localStorage.setItem(LAST_INFO_KEY, JSON.stringify(info)); } catch(e){}
  }
  function loadLastInfo(){
    try {
      var s = localStorage.getItem(LAST_INFO_KEY);
      return s ? JSON.parse(s) : null;
    } catch(e){ return null; }
  }
  function loadHistory(){
    try {
      var s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch(e){ return []; }
  }
  function pushHistory(rec){
    var list = loadHistory();
    list.unshift(rec);
    list = list.slice(0, 5);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){}
  }

  function renderHistory(){
    var list = loadHistory();
    var box = document.getElementById('ct-history');
    var ul = document.getElementById('ct-history-list');
    if (!list.length) { box.style.display = 'none'; return; }
    box.style.display = 'block';
    var html = '';
    list.forEach(function(r){
      var d = new Date(r.ts);
      var dt = (d.getMonth()+1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      html += '<div class="ct-history-item"><span>'+dt+' · '+(r.role||'')+' · '+(NORM[r.age]?NORM[r.age].label:r.age)+'</span><span><b>'+r.timeSec.toFixed(2)+'</b> 秒</span></div>';
    });
    ul.innerHTML = html;
  }

  // ==== 阶段切换 ====
  function showStage(name){
    ['intro','game','result'].forEach(function(s){
      var el = document.getElementById('ct-stage-'+s);
      if (el) el.style.display = (s === name) ? 'block' : 'none';
    });
  }

  // ==== 初始化棋盘 ====
  function initGrid(){
    var nums = [];
    for (var i = 1; i <= 25; i++) nums.push(i);
    state.order = shuffle(nums);
    state.next = 1;
    var grid = document.getElementById('ct-grid');
    grid.innerHTML = '';
    state.order.forEach(function(n){
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ct-cell';
      cell.textContent = n;
      cell.dataset.n = n;
      cell.addEventListener('click', onCellClick);
      grid.appendChild(cell);
    });
    document.getElementById('ct-next').textContent = '1';
  }

  function onCellClick(e){
    var n = parseInt(e.currentTarget.dataset.n, 10);
    if (e.currentTarget.classList.contains('ct-done')) return;
    if (n === state.next) {
      e.currentTarget.classList.add('ct-done');
      state.next += 1;
      document.getElementById('ct-next').textContent = state.next > 25 ? '完成' : state.next;
      if (state.next > 25) { finishGame(); }
    } else {
      // 错误：闪红提示
      var cell = e.currentTarget;
      cell.classList.add('ct-err');
      setTimeout(function(){ cell.classList.remove('ct-err'); }, 320);
    }
  }

  function startTimer(){
    state.startTs = performance.now();
    state.elapsed = 0;
    tick();
  }
  function tick(){
    state.elapsed = performance.now() - state.startTs;
    document.getElementById('ct-timer').textContent = fmtTime(state.elapsed);
    state.rafId = requestAnimationFrame(tick);
  }
  function stopTimer(){
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = 0;
  }

  function beginGame(){
    state.info = collectInfo();
    saveLastInfo(state.info);
    initGrid();
    showStage('game');
    // 稍微延迟一点让用户看到方格
    setTimeout(startTimer, 300);
  }

  function finishGame(){
    stopTimer();
    var timeSec = state.elapsed / 1000;
    var rec = {
      ts: Date.now(),
      timeSec: timeSec,
      nick: state.info.nick,
      role: state.info.role,
      age: state.info.age,
      wx: state.info.wx
    };
    pushHistory(rec);
    showResult(rec);
  }

  // ==== 结果 & 分级 ====
  function evalLevel(timeSec, age){
    var n = NORM[age] || NORM['26-35'];
    if (timeSec <= 12) return { level:'极快', tone:'你的用时进入 12 秒极值区间，明显快过同龄段与教师群体基准。' };
    if (timeSec <= n.min) return { level:'较快', tone:'你的用时优于本年龄段常模区间，注意力集中度不错。' };
    if (timeSec <= n.max) return { level:'常模内', tone:'你的用时落在本年龄段常模区间内，属于正常水平。' };
    if (timeSec <= n.max * 1.3) return { level:'略慢', tone:'你的用时比本年龄段常模略慢，多做规律训练会有稳定改善。' };
    return { level:'可训练空间较大', tone:'你的用时高于本年龄段常模区间，日常规律训练往往能看到明显提升。' };
  }

  function showResult(rec){
    var timeSec = rec.timeSec;
    var age = rec.age;
    var n = NORM[age] || NORM['26-35'];
    var ev = evalLevel(timeSec, age);

    document.getElementById('ct-result-sec').textContent = timeSec.toFixed(2);
    document.getElementById('ct-result-tags').innerHTML =
      '<span class="ct-tag">'+rec.nick+'</span>'+
      '<span class="ct-tag">'+rec.role+'</span>'+
      '<span class="ct-tag">'+n.label+'</span>'+
      '<span class="ct-tag">'+ev.level+'</span>';
    document.getElementById('ct-norm-range').textContent = n.min + ' - ' + n.max + ' 秒';
    document.getElementById('ct-teacher-baseline').textContent = TEACHER_BASELINE.avg + ' 秒（N=' + TEACHER_BASELINE.n + '）';

    var extra = '';
    if (rec.role === '围棋教师') {
      extra = '作为围棋教师，稳定的注意力也是长时段带课与复盘的重要基本功。';
    } else if (rec.role === '围棋学员' || rec.role === '家长') {
      extra = '规律的围棋训练可以帮助进一步提升专注力，让日常学习更专注。';
    } else {
      extra = '专注力可以通过规律训练稳步提升，围棋是一种可长期陪伴的方式。';
    }
    document.getElementById('ct-encourage').innerHTML =
      '<b>' + ev.tone + '</b><br>' + extra;

    drawPoster(rec, ev);
    showStage('result');
  }

  // ==== Canvas 海报 ====
  function drawPoster(rec, ev){
    var canvas = document.getElementById('ct-poster-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    var n = NORM[rec.age] || NORM['26-35'];

    // 背景：宣纸底色
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#faf5e8');
    bg.addColorStop(1, '#e8d5a8');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 水墨风底纹：随机圆点
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#8b3a3a';
    for (var i = 0; i < 60; i++) {
      var x = Math.random() * W;
      var y = Math.random() * H;
      var r = Math.random() * 40 + 10;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 边框
    ctx.strokeStyle = '#8b3a3a';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, W - 60, H - 60);
    ctx.strokeStyle = '#c8b48a';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    // 顶部印章
    ctx.save();
    ctx.fillStyle = '#8b3a3a';
    ctx.fillRect(W/2 - 60, 90, 120, 120);
    ctx.fillStyle = '#faf5e8';
    ctx.font = 'bold 44px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('专注', W/2, 130);
    ctx.fillText('测试', W/2, 175);
    ctx.restore();

    // 标题
    ctx.fillStyle = '#3d2f1e';
    ctx.font = 'bold 44px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'center';
    ctx.fillText('舒尔特方格 · 专注力体验', W/2, 270);

    // 副标题
    ctx.fillStyle = '#8b3a3a';
    ctx.font = '22px "KaiTi","STKaiti",serif';
    ctx.fillText('—— 萝卜干围棋教育 ——', W/2, 310);

    // 昵称 + tag 行
    ctx.fillStyle = '#6b5b3d';
    ctx.font = '26px "KaiTi","STKaiti",serif';
    ctx.fillText(rec.nick + '  ·  ' + rec.role + '  ·  ' + n.label, W/2, 380);

    // 大字用时
    ctx.fillStyle = '#8b3a3a';
    ctx.font = 'bold 140px "Courier New",monospace';
    ctx.textBaseline = 'alphabetic';
    var timeStr = rec.timeSec.toFixed(2);
    var timeW = ctx.measureText(timeStr).width;
    ctx.fillText(timeStr, W/2 - 40, 570);
    ctx.font = 'bold 42px "KaiTi","STKaiti",serif';
    ctx.fillText('秒', W/2 + timeW/2 + 20, 570);

    // 水平「用时」标签
    ctx.fillStyle = '#a89572';
    ctx.font = '20px "KaiTi","STKaiti",serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('· 用时 ·', W/2, 610);

    // 分割线
    ctx.strokeStyle = '#c8b48a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, 660);
    ctx.lineTo(W - 120, 660);
    ctx.stroke();

    // 对比信息卡片
    ctx.fillStyle = '#6b5b3d';
    ctx.font = '22px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var y = 690;
    ctx.fillText('同龄段参考区间', 110, y);
    ctx.fillStyle = '#3d2f1e';
    ctx.font = 'bold 28px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'right';
    ctx.fillText(n.min + '-' + n.max + ' 秒', W - 110, y - 2);

    y += 50;
    ctx.fillStyle = '#6b5b3d';
    ctx.font = '22px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'left';
    ctx.fillText('围棋教师群体基准', 110, y);
    ctx.fillStyle = '#3d2f1e';
    ctx.font = 'bold 28px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'right';
    ctx.fillText(TEACHER_BASELINE.avg + ' 秒 · N=' + TEACHER_BASELINE.n, W - 110, y - 2);

    y += 50;
    ctx.fillStyle = '#6b5b3d';
    ctx.font = '22px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'left';
    ctx.fillText('你的评级', 110, y);
    ctx.fillStyle = '#8b3a3a';
    ctx.font = 'bold 28px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'right';
    ctx.fillText(ev.level, W - 110, y - 2);

    // 鼓励语（可换行）
    y += 80;
    ctx.fillStyle = '#5b4a30';
    ctx.font = '26px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var msg = ev.tone;
    wrapText(ctx, msg, W/2, y, W - 180, 40);

    // 品牌固定标语（位于底部微信号 & 域名上方一行，深灰印章章尾风格）
    ctx.fillStyle = '#3d2f1e';
    ctx.font = '20px "KaiTi","STKaiti",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('围棋 · 让专注成为一种日常', W/2, H - 230);

    // 底部：微信 & 域名
    ctx.fillStyle = '#8b3a3a';
    ctx.font = 'bold 32px "KaiTi","STKaiti",serif';
    ctx.fillText('加微信  yxwq0909', W/2, H - 180);
    ctx.fillStyle = '#6b5b3d';
    ctx.font = '22px "KaiTi","STKaiti",serif';
    ctx.fillText('领《提升专注力的三种围棋日常训练》', W/2, H - 140);

    ctx.strokeStyle = '#c8b48a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, H - 100);
    ctx.lineTo(W - 180, H - 100);
    ctx.stroke();

    ctx.fillStyle = '#8b3a3a';
    ctx.font = '24px "Courier New",monospace';
    ctx.fillText('www.weiqiluobogan.com', W/2, H - 65);

    // 同步塞给 <img> 元素，供手机端长按保存到相册（微信 X5 内核对 canvas 不支持长按）
    try {
      var posterImg = document.getElementById('ct-poster-img');
      if (posterImg) {
        posterImg.src = canvas.toDataURL('image/png');
        posterImg.style.display = 'block';
      }
    } catch(e) { /* 极端情况：canvas 被污染，静默失败 */ }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    // 简单按中英字符逐字塞入
    var chars = text.split('');
    var line = '';
    var lines = [];
    for (var i = 0; i < chars.length; i++) {
      var test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        lines.push(line);
        line = chars[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.forEach(function(ln, idx){
      ctx.fillText(ln, x, y + idx * lineHeight);
    });
  }

  function downloadPoster(){
    var canvas = document.getElementById('ct-poster-canvas');
    if (!canvas) return;
    var fname = '专注力测试-' + (state.info && state.info.nick || '匿名') + '.png';
    window.__luoboShareImage(canvas, fname);
  }

  // ==== 复制微信号 ====
  function copyWx(){
    var wx = 'yxwq0909';
    var done = function(){
      if (window.showToast) window.showToast('微信号已复制，请去微信搜索添加');
      else alert('微信号已复制：' + wx + '\n请去微信搜索添加');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(wx).then(done, function(){ fallbackCopyText(wx, done); });
    } else {
      fallbackCopyText(wx, done);
    }
  }
  function fallbackCopyText(txt, cb){
    try {
      var i = document.createElement('textarea');
      i.value = txt; i.style.position='fixed'; i.style.left='-9999px';
      document.body.appendChild(i); i.select();
      document.execCommand('copy');
      document.body.removeChild(i);
      cb && cb();
    } catch(e){
      alert('请手动复制微信号：' + txt);
    }
  }

  // ==== 提交样本 ====
  function submitSample(){
    var list = loadHistory();
    if (!list.length) {
      alert('请先完成一次测试');
      return;
    }
    var rec = list[0];
    var n = NORM[rec.age] || NORM['26-35'];
    var subject = encodeURIComponent('专注力测试样本提交');
    var body = encodeURIComponent(
      '昵称：' + rec.nick + '\n' +
      '身份：' + rec.role + '\n' +
      '年龄段：' + n.label + '\n' +
      '用时：' + rec.timeSec.toFixed(2) + ' 秒\n' +
      '微信：' + (rec.wx || '（未填写）') + '\n' +
      '提交时间：' + new Date(rec.ts).toLocaleString() + '\n' +
      '\n（本条来自 www.weiqiluobogan.com 专注力体验测试）'
    );
    var mailto = 'mailto:kzfeedback@coze.email?subject=' + subject + '&body=' + body;
    try {
      window.location.href = mailto;
      setTimeout(function(){
        if (window.showToast) window.showToast('已尝试打开邮件客户端，本次数据也已保存在本地');
        else alert('已尝试打开邮件客户端，本次数据也已保存在本地');
      }, 500);
    } catch(e){
      alert('感谢参与，样本已记录到本地');
    }
  }

  // ==== 事件绑定 ====
  function bindEvents(){
    var btnStart = document.getElementById('ct-btn-start');
    if (btnStart) btnStart.addEventListener('click', beginGame);
    var btnRestart = document.getElementById('ct-btn-restart');
    if (btnRestart) btnRestart.addEventListener('click', function(){
      stopTimer();
      initGrid();
      document.getElementById('ct-timer').textContent = '0.00';
      setTimeout(startTimer, 200);
    });
    var btnCta = document.getElementById('ct-btn-cta');
    if (btnCta) btnCta.addEventListener('click', copyWx);
    var btnDown = document.getElementById('ct-btn-download');
    if (btnDown) btnDown.addEventListener('click', downloadPoster);
    var btnSub = document.getElementById('ct-btn-submit');
    if (btnSub) btnSub.addEventListener('click', submitSample);
    var btnAgain = document.getElementById('ct-btn-again');
    if (btnAgain) btnAgain.addEventListener('click', function(){
      showStage('intro');
      renderHistory();
    });
  }

  // ==== 初始化 ====
  function init(){
    var last = loadLastInfo();
    if (last) {
      var nick = document.getElementById('ct-nick');
      var wx = document.getElementById('ct-wx');
      if (nick && last.nick && last.nick !== '匿名棋友') nick.value = last.nick;
      if (wx && last.wx) wx.value = last.wx;
      if (last.role) setRadio('ct-role', last.role);
      if (last.age) setRadio('ct-age', last.age);
    }
    bindEvents();
    renderHistory();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ===== 留言板反轰炸软防 =====
  (function(){
    var form = document.getElementById('msg-form');
    if(!form) return;
    var loadedAt = Date.now();
    var hasHumanBehavior = false;
    ['mousemove','keydown','touchstart','scroll'].forEach(function(evt){
      window.addEventListener(evt, function(){ hasHumanBehavior = true; }, {once:true, passive:true});
    });
    form.addEventListener('submit', function(ev){
      var elapsed = Date.now() - loadedAt;
      if(elapsed < 3000){
        ev.preventDefault();
        alert('留言太快啦，稍等几秒再点提交～');
        return;
      }
      if(!hasHumanBehavior){
        ev.preventDefault();
        alert('检测到异常行为，请正常浏览页面后再试。');
        return;
      }
      var last = parseInt(localStorage.getItem('_lbg_msg_ts') || '0', 10);
      if(Date.now() - last < 60000){
        ev.preventDefault();
        var wait = Math.ceil((60000 - (Date.now() - last))/1000);
        alert('每分钟只能留言一次，请 ' + wait + ' 秒后再来。');
        return;
      }
      localStorage.setItem('_lbg_msg_ts', String(Date.now()));
    });
  })();

  // ===== 留言板提交处理（替代 FormSubmit 外部依赖） =====
  function handleMsgSubmit(ev) {
    var form = ev.target;
    var name = form.querySelector('[name=name]') ? form.querySelector('[name=name]').value : '';
    var role = form.querySelector('[name=role]') ? form.querySelector('[name=role]').value : '';
    var contact = form.querySelector('[name=contact]') ? form.querySelector('[name=contact]').value : '';
    var message = form.querySelector('[name=message]') ? form.querySelector('[name=message]').value : '';
    var subject = encodeURIComponent('[官网留言] 来自 ' + name + '（' + role + '）');
    var body = encodeURIComponent('称呼：' + name + '\n身份：' + role + '\n联系方式：' + (contact || '未填写') + '\n\n留言内容：\n' + message);
    window.location.href = 'mailto:594271924@qq.com?subject=' + subject + '&body=' + body;
    setTimeout(function(){ form.reset(); }, 500);
    ev.preventDefault();
    return false;
  }

  // ===== 能力测试逻辑 =====
  (function(){
    const QUESTIONS = {"parent":[{"type":"single","d":"认知理性","q":"孩子输棋后崩溃大哭，你的第一反应是：","opts":[["先什么都不说，让他哭完再谈",5],["'输了没关系，下次赢回来'",4],["'咱们回家不下了'",3],["'你看你不专心/太粗心'",2]],"e":"情绪先落地，道理才进得去。这时讲技术只会让他更抗拒围棋。"},{"type":"single","d":"认知理性","q":"老师说孩子'这半年进步慢'，你的第一反应：","opts":[["问老师'具体卡在哪，我怎么配合'",5],["先歇一歇再学",4],["孩子是不是没天赋",3],["老师是不是不用心",2]],"e":"进步慢往往不是能力问题，是学习方式和陪伴方式的问题。把'找人'变成'找方法'。"},{"type":"single","d":"认知理性","q":"有人说'6 岁不学围棋就晚了'，你怎么看：","opts":[["'早'和'晚'看目标，8-10 岁开始也很好",5],["什么年龄学都可以，天赋决定一切",4],["反正也不是啥事，晚点无所谓",3],["焦虑，赶紧报班",2]],"e":"围棋不是抢跑项目。合适的年龄 + 合适的老师，比'越早越好'重要 10 倍。"},{"type":"single","d":"认知理性","q":"孩子学了 3 个月说'我不想学了'，你会：","opts":[["先问'是老师、同学，还是不喜欢下棋'",5],["'等你再大点回来学'",4],["'你必须坚持完这学期'",3],["'那不学就不学'",2]],"e":"不想学的原因，比不想学本身重要。是学棋苦、没朋友，还是老师不合，处理完全不一样。"},{"type":"single","d":"认知理性","q":"孩子在班里下棋进不了前几名，你的反应：","opts":[["找孩子聊聊他自己怎么看这件事",5],["让孩子转个更擅长的兴趣",4],["加大练习量",3],["立刻换个更好的老师",2]],"e":"名次是结果，不是原因。孩子的看法比你的判断更重要。"},{"type":"judge","d":"认知理性","q":"孩子输了要立刻讲清楚为什么输，否则下次还错。","opts":[["正确",2],["错误",5]],"e":"情绪未落地时讲道理 = 火上浇油。让他先消化情绪，冷静了再复盘。"},{"type":"judge","d":"认知理性","q":"孩子在网棋上很厉害，说明水平真的到了。","opts":[["正确",2],["错误",5]],"e":"网棋和现场对局差异很大。要看正式比赛和面对面复盘的表现。"},{"type":"single","d":"期望管理","q":"零基础 6 岁孩子跟一个好老师，多久到业余 1 级合理？","opts":[["1 年到 1 年半",5],["2-3 年",4],["说不好，看天赋",3],["半年内",2]],"e":"正常节奏 1-2 年到业 1，急不来。半年到 1 级的承诺，通常有水分。"},{"type":"single","d":"期望管理","q":"孩子每天下棋多久合适：","opts":[["30 分钟-1 小时高质量对局 + 复盘",5],["有空就下没空就算",4],["只有上课那天下",3],["越多越好",2]],"e":"量要节制，质要保证。连下 3 小时不如 30 分钟专注 + 认真复盘。"},{"type":"single","d":"期望管理","q":"'学到业余 1 段就够了'这句话，你怎么看：","opts":[["看孩子想到哪，是路上的路牌不是终点",5],["完全认同，兴趣就好",4],["到 5 段才叫真的会下棋",3],["不认同，必须冲专业",2]],"e":"段位是路上的路牌，不是目的地。1 段之后接不接着走，让孩子自己选。"},{"type":"single","d":"期望管理","q":"孩子该不该参加比赛：","opts":[["该比就比，但赛前不加练、赛后一定复盘",5],["跟着老师的节奏来",4],["越多越好，练心态",3],["从来不比赛，怕受伤",2]],"e":"比赛是学棋的一部分，但不是全部。赛前突击 = 毁人，赛后复盘 = 金矿。"},{"type":"single","d":"期望管理","q":"孩子学棋一年的费用，你的态度：","opts":[["匹配家庭承受力，别成负担",5],["动态调整，先试后决定",4],["找性价比高的",3],["越贵越好，好老师值",2]],"e":"教育不是烧钱大赛。稳定的家庭情绪，比昂贵的老师更能出成绩。"},{"type":"judge","d":"期望管理","q":"少儿围棋段位越早拿到越好。","opts":[["正确",2],["错误",5]],"e":"早拿的段位往往有水分。扎实的段位才有意义，晚一年拿也没关系。"},{"type":"judge","d":"期望管理","q":"冲段班一定要报，不然孩子升不了段。","opts":[["正确",2],["错误",5]],"e":"冲段班适合已稳定在业余段位的孩子。级位阶段进冲段班，是揠苗助长。"},{"type":"single","d":"陪伴方式","q":"孩子长考 8 分钟一动不动，你的反应：","opts":[["走开一会儿，让他自己算完",5],["心里急但装作没看见继续等",4],["悄悄凑过去看棋盘想帮他判断",3],["'快点想，别磨叽'",2]],"e":"长考不是磨叽，是他在长脑子。你走开一会儿，就是给他脑子腾出空间。"},{"type":"single","d":"陪伴方式","q":"孩子在家打谱时，你在旁边应该做什么：","opts":[["做点自己的事，别刻意盯着",5],["陪他一起看，不发言",4],["顺便出题考他",3],["玩你的手机",2]],"e":"陪但不盯，让他享受独处的思考。你在，就是安全感。"},{"type":"single","d":"陪伴方式","q":"你会自己也学一点围棋吗：","opts":[["会一点基本规则和术语，能和他聊两句",5],["想学但没时间",4],["不会，专业事交给老师",3],["会，为了监督他有没有偷懒",2]],"e":"不用高段，会基本规则 + 懂点术语就够。父母能'听懂他在说啥'，陪伴质量翻倍。"},{"type":"single","d":"陪伴方式","q":"孩子输棋回家的路上，你和他聊什么：","opts":[["不聊棋，聊别的：吃啥、动画片、学校事",5],["'下次好好准备'",4],["'为什么下错这步'",3],["'下次爸爸/妈妈带你练'",2]],"e":"情绪未落地时讨论技术 = 火上浇油。等他冷静了，第二天再复盘。"},{"type":"single","d":"陪伴方式","q":"孩子和你一起复盘一盘棋，你的角色应该是：","opts":[["提问者，问他每一步在想什么",5],["观众，认真听他讲",4],["记录员，帮他把过程写下来",3],["老师，指出他哪里错了",2]],"e":"复盘不是纠错，是重现他的思考路径。多问 '你当时想的啥'，少说 '你错了'。"},{"type":"judge","d":"陪伴方式","q":"孩子做棋题时家长应该在旁边监督不许分心。","opts":[["正确",2],["错误",5]],"e":"监督式陪伴让孩子把学棋当苦差事。你只需要提供安静环境，剩下让他自己。"},{"type":"judge","d":"陪伴方式","q":"孩子下网棋时家长最好不看，让他自己下。","opts":[["正确",5],["错误",2]],"e":"网棋是他自己的战场。家长在旁围观会破坏他的节奏和判断。"},{"type":"single","d":"教育视野","q":"让孩子学围棋，你最看重什么：","opts":[["培养一辈子受用的思维方式和心态",5],["开发智力",4],["有个爱好，别人家都学",3],["升学加分",2]],"e":"围棋是长线教育投资，不是短期功利工具。抱着'加分'去学的家庭，孩子一升不了就走。"},{"type":"single","d":"教育视野","q":"学围棋和学国际象棋/中国象棋冲突吗：","opts":[["建议专攻围棋一门到某个阶段再考虑",5],["都学，但初期分开时段，小心串味",4],["都学，多多益善",3],["冲突，一辈子只能选一个",2]],"e":"棋类思维差异大，初期同学最容易乱套。学稳一门再拓展，是稳妥打法。"},{"type":"single","d":"教育视野","q":"什么时候可以放手让孩子自主发展棋艺：","opts":[["到 1 段以上，家长开始退居幕后",5],["到业 1 就该放手",4],["老师说放就放",3],["一辈子都得盯着",2]],"e":"陪伴是有节奏的。1 段是分水岭，之后你的角色从'教练'变成'队友'。"},{"type":"single","d":"教育视野","q":"如果孩子未来想走职业围棋，你的第一反应：","opts":[["严格评估他的天赋、意志和家庭承受力",5],["让他先冲到某个段位再说",4],["全力支持，请最好的老师",3],["直接拒绝，太苦",2]],"e":"职业不是随口说的路。评估要冷静，别被孩子一时热情或自己虚荣心带偏。"},{"type":"single","d":"教育视野","q":"围棋这个爱好和学习成绩，你怎么排优先级：","opts":[["二者不冲突，都是长期投入",5],["视孩子表现动态调整",4],["围棋优先，学习让路",3],["学习永远第一，围棋随时可停",2]],"e":"围棋和学习不是零和游戏。真正学好围棋的孩子，往往学习也不差。"},{"type":"judge","d":"教育视野","q":"把围棋当作培养专注力的工具，是本末倒置。","opts":[["正确",5],["错误",2]],"e":"围棋值得因为它本身，不是因为它'有用'。把它当工具，孩子会感到被利用。"},{"type":"judge","d":"教育视野","q":"孩子学围棋是为了以后能拿国家段位证书。","opts":[["正确",2],["错误",5]],"e":"证书是副产品，不是目的。以证书为目标，孩子拿到就不想下了。"},{"type":"essay","d":"教育视野","q":"你觉得围棋能带给孩子最重要的一样东西是什么？为什么？","ref":["面对失败和不确定的能力：一盘棋输了不代表一辈子输了","独立思考的习惯：每一步都是自己选的，输赢自己扛","平静的心态：赢不炸、输不散","长线思维：不看一手，看全局；不看一盘，看一年"],"e":"围棋教给孩子的不是'怎么赢'，而是'怎么面对不能全赢的人生'。"},{"type":"essay","d":"教育视野","q":"假如未来 AI 完全能预测棋局胜负，你还愿意让孩子学围棋吗？为什么？","ref":["AI 时代围棋的价值转向'人对人'的沟通和修炼，不再依赖胜负判定","下棋的过程价值 > 结果价值：那 2 小时的专注和思考本身就有意义","围棋是一种审美和文化传承，AI 替代不了'和人对坐'的体验","真正学得深的东西，从来不是靠'能不能算过 AI'来定义价值"],"e":"这道题在测你把围棋看作'技术'还是'教育'。AI 时代能留下的，只有教育。"}],"teacher":[{"type":"single","d":"教学能力","q":"你讲完一个知识点，怎么判断孩子是真听懂了？","opts":[["他能在 3 手内的相似局面里下对",5],["他能自己重新讲一遍给你听",4],["他能做对课后作业",3],["他点头说'懂了'",2]],"e":"孩子说'懂了'的时候，才是最不懂的时候。真懂是能用出来。"},{"type":"single","d":"教学能力","q":"一节课的开场，怎么做最能让孩子快速进入状态：","opts":[["用一道 30 秒能想清楚的小题热身",5],["复盘上节课的作业",4],["让孩子安静坐好再开始",3],["直接讲今天的知识点",2]],"e":"开场 5 分钟决定这节课效率。热身题激活思考惯性，比'快坐好'管用 10 倍。"},{"type":"single","d":"教学能力","q":"孩子做错题时，你的第一反应：","opts":[["反问一句，让他自己发现错在哪",5],["'再想想'",4],["换一道更简单的做",3],["直接告诉他正确答案",2]],"e":"错题是最好的教学素材。你把答案告诉他，就抢走了他的成长机会。"},{"type":"single","d":"教学能力","q":"每次课后，你会花多少时间备下节课：","opts":[["至少 30 分钟，针对这节课孩子的反应做调整",5],["10 分钟看下要点",4],["每个班备一次通用课件",3],["不需要，教案都在脑子里",2]],"e":"好课都是备出来的，尤其是针对每个孩子的调整。通用课件教出通用学生。"},{"type":"single","d":"教学能力","q":"一节 60 分钟的幼儿课，你会怎么设计结构：","opts":[["短热身 + 讲解 + 游戏化练习 + 小结",5],["前一半讲后一半练",4],["让孩子自由下棋，你在旁辅导",3],["全程 60 分钟一对一讲棋",2]],"e":"幼儿注意力周期 10-15 分钟。结构分段 + 游戏化，比 '压得住' 更重要。"},{"type":"judge","d":"教学能力","q":"同一个知识点，一节课讲不透就下节课继续，不用赶进度。","opts":[["正确",5],["错误",2]],"e":"进度是给自己看的，孩子的接受度才是真进度。赶完了没记住，等于没讲。"},{"type":"judge","d":"教学能力","q":"教材应该完全按段位循序渐进，不能跳。","opts":[["正确",2],["错误",5]],"e":"好老师根据孩子的兴趣切入点选题，可以先教吸引人的内容再回补基础。"},{"type":"single","d":"家长沟通","q":"家长问'我孩子学 3 个月还输给同班小朋友，是不是没天赋'，你回：","opts":[["'我周末给你发一份他这 3 个月的成长复盘，咱们看事实，天赋这词太大'",5],["'每个孩子进度不一样'",4],["'别急，慢慢来'",3],["'他专注力还不够'",2]],"e":"家长要事实和方向，不是安慰。你给出数据和判断，他就信你。"},{"type":"single","d":"家长沟通","q":"家长在群里晒孩子刚拿的少儿冠军奖状：","opts":[["群里祝贺 + 私聊给具体建议",5],["群里祝贺",4],["让全班孩子鼓掌",3],["装没看见",2]],"e":"公开庆祝 + 私下泼冷水，既照顾赢家心态，又不让其他家长焦虑。"},{"type":"single","d":"家长沟通","q":"该续费时家长说'再想想'，你的应对：","opts":[["'我给你发一份他这三个月的成长报告，你先看再决定'",5],["'你先在别处看看再决定'",4],["追问犹豫的具体原因",3],["打折促销挽留",2]],"e":"不是留住家长，是让家长看见价值。价值到位了，续费是水到渠成。"},{"type":"single","d":"家长沟通","q":"家长要求'教得快一点，别的机构一年就到 1 段'：","opts":[["'急上去容易垮，我们目标是稳到 1 段能自己继续走'",5],["'咱们的孩子基础还没牢，需要时间'",4],["让家长转班",3],["按对方要求加快节奏",2]],"e":"赢家长的信任要靠敢说不。跟风加速的老师，短期留客，长期毁人。"},{"type":"single","d":"家长沟通","q":"接手一个转介绍新学员，第一次和家长沟通的重点：","opts":[["了解孩子性格、之前学棋经历、家长真实目标",5],["试听一次让家长自己判断",4],["讲清课程价格和课时安排",3],["展示自己的段位和资质",2]],"e":"家长要的不是'你多厉害'，是'你懂不懂我孩子'。第一次沟通不谈自己，谈孩子。"},{"type":"judge","d":"家长沟通","q":"家长质疑你的教学方法，最好的应对是马上调整。","opts":[["正确",2],["错误",5]],"e":"质疑先听清楚，判断有没有道理再决定改不改。盲从家长 = 没主见。"},{"type":"judge","d":"家长沟通","q":"孩子每次课的小问题都应该及时告诉家长，让家长配合。","opts":[["正确",3],["错误",5]],"e":"小问题老师自己消化，大问题及时沟通。事无巨细上报，家长会焦虑。"},{"type":"single","d":"职业理念","q":"一个孩子明显没围棋天赋，你会：","opts":[["找到围棋对他的独特价值（例如培养耐心），继续教",5],["委婉建议家长看看别的兴趣",4],["让他自己走",3],["该教教、该收钱收钱，不多话",2]],"e":"没天赋不代表围棋对他没价值。心性、专注力、抗挫力，围棋都能给。"},{"type":"single","d":"职业理念","q":"遇到胜负心过重、输棋就摔子的孩子：","opts":[["单独聊，让他知道你也输过更多棋",5],["先冷处理，等他自己冷静",4],["让家长带回去教育",3],["当场严厉批评",2]],"e":"孩子的胜负心是老师的必修课，不是家长的责任。你怎么处理，他一辈子记得。"},{"type":"single","d":"职业理念","q":"你怎么看'围棋能开发智力'这句话：","opts":[["是次要价值，不该作为主打",5],["智力是天生的，围棋只是训练场",4],["是营销话术，尽量少用",3],["完全对，就是我们的核心卖点",2]],"e":"围棋的价值远大于'开发智力'。把它当唯一卖点，反而低估了这门学问。"},{"type":"single","d":"职业理念","q":"你带过的学生，10 年后你希望他们是：","opts":[["有人还在下，有人不下了，但都记得从棋里学到的东西",5],["都能拿到某个段位",4],["说不好，那时的事",3],["大部分成为职业棋手",2]],"e":"好老师的成品是'人'，不是'段位'。段位会掉，人格底子会跟他一辈子。"},{"type":"single","d":"职业理念","q":"学生大部分离开你转到大机构时，你的心态：","opts":[["平静接受，重要的是他继续下棋",5],["反思自己哪里做得不够",4],["调整策略防止再流失",3],["生气，觉得白教了",2]],"e":"教育不是所有权游戏。孩子在别的地方继续成长，是你教的成功不是失败。"},{"type":"judge","d":"职业理念","q":"教学中'因材施教'比'统一进度'重要。","opts":[["正确",5],["错误",2]],"e":"孩子不是标准化原料。因材施教是好老师的底线。"},{"type":"judge","d":"职业理念","q":"围棋老师主要靠段位吃饭，段位越高越值钱。","opts":[["正确",2],["错误",5]],"e":"会下不等于会教。段位是入场券，教学是核心竞争力。"},{"type":"single","d":"儿童心理","q":"5 岁幼儿在课堂上突然哭闹不肯下棋，你会：","opts":[["蹲下来问他是累了、饿了还是委屈了",5],["换个游戏转移注意力",4],["让家长把孩子接走休息",3],["严肃说'上课不许哭'",2]],"e":"幼儿哭闹背后往往是生理或情绪信号，不是纪律问题。蹲下来看见他，是第一步。"},{"type":"single","d":"儿童心理","q":"6 岁孩子对局中动手打了赢他的小朋友：","opts":[["立刻分开，冷静 5 分钟后一起谈：'可以生气，但不能打人'",5],["立刻分开，各自送回家长处",4],["严厉批评动手的孩子",3],["让两个孩子自己解决",2]],"e":"情绪管理是围棋教学的一部分。教他把火气'下'到棋盘上，是最有价值的一课。"},{"type":"single","d":"儿童心理","q":"转介绍来的家长第一次上课，你会：","opts":[["花 10 分钟先了解孩子的性格和上一位老师的教法",5],["让家长在旁听，看着教",4],["按平时的流程正常上",3],["表现得特别热情",2]],"e":"转介绍来的家长期待更高，第一课要'看见孩子'，不是表演。"},{"type":"single","d":"儿童心理","q":"孩子明明能下对一步棋，但下课时说'我不会'：","opts":[["判断他是心情不好还是真忘了，分开处理",5],["让他再演示一遍",4],["加强这个知识点的练习",3],["相信他说的，从头教",2]],"e":"孩子说'不会'，可能是真忘了、可能是不想面对、也可能是想要关注。看清楚再动。"},{"type":"single","d":"儿童心理","q":"8 岁孩子和家长在课后争吵不肯回家，你会：","opts":[["蹲下来听两边说，帮他们缓和情绪",5],["请家长在办公室聊",4],["让家长带走别耽误其他事",3],["装没看见继续做其他工作",2]],"e":"你在孩子和家长之间是'第三方'，是最好的缓冲。这时不出手，就是失职。"},{"type":"judge","d":"儿童心理","q":"孩子在课堂上分心，是纪律问题需要管教。","opts":[["正确",2],["错误",5]],"e":"分心多半是内容枯燥或状态问题，先找原因再处理。上来就管教 = 错位。"},{"type":"judge","d":"儿童心理","q":"对幼儿最好用奖励糖果的方式鼓励认真下棋。","opts":[["正确",2],["错误",5]],"e":"外部奖励最终会破坏内在动机。用兴趣本身带他，不用糖果和贴纸。"},{"type":"essay","d":"职业理念","q":"作为围棋老师，你希望教给孩子的第一件事是什么？","ref":["棋礼：尊重对手，落子无悔","面对失败的态度：一盘棋输了不代表你输了","独立思考的勇气：每一手都是自己的选择","下棋和做人一样：不投机、不悔、不装"],"e":"这个问题在测你把学生当'棋手'还是'人'来教。答案里能看出你 10 年后的教学高度。"},{"type":"essay","d":"职业理念","q":"如果一个学生 10 年后回来找你，说'老师你当年教我的那句话让我一辈子受用'，那句话最可能是什么？","ref":["'输一盘棋不代表输给这盘棋'","'每一手都是你自己选的，输赢你自己扛'","'不神化胜负，那只是一场对话'","'下棋和做人一样，长远比一时重要'","主人自己的教育金句"],"e":"能被学生记 10 年的一句话，一定不是关于技术的。是关于人的。"}]};

    const LEVELS = {
      parent: [
        { min: 136, name: '走进围棋的家长', color: '#a8362a', tag: '顶级' },
        { min: 120, name: '教育型家长',     color: '#c94a3a', tag: '优秀' },
        { min: 101, name: '清醒家长',       color: '#8a5a3a', tag: '良好' },
        { min: 85,  name: '用心家长',       color: '#9a8560', tag: '入门' },
        { min: 0,   name: '起步家长',       color: '#6b6b6b', tag: '起步' }
      ],
      teacher: [
        { min: 136, name: '老师中的老师',     color: '#a8362a', tag: '顶级' },
        { min: 120, name: '家长口中的好老师', color: '#c94a3a', tag: '优秀' },
        { min: 101, name: '匠人教师',         color: '#8a5a3a', tag: '良好' },
        { min: 85,  name: '合格教师',         color: '#9a8560', tag: '入门' },
        { min: 0,   name: '新手教师',         color: '#6b6b6b', tag: '起步' }
      ]
    };

    const INTROS = {
      parent: {
        title: '家长版 · 教育认知度测评',
        desc: '这套题面向孩子在学围棋、正在学、或者考虑让孩子学的家长。它不测围棋水平，测的是你作为家长的<span class="hl">教育理念、期望管理、陪伴方式、教育视野</span>四个维度。'
      },
      teacher: {
        title: '教师版 · 教学能力自评',
        desc: '这套题面向围棋教师、机构老师、少儿围棋教练。它不测你的棋力（那是另一件事），测的是<span class="hl">教学能力、家长沟通、职业理念、儿童心理</span>四个维度的综合状态。'
      }
    };

    const TYPE_LABEL = { single: '单选', judge: '判断', essay: '简答' };

    let state = { role: 'parent', idx: 0, answers: [], dimScore: {}, dimMax: {} };

    function computeDimMax(role){
      const dm = {};
      QUESTIONS[role].forEach(q => {
        const m = q.type === 'essay' ? 5 : Math.max.apply(null, q.opts.map(o => o[1]));
        dm[q.d] = (dm[q.d]||0) + m;
      });
      return dm;
    }

    // ===== Tab 切换 =====
    document.querySelectorAll('.test-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.test-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.role = btn.dataset.role;
        document.getElementById('intro-title').textContent = INTROS[state.role].title;
        document.getElementById('intro-desc').innerHTML = INTROS[state.role].desc;
      });
    });

    // ===== 开始测评 =====
    document.getElementById('btn-start').addEventListener('click', () => {
      state.idx = 0;
      state.answers = [];
      state.dimMax = computeDimMax(state.role);
      state.dimScore = {};
      Object.keys(state.dimMax).forEach(k => state.dimScore[k] = 0);
      document.getElementById('test-intro').style.display = 'none';
      document.getElementById('test-selector').style.display = 'none';
      document.getElementById('test-quiz').style.display = 'block';
      renderQuestion();
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });

    // ===== 渲染题目 =====
    function renderQuestion(){
      const q = QUESTIONS[state.role][state.idx];
      document.getElementById('q-idx').textContent = state.idx + 1;
      document.getElementById('q-dim').textContent = q.d;
      document.getElementById('q-type').textContent = TYPE_LABEL[q.type];
      document.getElementById('q-text').textContent = q.q;
      document.getElementById('progress-fill').style.width = ((state.idx + 1) / 30 * 100) + '%';
      document.getElementById('q-feedback').style.display = 'none';
      document.getElementById('q-opts').style.display = 'none';
      document.getElementById('q-essay').style.display = 'none';

      if (q.type === 'single' || q.type === 'judge') {
        const box = document.getElementById('q-opts');
        box.style.display = 'block';
        box.innerHTML = '';
        q.opts.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'opt-btn';
          btn.textContent = opt[0];
          btn.addEventListener('click', () => {
            Array.from(box.children).forEach(b => { b.disabled = true; b.classList.remove('selected'); });
            btn.classList.add('selected');
            recordScore(opt[1], q);
          });
          box.appendChild(btn);
        });
      } else {
        const box = document.getElementById('q-essay');
        box.style.display = 'block';
        document.getElementById('essay-ref').style.display = 'none';
        document.getElementById('essay-self-eval').style.display = 'none';
        document.getElementById('btn-show-ref').style.display = 'inline-block';
        document.getElementById('btn-show-ref').disabled = false;
        const list = document.getElementById('essay-ref-list');
        list.innerHTML = '';
        q.ref.forEach(r => {
          const li = document.createElement('li');
          li.textContent = '· ' + r;
          list.appendChild(li);
        });
        Array.from(document.querySelectorAll('.essay-btn')).forEach(b => {
          b.disabled = false;
          b.onclick = () => {
            Array.from(document.querySelectorAll('.essay-btn')).forEach(x => x.disabled = true);
            b.style.borderColor = 'var(--seal)';
            b.style.background = '#f7e6df';
            recordScore(parseInt(b.dataset.score, 10), q);
          };
        });
      }
    }

    // 简答显示参考答案
    document.getElementById('btn-show-ref').addEventListener('click', function(){
      document.getElementById('essay-ref').style.display = 'block';
      document.getElementById('essay-self-eval').style.display = 'block';
      this.disabled = true;
      this.style.display = 'none';
    });

    // ===== 记录分数 =====
    function recordScore(score, q){
      state.answers.push({ score: score, dim: q.d });
      state.dimScore[q.d] += score;
      document.getElementById('fb-score').textContent = '+' + score + ' 分';
      document.getElementById('fb-explain').textContent = q.e;
      document.getElementById('q-feedback').style.display = 'block';
    }

    // ===== 下一题 =====
    document.getElementById('btn-next').addEventListener('click', () => {
      state.idx++;
      if (state.idx >= 30) {
        showResult();
      } else {
        renderQuestion();
      }
    });

    // ===== 展示结果 =====
    function showResult(){
      document.getElementById('test-quiz').style.display = 'none';
      document.getElementById('test-result').style.display = 'block';
      const total = state.answers.reduce((s, a) => s + a.score, 0);
      const level = LEVELS[state.role].find(l => total >= l.min);
      document.getElementById('res-score').textContent = total;
      document.getElementById('res-level').textContent = level.name;
      document.getElementById('res-comment').textContent = genComment(total, level, state.role, state.dimScore, state.dimMax);
      document.getElementById('radar-wrap').innerHTML = renderRadar(state.dimScore, state.dimMax, level.color);
      document.getElementById('certificate-wrap').innerHTML = renderCert(total, level, state.role, state.dimScore, state.dimMax);
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    }

    // ===== 雷达图 =====
    function renderRadar(scores, maxes, color){
      const dims = Object.keys(scores);
      const size = 260, cx = 130, cy = 130, r = 85;
      const angleStep = 2 * Math.PI / dims.length;
      const start = -Math.PI / 2;
      let bg = '', axis = '', dataPts = [], labels = '';
      [0.25, 0.5, 0.75, 1].forEach(t => {
        const pts = dims.map((_, i) => {
          const a = start + i * angleStep;
          return (cx + Math.cos(a) * r * t).toFixed(1) + ',' + (cy + Math.sin(a) * r * t).toFixed(1);
        }).join(' ');
        bg += '<polygon points="' + pts + '" fill="none" stroke="#ddd" stroke-width="0.5"/>';
      });
      dims.forEach((_, i) => {
        const a = start + i * angleStep;
        axis += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + Math.cos(a) * r).toFixed(1) + '" y2="' + (cy + Math.sin(a) * r).toFixed(1) + '" stroke="#ddd" stroke-width="0.5"/>';
      });
      dims.forEach((d, i) => {
        const t = scores[d] / maxes[d];
        const a = start + i * angleStep;
        dataPts.push((cx + Math.cos(a) * r * t).toFixed(1) + ',' + (cy + Math.sin(a) * r * t).toFixed(1));
      });
      dims.forEach((d, i) => {
        const a = start + i * angleStep;
        const lx = cx + Math.cos(a) * (r + 22);
        const ly = cy + Math.sin(a) * (r + 22);
        let anchor = 'middle';
        if (Math.cos(a) > 0.2) anchor = 'start';
        else if (Math.cos(a) < -0.2) anchor = 'end';
        labels += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="11" fill="#333">' + d + '</text>';
        labels += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 13).toFixed(1) + '" text-anchor="' + anchor + '" dominant-baseline="middle" font-size="10" fill="' + color + '" font-weight="bold">' + scores[d] + '/' + maxes[d] + '</text>';
      });
      return '<svg viewBox="0 0 260 260">' + bg + axis + '<polygon points="' + dataPts.join(' ') + '" fill="' + color + '" fill-opacity="0.22" stroke="' + color + '" stroke-width="1.5"/>' + labels + '</svg>';
    }

    // ===== 证书 =====
    function renderCert(total, level, role, scores, maxes){
      const W = 750, H = 1000;
      const roleLabel = role === 'parent' ? '围棋家长认证' : '围棋教师认证';
      const roleLabelEn = role === 'parent' ? 'PARENT CERTIFICATE' : 'TEACHER CERTIFICATE';
      const d = new Date();
      const dateStr = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
      const serial = 'LBG-' + (role === 'parent' ? 'P' : 'T') + '-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      const dims = Object.keys(scores);
      let barSvg = '';
      const barY0 = 600, barGap = 50;
      dims.forEach((d, i) => {
        const y = barY0 + i * barGap;
        const pct = scores[d] / maxes[d];
        barSvg += '<text x="180" y="' + y + '" font-size="18" fill="#1a1a1a" font-family="serif">' + d + '</text>';
        barSvg += '<text x="570" y="' + y + '" text-anchor="end" font-size="15" fill="#666" font-family="serif">' + scores[d] + ' / ' + maxes[d] + '</text>';
        barSvg += '<rect x="180" y="' + (y + 8) + '" width="390" height="6" fill="#eee" rx="3"/>';
        barSvg += '<rect x="180" y="' + (y + 8) + '" width="' + (390 * pct).toFixed(1) + '" height="6" fill="' + level.color + '" rx="3"/>';
      });

      // ===== 装饰性花纹（顶部竹叶 / 底部云纹） =====
      const topOrnament =
        '<g opacity="0.55">' +
        '<path d="M 90,90 Q 130,60 175,90 M 130,75 L 130,105" stroke="#a8362a" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '<path d="M 660,90 Q 620,60 575,90 M 620,75 L 620,105" stroke="#a8362a" stroke-width="1" fill="none" stroke-linecap="round"/>' +
        '</g>';
      const cornerOrnaments =
        '<g stroke="#a8362a" stroke-width="1" fill="none" opacity="0.7">' +
        // 左上
        '<path d="M 70,90 L 70,70 L 90,70"/><circle cx="70" cy="70" r="3" fill="#a8362a"/>' +
        // 右上
        '<path d="M 680,90 L 680,70 L 660,70"/><circle cx="680" cy="70" r="3" fill="#a8362a"/>' +
        // 左下
        '<path d="M 70,910 L 70,930 L 90,930"/><circle cx="70" cy="930" r="3" fill="#a8362a"/>' +
        // 右下
        '<path d="M 680,910 L 680,930 L 660,930"/><circle cx="680" cy="930" r="3" fill="#a8362a"/>' +
        '</g>';

      // 底纹水印："棋"字大字置于中央淡淡叠加
      const watermark =
        '<text x="375" y="560" text-anchor="middle" font-family="serif" font-size="360" fill="#a8362a" opacity="0.03" font-weight="bold">棋</text>';

      // ===== 印章（大 / 印泥感 / 环形文字 / 压在日期上）=====
      // 位置：签发日期 (570, 908)，印章中心放在 (555, 895) 略偏左盖住日期
      const stampR = 62;
      const stamp =
        '<defs>' +
          // 环形文字路径（顶部起，顺时针一圈）
          '<path id="stamp-path" d="M 0,-48 A 48,48 0 1,1 -0.01,-48" fill="none"/>' +
          // 印泥不均匀纹理
          '<filter id="ink-tex" x="-20%" y="-20%" width="140%" height="140%">' +
            '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="noise"/>' +
            '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.1" result="alpha"/>' +
            '<feComposite in="SourceGraphic" in2="alpha" operator="in"/>' +
          '</filter>' +
        '</defs>' +
        '<g transform="translate(555, 895) rotate(-6)" opacity="0.88">' +
          // 主印色圆（带纹理滤镜制造印泥感）
          '<circle cx="0" cy="0" r="' + stampR + '" fill="#c02818" filter="url(#ink-tex)"/>' +
          // 副印色叠层（增加深浅层次）
          '<circle cx="-3" cy="2" r="' + (stampR - 2) + '" fill="#a01810" opacity="0.35" filter="url(#ink-tex)"/>' +
          // 外圈白边（模拟印章边缘留白）
          '<circle cx="0" cy="0" r="' + (stampR - 4) + '" fill="none" stroke="#f8f5ef" stroke-width="2.5"/>' +
          // 内环细线
          '<circle cx="0" cy="0" r="' + (stampR - 22) + '" fill="none" stroke="#f8f5ef" stroke-width="0.8"/>' +
          // 环形文字：萝卜干聊围棋教育（8字均匀分布）
          '<text fill="#f8f5ef" font-size="12.5" font-family="\'Noto Serif SC\', serif" font-weight="900" letter-spacing="18">' +
            '<textPath href="#stamp-path" startOffset="6.25%">萝卜干聊围棋教育</textPath>' +
          '</text>' +
          // 中心五角星（传统印章元素）
          '<path d="M 0,-15 L 4.4,-4.6 15.5,-4.6 6.6,2 10,12.6 0,6 -10,12.6 -6.6,2 -15.5,-4.6 -4.4,-4.6 Z" fill="#f8f5ef"/>' +
          // 中心横杠装饰
          '<line x1="-22" y1="20" x2="22" y2="20" stroke="#f8f5ef" stroke-width="1"/>' +
        '</g>';

      return '<svg viewBox="0 0 750 1000" xmlns="http://www.w3.org/2000/svg" id="cert-svg" width="600">' +
        // 底色
        '<rect width="750" height="1000" fill="#f8f5ef"/>' +
        // 水印
        watermark +
        // 外双框（外粗内细）
        '<rect x="35" y="35" width="680" height="930" fill="none" stroke="#1a1a1a" stroke-width="2.5"/>' +
        '<rect x="48" y="48" width="654" height="904" fill="none" stroke="#a8362a" stroke-width="0.6"/>' +
        // 内层细虚线装饰框
        '<rect x="62" y="62" width="626" height="876" fill="none" stroke="#a8362a" stroke-width="0.4" stroke-dasharray="2,4" opacity="0.6"/>' +
        // 顶部两侧竹叶装饰
        topOrnament +
        // 四角装饰
        cornerOrnaments +
        // 主标题
        '<text x="375" y="165" text-anchor="middle" font-family="\'Noto Serif SC\', serif" font-size="44" fill="#1a1a1a" font-weight="900" letter-spacing="6">' + roleLabel + '</text>' +
        '<text x="375" y="197" text-anchor="middle" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="6">' + roleLabelEn + '</text>' +
        // 标题下装饰分隔（三段线 + 中心菱形）
        '<line x1="250" y1="220" x2="345" y2="220" stroke="#a8362a" stroke-width="0.8"/>' +
        '<line x1="405" y1="220" x2="500" y2="220" stroke="#a8362a" stroke-width="0.8"/>' +
        '<path d="M 375,213 L 383,220 L 375,227 L 367,220 Z" fill="#a8362a"/>' +
        // 段位名（主秀区）
        '<text x="375" y="335" text-anchor="middle" font-family="\'Noto Serif SC\', serif" font-size="76" font-weight="900" fill="' + level.color + '" letter-spacing="4">' + level.name + '</text>' +
        // 段位英文小注
        '<text x="375" y="410" text-anchor="middle" font-size="14" fill="#8a7a5c" letter-spacing="10">— 段 位 认 证 —</text>' +
        // 分数
        '<text x="375" y="495" text-anchor="middle" font-family="serif" font-size="32" fill="#1a1a1a">总得分  <tspan font-weight="bold" fill="' + level.color + '">' + total + '</tspan>  /  150</text>' +
        // 四维度评价标题
        '<text x="375" y="562" text-anchor="middle" font-size="13" fill="#8a7a5c" letter-spacing="6">四 维 度 评 价</text>' +
        '<line x1="290" y1="575" x2="460" y2="575" stroke="#a8362a" stroke-width="0.4" opacity="0.5"/>' +
        // 四维度进度条
        barSvg +
        // 底部横向装饰分割
        '<line x1="100" y1="838" x2="650" y2="838" stroke="#a8362a" stroke-width="0.4" opacity="0.5"/>' +
        '<circle cx="375" cy="838" r="2.5" fill="#a8362a"/>' +
        // 左侧：签发人
        '<text x="180" y="880" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="2">签发人</text>' +
        '<text x="180" y="912" font-family="\'Noto Serif SC\', serif" font-size="24" font-weight="900" fill="#1a1a1a">萝卜干</text>' +
        '<text x="180" y="932" font-size="11" fill="#666">围棋教育从业者 · 多年教龄</text>' +
        // 右侧：签发日期（印章会盖在此处）
        '<text x="570" y="880" text-anchor="end" font-family="serif" font-size="13" fill="#8a7a5c" letter-spacing="2">签发日期</text>' +
        '<text x="570" y="912" text-anchor="end" font-family="\'Noto Serif SC\', serif" font-size="24" font-weight="900" fill="#1a1a1a">' + dateStr + '</text>' +
        '<text x="570" y="932" text-anchor="end" font-size="11" fill="#666">' + serial + '</text>' +
        // 印章（盖在日期上）
        stamp +
        // 免责小字
        '<text x="375" y="978" text-anchor="middle" font-size="9" fill="#999">本证书为教育认知度评估结果 · 不代表围棋段位鉴定 · weiqiluobogan.com · 微信 yxwq0909</text>' +
        '</svg>';
    }

    // ===== 个性化点评 =====
    function genComment(total, level, role, scores, maxes){
      const dims = Object.keys(scores);
      const pcts = dims.map(d => ({ d: d, pct: scores[d] / maxes[d] }));
      pcts.sort((a, b) => b.pct - a.pct);
      const best = pcts[0].d;
      const worst = pcts[pcts.length - 1].d;
      const bank = {
        parent: {
          '走进围棋的家长': '你在四个维度都到了很高水平，特别是【' + best + '】——已经不只是"支持孩子学围棋"，而是真正走进了围棋教育本身。像你这样思考的家长非常少见。如果说还能再往上走，是【' + worst + '】方向，教育是长期工程，视野可以持续拓宽。',
          '教育型家长': '你已经超越了大部分家长的段位，特别是【' + best + '】显示出你有系统的教育视角。可以再往【' + worst + '】方向精进 —— 你会发现围棋家长这条路很值得深入走。',
          '清醒家长': '你对孩子学棋这件事有自己的判断，不容易被"考级焦虑"带跑。【' + best + '】是你的底子，【' + worst + '】是下一个成长空间。继续保持这份清醒，会走得很远。',
          '用心家长': '你已经比普通家长走前面了，愿意主动学习、愿意反思。【' + best + '】是你已经想清楚的，【' + worst + '】还有空间。多陪伴、多观察，不用急。',
          '起步家长': '刚起步很正常，围棋家长这条路的确需要慢慢来。你现在【' + best + '】稍好一些，【' + worst + '】可以先从这里补起。别被别的家长的"高标准动作"吓到，扎实走就够了。'
        },
        teacher: {
          '老师中的老师': '你在四个维度都达到了很高水平，特别是【' + best + '】——这已经不是"教围棋"的水平，是"教教育"的水平。【' + worst + '】相对稍弱，但整体也在高段位。你身上有那种老前辈才有的分寸感。',
          '家长口中的好老师': '你不仅会教棋，还懂家长、懂孩子、懂教育的边界。【' + best + '】是你的招牌，【' + worst + '】是你可以再打磨的方向。你现在的段位已经能让家长主动推荐你。',
          '匠人教师': '扎实、认真、有自己的一套。【' + best + '】做得很好，【' + worst + '】可以再精进 —— 匠人到名师的距离，通常就差这一层。',
          '合格教师': '基本功过关，能独立带课。【' + best + '】是你的相对优势，【' + worst + '】需要继续打磨。围棋教师这条路，你走上来了，接下来看你愿不愿意多深入一步。',
          '新手教师': '你是新入行，这个阶段最重要的是"不着急定型"。【' + best + '】的意识不错，【' + worst + '】需要多补课 —— 建议多看看老教师怎么处理家长、怎么处理不同性格孩子。'
        }
      };
      return bank[role][level.name];
    }

    // ===== 下载证书 =====
    document.getElementById('btn-download').addEventListener('click', function(){
      const svg = document.getElementById('cert-svg');
      if (!svg) return;
      const str = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const cvs = document.createElement('canvas');
        cvs.width = 750 * scale;
        cvs.height = 1000 * scale;
        const ctx = cvs.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const lvName = document.getElementById('res-level').textContent;
        window.__luoboShareImage(cvs, '萝卜干围棋认证-' + lvName + '.png');
      };
      img.onerror = () => { if(window.showToast) window.showToast('证书生成失败，请刷新重试'); URL.revokeObjectURL(url); };
      img.src = url;
    });

    // ===== 重做本版 =====
    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('test-result').style.display = 'none';
      document.getElementById('test-intro').style.display = 'block';
      document.getElementById('test-selector').style.display = 'flex';
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });

    // ===== 换另一版 =====
    document.getElementById('btn-switch').addEventListener('click', () => {
      const other = state.role === 'parent' ? 'teacher' : 'parent';
      document.querySelectorAll('.test-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.role === other));
      state.role = other;
      document.getElementById('intro-title').textContent = INTROS[other].title;
      document.getElementById('intro-desc').innerHTML = INTROS[other].desc;
      document.getElementById('test-result').style.display = 'none';
      document.getElementById('test-intro').style.display = 'block';
      document.getElementById('test-selector').style.display = 'flex';
      (function(){ var p=document.getElementById('ability-test'); if(p&&p.classList.contains('open')) p.scrollTo({top:0,behavior:'smooth'}); })();
    });
  })();


    // ===== 围棋文化专栏 =====
    
;
window.__luoboInitCulture = function() {
      // 填充计数
      Object.keys(CULTURE_DATA).forEach(k => {
        const el = document.querySelector('.cnt-' + k);
        if (el) el.textContent = CULTURE_DATA[k].articles.length;
      });

      const homeEl = document.getElementById('culture-home');
      const listEl = document.getElementById('culture-list');
      const detailEl = document.getElementById('culture-detail');
      const state = { cat: null, idx: 0 };

      function showHome() {
        homeEl.style.display = 'grid';
        listEl.style.display = 'none';
        detailEl.style.display = 'none';
        scrollToCulture();
      }

      function showList(cat) {
        state.cat = cat;
        const data = CULTURE_DATA[cat];
        document.getElementById('cul-cat-tag').textContent = data.icon + '   ' + {'history':'壹 · 时间','story':'贰 · 记忆','classics':'叁 · 传承','people':'肆 · 人物'}[cat];
        document.getElementById('cul-cat-title').textContent = data.title;
        document.getElementById('cul-cat-intro').textContent = data.intro;
        const listBox = document.getElementById('cul-article-list');
        listBox.innerHTML = '';
        data.articles.forEach((a, i) => {
          const item = document.createElement('div');
          item.className = 'article-item';
          item.innerHTML = '<span class="article-item-title">' + (i + 1).toString().padStart(2, '0') + ' · ' + a.title + '</span><span class="article-item-arrow">→</span>';
          item.addEventListener('click', () => showDetail(cat, i));
          listBox.appendChild(item);
        });
        homeEl.style.display = 'none';
        listEl.style.display = 'block';
        detailEl.style.display = 'none';
        scrollToCulture();
      }

      function showDetail(cat, idx) {
        state.cat = cat;
        state.idx = idx;
        const data = CULTURE_DATA[cat];
        const article = data.articles[idx];
        document.getElementById('cul-detail-cat').textContent = data.icon + '   ' + data.title;
        document.getElementById('cul-detail-title').textContent = article.title;
        document.getElementById('cul-detail-body').innerHTML = article.body;
        // 上下篇按钮
        const prev = document.getElementById('cul-prev');
        const next = document.getElementById('cul-next');
        prev.style.visibility = idx > 0 ? 'visible' : 'hidden';
        next.style.visibility = idx < data.articles.length - 1 ? 'visible' : 'hidden';
        homeEl.style.display = 'none';
        listEl.style.display = 'none';
        detailEl.style.display = 'block';
        scrollToCulture();
      }

      function scrollToCulture() {
        var p = document.getElementById('culture');
        if (p && p.classList.contains('open')) p.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // 绑定入口卡片
      document.querySelectorAll('.culture-entry').forEach(el => {
        el.addEventListener('click', () => showList(el.dataset.cat));
      });
      // 返回按钮
      document.getElementById('cul-back-home').addEventListener('click', showHome);
      document.getElementById('cul-back-list').addEventListener('click', () => showList(state.cat));
      document.getElementById('cul-back-list-2').addEventListener('click', () => showList(state.cat));
      // 上下篇
      document.getElementById('cul-prev').addEventListener('click', () => {
        if (state.idx > 0) showDetail(state.cat, state.idx - 1);
      });
      document.getElementById('cul-next').addEventListener('click', () => {
        const total = CULTURE_DATA[state.cat].articles.length;
        if (state.idx < total - 1) showDetail(state.cat, state.idx + 1);
      });

      // ===== LUOBO-JUMP-HOOK v1.0 START =====
      // 大师星图 jumpTo(name) 跳转钩子（v3.11 fix7 · 两级匹配）：
      //   level 1: 只在 CULTURE_DATA.people 分类做严格主标题匹配
      //            （name 前后都是分隔符视为主传记命中）
      //   level 2: level 1 全落空时宽松 indexOf 兜底，按 people → story → classics → history 顺序
      window.__luoboJumpToMaster = function(name){
        if(!name) return false;
        try {
          var CAT_ORDER = ['people','story','classics','history'];
          // level 1: people 严格主标题匹配
          var peopleArts = CULTURE_DATA.people && CULTURE_DATA.people.articles;
          if(peopleArts){
            for(var i=0;i<peopleArts.length;i++){
              var t = (peopleArts[i] && peopleArts[i].title) || '';
              var pos = t.indexOf(name);
              if(pos < 0) continue;
              var before = pos === 0 ? '' : t.charAt(pos - 1);
              var after = t.charAt(pos + name.length);
              var isDelimBefore = before === '' || before === ' ' || before === '&' || before === '\u00b7';
              var isDelimAfter = after === '\uff1a' || after === '\u300c' || after === ' ' || after === '&' || after === '(' || after === '\uff08' || after === '';
              if(isDelimBefore && isDelimAfter){
                if(typeof window.openSection === 'function') window.openSection('culture');
                showDetail('people', i);
                return true;
              }
            }
          }
          // level 2: 宽松 indexOf 兜底
          for(var k=0;k<CAT_ORDER.length;k++){
            var cat = CAT_ORDER[k];
            var arts = CULTURE_DATA[cat] && CULTURE_DATA[cat].articles;
            if(!arts) continue;
            for(var j=0;j<arts.length;j++){
              if(arts[j] && arts[j].title && arts[j].title.indexOf(name) !== -1){
                if(typeof window.openSection === 'function') window.openSection('culture');
                showDetail(cat, j);
                return true;
              }
            }
          }
        } catch(e){ console.error('[luoboJumpToMaster]', e); }
        return false;
      };
      // ===== LUOBO-JUMP-HOOK v1.0 END =====

      // ===== LUOBO-PEOPLE-EXPAND v1.0 START =====
      // v3.11 fix8 · B1: 追加 5 篇当代大师 people 主传记（幂等 push）
      (function(){
        if(!CULTURE_DATA || !CULTURE_DATA.people || !CULTURE_DATA.people.articles) return;
        var arts = CULTURE_DATA.people.articles;
        var addlist = [{"title": "古力：中国 80 后的「古大力」，八冠王的力战一生", "body": "\n<p>古力，1983 年 2 月 3 日出生于重庆，中国棋手九段。他是 21 世纪初中国围棋从「聂马」时代过渡到「柯洁」时代的领军人物，也是中国棋手中的<strong>八冠世界冠军</strong>，一度被视为世界围棋的头号强者。</p>\n\n<p>古力五岁跟外公学棋。他天赋出众，少年时期便进入职业棋界，之后拜师<strong>聂卫平九段</strong>，成为聂门弟子。同门里还有<strong>常昊</strong>——但两人性格棋风大不同：常昊内敛稳健，古力火爆凌厉。</p>\n\n<p>古力的棋风一句话就能概括：<strong>「力战派」</strong>。他喜欢主动开战，中盘搅局，硬碰硬地把胜负绞出来。棋界给他起了个外号叫「<strong>古大力</strong>」——一是名字里的谐音，二是形容他棋盘上那股不服输的力量感。</p>\n\n<p>他在世界棋坛的巅峰是 2000 年代中后期到 2010 年代初。这段时间里他先后拿下 LG 杯、丰田杯、三星杯、春兰杯、百灵杯等世界冠军，累计达到<strong>八次世界冠军</strong>——这一数字在很长一段时间里都是中国棋手世界冠军数的最高纪录。</p>\n\n<p>他棋手生涯里最具标志性的一战，是与韩国同龄名手<strong>李世石</strong>的<strong>「古李十番棋」</strong>。这场特别的十番对局跨越两年，是新世纪最盛大的中韩棋手个人对抗。两人各有胜负，最终李世石略占上风。这十盘棋后来被称为<strong>「AI 出现前，人类围棋的最后一场巅峰对决」</strong>——2016 年 AlphaGo 横空出世，围棋格局从此改变。</p>\n\n<p>古力早年就以最年轻的九段之一晋身棋界，之后长期担任中国围棋队队长，多次率队征战农心杯、亚运会围棋赛，为中国队立下战功。</p>\n\n<p>在中国围棋的整体传承里，古力扮演的是「桥」的角色：他上承聂卫平、陈祖德一代打下的中国围棋根基，下启柯洁、辜梓豪、杨鼎新一代 90 后、00 后的世代崛起。<strong>2007 年到 2014 年，几乎是他一个人扛起中国围棋世界大赛版图的岁月</strong>——那段时期，很多年幼的中国棋童正是看着「古大力」拿冠军才走上围棋这条路的。</p>\n\n<p>棋盘之外的古力也颇有人情味。他与李世石虽然是棋盘上的死对头，私下却是好友；他与常昊的师门情谊被业内传为佳话。近年他逐步淡出一线赛场，转入解说、教学和围棋推广。棋界评价他：<strong>「他的棋像刀，但他这个人不像。」</strong></p>\n"}, {"title": "常昊：从「六连亚」到应氏杯登顶的中国围棋承前启后者", "body": "\n<p>常昊，1976 年 11 月 7 日生于上海，中国棋手九段。他是<strong>陈祖德、马晓春一代</strong>与<strong>古力、柯洁一代</strong>之间那座重要的桥梁——中国围棋从「学韩国」到「和韩国叫板」再到「引领世界」这段最艰难的转折，主角就是他。</p>\n\n<p>常昊 6 岁学棋，9 岁进入国家少年队，是 80 年代末中国最有天赋的围棋神童之一。少年时期他拜<strong>聂卫平九段</strong>为师——从此中国棋坛多了一位「聂门大师兄」，多年之后同门里又添了古力、周鹤洋等一批名手。</p>\n\n<p>常昊在国内几乎是包揽头衔的存在——CCTV 杯、名人战、天元战……他年少成名，业界一度把他视为「聂卫平之后中国最有希望夺得世界冠军的人」。</p>\n\n<p>但真正让他被围棋史铭记的，恰恰是一段<strong>「亚军岁月」</strong>。从 90 年代末到 2000 年代初，常昊在世界大赛决赛里<strong>连续多次屈居亚军</strong>——富士通杯、应氏杯、三星杯，一场场决赛都倒在最后一步。棋迷心疼地说：「常昊是把决赛下成了主场，把冠军留给了对手。」他自己在那段时间里承受的心理压力，外人很难想象。</p>\n\n<p>转折发生在 <strong>2005 年应氏杯</strong>。这是每四年一届的应氏杯，也是围棋界地位最高的世界大赛之一。这一届决赛，常昊<strong>击败韩国名手，捧起冠军奖杯</strong>。这场胜利终结了他多年亚军的心魔，也帮中国围棋在时隔十年之后重新拿回世界冠军——上一次还是 1995 年马晓春的富士通杯。</p>\n\n<p>常昊的高光还没结束。同年<strong>农心杯</strong>三国擂台赛，他作为最后一名主将出战，一人连胜数位韩国主力棋手，把韩国队干净利落地扫下擂台。这场<strong>农心杯连胜</strong>（含前一年遗留胜局，共八连胜）成为中韩围棋对抗史上最经典的一场翻身仗。</p>\n\n<p>他的棋风与古力截然相反：<strong>厚实、稳健、大局观强</strong>，官子精准，不轻易开战但一旦交锋绝不吃亏。棋友评价：「古力像刀，常昊像盾。」他的胜负观也很老派——不追热点，不慕虚名，只在关键时刻挺身而出。</p>\n\n<p>2020 年，常昊<strong>当选中国围棋协会主席</strong>——一个从陈祖德、王汝南、聂卫平一路传下来的位置。这既是对他棋手成就的肯定，更是对他多年来低调支撑中国围棋事业的一种致敬。棋盘退居二线之后，他把大部分精力投入到少年培养和围棋推广。<strong>「一场比赛可以让一个人成为冠军，一件事情可以让一代人成为棋手。」</strong>常昊如今做的，是后者。</p>\n"}, {"title": "日 · 小林光一：木谷门的入婿，昭和末年的「小林流」六超之一", "body": "\n<p>小林光一，1952 年 9 月 10 日出生于日本北海道<strong>旭川市</strong>，日本棋院九段。他是日本围棋鼎盛时代的最后一批巨匠——所谓<strong>「六超」</strong>（大竹英雄、加藤正夫、武宫正树、赵治勋、林海峰、小林光一）中的一员，也是<strong>木谷道场</strong>最后一位被时代记住的名字。</p>\n\n<p>他的少年时期像一部围棋神童传记。十几岁那年，他从北海道进入日本围棋界的圣地——<strong>木谷实九段</strong>的道场，成为木谷门的内弟子。木谷道场是昭和年间日本围棋最重要的一间道场，前后走出赵治勋、加藤正夫、武宫正树、大竹英雄等一大批巨匠。小林光一在这里学棋、生活、住宿，一住就是好几年。</p>\n\n<p>后来发生了一件足以改变他人生的事：他<strong>迎娶了师父木谷实的女儿小林礼子</strong>。小林礼子本人也是日本著名女流棋手。婚后小林光一继承了「小林」姓氏，正式成为<strong>木谷家的入婿</strong>——这在日本围棋史上是一段独特的家学传承佳话。</p>\n\n<p>他的棋风与他内敛的性格一脉相承：<strong>厚实、缜密、序盘定石严整、官子精妙</strong>。他所独创的<strong>「小林流」</strong>布局——星位、无忧角、三三角配合的现代实地流布局，直接影响了整整两代日本棋手，甚至传到中国、韩国。上世纪 80 年代末到 90 年代初，你能在任何一场高水平对局里看到「小林流」的影子。</p>\n\n<p>他棋手生涯的巅峰是<strong>「三大冠时代」</strong>：曾同时手握<strong>棋圣、名人、本因坊</strong>三大头衔。他多次卫冕名人战、本因坊战，成为「六超」当中获得头衔总数最多的棋手之一。1988 年，他首夺首届<strong>富士通杯</strong>——这是围棋世界大赛开创以来首个冠军。</p>\n\n<p>他与「六超」其他棋手的对抗构成了整个日本围棋最灿烂的年代。<strong>对赵治勋</strong>的名人番棋、<strong>对加藤正夫</strong>的本因坊争夺、<strong>对武宫正树</strong>的宇宙流实地流对撞，都是围棋史上的经典课题。这段时期日本围棋在世界上的统治地位来到最后的巅峰——之后就要迎来韩国棋界的崛起冲击。</p>\n\n<p>90 年代之后，小林光一逐步转入棋界的资深阶段，出任日本棋院要职，担任教练与讲师。<strong>他把小林流的道统传给了下一代——包括他的女儿小林泉美（女流名棋手），也包括在他影响下成长起来的日本新一代旗手井山裕太</strong>。日本围棋进入令和之后，小林光一仍然是一位受人尊敬的元老。棋界评价他一句话最贴切：<strong>「他一个人代表了昭和最后一段安静而扎实的日本围棋。」</strong></p>\n"}, {"title": "日 · 井山裕太：日本首位七冠王，独自撑起「令和围棋」的救世人", "body": "\n<p>井山裕太，1989 年 5 月 24 日出生于日本大阪，关西棋院九段。他是<strong>日本围棋史上首位「七冠王」</strong>——一人同时握有<strong>棋圣、名人、本因坊、王座、天元、十段、碁圣</strong>七大头衔——这个在日本围棋界被视为「不可能任务」的壮举，他在<strong>2016 年 4 月首次达成</strong>，此后又在 2018 年再度完成。</p>\n\n<p>他的师承有点特别。井山裕太 6 岁开始学棋，师从关西棋院的<strong>石井邦生九段</strong>——石井是一位以培养弟子闻名的棋手，专注于把苗子送入职业棋界。井山的天赋很快显露：<strong>12 岁那年正式定段成为职业初段</strong>，这个年龄在日本围棋史上排名前列，是罕见的少年入段者。</p>\n\n<p>他的棋风与传统日本厚实派完全不同：<strong>柔和、大局观强、对棋盘全域感极敏锐</strong>。他不像小林光一那样序盘定石严整，也不像武宫正树那样宇宙流磅礴，而是<strong>把每一手都下在一种「让对手更难受」的位置上</strong>。棋界评价他「像水一样」——形不可捉，却总能渗到最关键的缝隙里。</p>\n\n<p>成年之后，他与前辈棋手小林光一颇有渊源——小林光一曾多次公开对井山的天赋做过评价与提携，两人虽非正式师徒，却是日本围棋界公认的传承关系之一。</p>\n\n<p>井山裕太在日本国内的成就近乎恐怖：<strong>本因坊多年蝉联、名人多次卫冕、棋圣战多次登顶</strong>。日本七大战几乎被他一人包圆——2016 年 4 月，他<strong>首次实现七冠王</strong>；两年后，他又<strong>第二次完成七冠王</strong>。这是日本围棋七大战诞生以来第一位、也是唯一一位达成两度七冠的棋手。</p>\n\n<p>2018 年 2 月，日本政府授予井山裕太<strong>「国民荣誉赏」</strong>——这是日本国家最高荣誉之一，此前从未颁发给围棋棋手。他与将棋界的<strong>羽生善治</strong>共同获此殊荣。日本社会用最高级别的方式承认了这位年轻棋手对国家精神文化的贡献。</p>\n\n<p>但日本围棋的处境却与他一人的辉煌形成强烈反差：<strong>中韩棋手的整体崛起，让日本围棋在世界大赛的地位逐渐边缘化</strong>。井山虽在国内独孤求败，在国际大赛却经常止步中韩强手手下。他成了<strong>「独自撑起日本围棋门面」的救世人</strong>——一整个日本棋界的国际战绩几乎都压在他一人肩上。</p>\n\n<p>棋友评价他：<strong>「他不是日本围棋最强的时代，但他一个人让这个时代仍然值得被记住。」</strong>令和年间的日本围棋，井山裕太是那道最后的光。</p>\n"}, {"title": "韩 · 申真谞：AI 时代的「申工智能」，与柯洁并列的 90 末新王", "body": "\n<p>申真谞，2000 年 3 月 17 日出生于韩国釜山，韩国棋院九段。他是<strong>AI 时代最具代表性的世界顶级棋手</strong>——如果说柯洁是 90 后中国围棋的旗手，那申真谞就是韩国 90 后世代的旗手，两人一同定义了 2020 年代前后的世界围棋格局。</p>\n\n<p>他有个响遍棋界的外号：<strong>「申工智能」</strong>——这个外号既是玩他名字「申」和「人工智能」的谐音，也是对他棋风的精准概括。<strong>他每一手棋与围棋 AI 判断的吻合度，长期在职业棋界稳居第一</strong>。有人分析过他一场关键比赛的对局，全盘的 AI 匹配度接近九成——这个数字在职业棋界近乎不可思议。</p>\n\n<p>申真谞的棋界之路走得很顺。<strong>2012 年入段，年仅 12 岁</strong>，是韩国棋院当时最年少的职业初段之一。之后短短几年里连升九段，先后拿下韩国国内几乎所有头衔战。他的少年时代恰好赶上了 <strong>2016 年 AlphaGo 冲击世界棋界</strong>——那一年他才 16 岁，但这场围棋革命对他的影响却是深远的：他比同龄任何棋手都更早、更深入地把 AI 训练方法融入了自己的棋艺提升里。</p>\n\n<p><strong>2020 年，他首次拿下世界大赛冠军——三星杯</strong>——决赛击败中国名手，成为韩国 21 世纪 20 年代首位世界冠军。此后他一路狂飙：LG 杯、春兰杯、龙星战、天府杯……到 2020 年代中期，他的世界大赛冠军数已经追上前辈级别，正在冲击历史最多纪录。</p>\n\n<p>他的棋风与「石佛」李昌镐一脉相承却又有本质不同：<strong>李昌镐是稳健的官子之王，申真谞则是精算深读的中盘杀手</strong>。他能在最复杂的局面里瞬间读出十几手之后的最优选择——这种深读能力，正是 AI 时代培养出来的新棋风。棋友说：「和申真谞下棋，感觉他每一手都比你多算三十步。」</p>\n\n<p>他与<strong>柯洁</strong>的多次对抗，是这个时代最引人注目的棋盘对话。两人年龄接近、身份对称——一个中国 97 年、一个韩国 00 年，是所属国家 90 末世代的头号棋手。他们的每一次决赛相遇，都成为世界围棋的头条焦点，也重演了当年<strong>李昌镐 × 常昊</strong>那种跨国棋手长期对抗的经典模式。</p>\n\n<p>更值得注意的是申真谞背后的时代意义。<strong>他是围棋进入 AI 时代之后，成长起来的第一批「AI 原生棋手」</strong>——不再依赖旧道场的师徒口授，而是直接与 AI 一起训练成长。他代表了 21 世纪围棋教学模式的一次深刻转变。围棋界的下一个十年，还会有多少个「申工智能」出现？棋界都在拭目以待。</p>\n"}];
        var existing = {};
        for(var i=0;i<arts.length;i++){ existing[arts[i].title] = true; }
        for(var j=0;j<addlist.length;j++){
          if(!existing[addlist[j].title]) arts.push(addlist[j]);
        }
      })();
      // ===== LUOBO-PEOPLE-EXPAND v1.0 END =====

      // ===== LUOBO-WOMEN-EXPAND v1.0 START =====
      // v3.11 fix10 · 女子星图配套：追加 12 篇女棋手 people 主传记（幂等 push）
      (function(){
        if(!CULTURE_DATA || !CULTURE_DATA.people || !CULTURE_DATA.people.articles) return;
        var arts = CULTURE_DATA.people.articles;
        var addlist = [{"title": "芮乃伟：中国首位女子九段，跨越三国的女子第一人", "body": "芮乃伟出生于 1963 年，上海人。少年时进入上海围棋队，后进入国家队。1988 年，她在中国获得女子九段段位，成为新中国培养的首位女子九段棋手，这是中国女子围棋段位史上的一次突破。\n\n1990 年代，她赴海外深造多年，先后在日本、美国生活学习，围棋道路辗转跨越几个国家。2000 年，她在韩国棋院正式取得职业九段资格，这也是围棋史上第一位在实赛体系下拿到九段的女棋手。这段跨国经历让她在中、日、韩三地都留下过重要战绩。\n\n她的棋风力战型十足，中盘搏杀凶悍，被围棋界称为\"力战女王\"。世界女子锦标赛、宝海杯、正官庄杯等大型赛事上，她多次夺冠或闯入决赛，长期是女子围棋的世界顶尖选手。在与男子棋手的公开赛对局中，她也留下过击败顶尖男棋手的战绩，成为当时女子棋界的标志人物。\n\n2010 年代之后，她逐步将重心转回中国，继续参加各类甲级联赛与老将赛，长期活跃在职业赛场。她的棋士生涯跨越几代女子棋手，从与张璇、丰云同代的老一辈，到於之莹、王晨星等新生代女子领军，她都同场竞技过。\n\n对于女子围棋教育界而言，芮乃伟的意义远超战绩本身。她证明了女子棋手可以在职业九段的最高段位上稳定竞争，也让\"女子围棋能走多远\"这个问题有了具体答案。她是女子围棋从依附时代走向独立时代的关键坐标。"}, {"title": "张璇：新中国自主培养的女子九段，长盛的国内女子领军", "body": "张璇出生于 1969 年，江苏南京人。少年进入江苏队，后入选国家队，是新中国自主培养的女子高段棋手代表之一。\n\n她在 1980 年代末与 1990 年代长期是国内女子围棋的领军人物之一，多次获得全国女子个人赛冠军、女子名人战冠军。她与芮乃伟、丰云、杨晖等同代女棋手共同支撑起中国女子围棋在改革开放后的第一波高峰。\n\n张璇的棋风稳健、厚重，擅长控局与官子。她的对局节奏偏慢，往往在中盘之后凭借扎实的基本功和形势判断能力占据优势。这种风格与同代芮乃伟的力战型形成鲜明对比，也让国内女子棋坛的对局风格更加多元。\n\n除职业对局外，张璇长期投身围棋普及与女子棋手培养。她担任过多支甲级联赛队伍的女子主力和教练，也参与国家女队的训练与选拔工作。国内多位新生代女棋手，都在成长阶段接受过她的指导或与她共同训练。\n\n2000 年之后，张璇逐步从一线赛场转向教练与围棋文化推广工作，但她仍不定期出战女子快棋赛、老将赛等赛事。对于中国女子围棋的\"承前启后\"这一段路，张璇是不可忽略的中枢人物。她的意义不仅在个人成绩，更在于把改革开放第一代女子棋手的经验与训练方法，稳稳地交到了下一代手中。"}, {"title": "华学明：从女子领军到中国围棋队领队，桃李满门的教练之路", "body": "华学明出生于 1961 年，江苏人。少年进入江苏队，后进入国家队，是 1980 年代中国女子围棋的代表选手之一。\n\n作为职业棋手时期，华学明多次获得全国女子个人赛冠军、女子名人战冠军，是那一代女子棋手中战绩最稳定的名将之一。她与稍晚出道的芮乃伟、张璇同代，共同在改革开放初期的国内女子棋坛占据主导位置。她的棋风偏灵动、快节奏，中盘感觉锐利。\n\n真正让华学明在中国围棋史上留下更深印记的，是她后来投身女子围棋教练与管理工作。1990 年代之后，她逐步转型为教练，并出任国家围棋队女队教练、领队等职务，长期负责女队的日常训练、选拔与国际赛事组织。中国女子围棋在 2000 年代之后能够涌现多位世界女子锦标赛冠军，与她这一批教练兼管理者所打下的训练体系密不可分。\n\n2010 年代之后，华学明的角色进一步扩展为整个中国围棋队的领队之一。她既是训练组织者，也是国际赛事的沟通协调者。国内外围棋界对她的评价，除职业战绩之外，更多集中在她把职业棋手职业发展路径、女子棋手成长路径打通的这份长期贡献上。\n\n对于围棋教育从业者而言，华学明的意义在于示范了一种可能：一位女子棋手完成职业竞技阶段后，可以在教练、领队、管理者的位置上继续影响一代又一代棋手的成长。"}, {"title": "於之莹：女子建桥杯八连霸，00 后崛起前的中国女子第一人", "body": "於之莹出生于 1997 年，上海人。少年时进入职业围棋训练体系，2010 年前后升入职业，是 90 后中国女子棋手中最早崭露头角的一位。\n\n她的成名之战是女子建桥杯。自 2013 年起，她连续多年蝉联建桥杯女子公开赛冠军，达成\"八连霸\"的成就，这在女子围棋公开赛历史上极为罕见。除建桥杯之外，她还多次拿到黄龙士杯世界女子团体赛冠军、穹窿山兵圣杯世界女子锦标赛冠军，长期作为中国女队的核心主力出战国际大赛。\n\n於之莹的棋风偏厚重稳健，中盘计算扎实，对形势判断的把握非常敏锐。她在与男子顶尖棋手的公开赛对局中，多次战胜过职业九段，成为其所在时代女子对男子胜率最高的棋手之一。她与同代韩国崔精、日本藤泽里菜并称\"女子三大天王\"，是 2010 年代女子围棋世界舞台上最具代表性的选手之一。\n\n作为国家女队核心多年，於之莹除了个人赛事，还长期参加围甲联赛、女子甲级联赛，是各队争抢的女子主将。她的存在让 2010 年代中国女子棋坛保持了稳定的国际竞争力。\n\n2020 年代之后，随着周泓余、李赫、陆敏全等 00 后新一代女棋手崛起，於之莹开始逐步与年轻队友共同承担国际大赛任务。她与新一代女子棋手之间的更替与并肩，是中国女子围棋良性循环的写照。"}, {"title": "王晨星：世界女子锦标赛冠军，稳健厚重的中生代女将", "body": "王晨星出生于 1991 年，是中国女子围棋 90 后一代的代表棋手之一。少年进入国家少年队训练体系，后升入职业，长期作为国家女队的重要力量。\n\n她最具代表性的战绩来自世界女子锦标赛冠军和女子智运会冠军。在穹窿山兵圣杯等世界女子大赛上，她多次进入决赛并夺冠。她的棋风偏稳健，行棋节奏不激烈，重视厚势与全局平衡，是那种典型的\"官子扎实、后半盘不慌\"的棋风。\n\n与同代的於之莹形成搭档，王晨星长期是中国女队参加国际团体赛的稳定主力。在黄龙士杯世界女子围棋团体锦标赛、中韩女子围棋对抗赛等团体赛事中，她多次贡献关键胜局。\n\n除国际大赛外，王晨星也长期参加国内女子甲级联赛，是各队争抢的女子主将级选手。她的对局风格给围棋教育界提供了一个很好的样本：不必依赖锐利的开局奇招，也可以靠稳扎稳打的中盘与官子在世界女子最高舞台上争冠。\n\n对于中生代女子棋手来说，王晨星的意义在于示范了\"稳健派女子九段\"的可能路径——不是靠力战和奇兵，而是靠均衡厚实的基本功走到世界之巅。她与於之莹的双主将时代，为中国女子围棋 2010 年代的国际战绩打下了稳定基座。"}, {"title": "周泓余：00 后女子世界冠军，中国女子当代最活跃的执棋人", "body": "周泓余出生于 2003 年，江苏人。少年进入江苏省队，后升入国家队，是中国女子围棋 00 后一代最早崭露头角的选手之一。\n\n她自 2010 年代末开始在国内女子赛事中站稳一线位置，随后逐步在国际大赛中取得突破。她在世界女子围棋锦标赛系列赛事中多次进入决赛并夺冠，是中国女子当代最活跃的世界冠军之一。她与李赫、陆敏全等同代 00 后女棋手一同，构成了中国女队当代的中坚力量。\n\n周泓余的棋风兼具力战与稳健，年轻棋手的锐气与前辈棋风的沉稳在她身上都有体现。她中盘敢于战斗，后半盘又能收得住形势，被评论界认为具备\"能打大赛\"的心理素质。她在与韩国崔精、日本藤泽里菜等外国女子第一人的对局中，多次贡献高水平厮杀。\n\n除个人赛事外，她也是女子甲级联赛与围甲联赛的主力选手，代表中国队参加各种女子国际团体赛，是当代中国女队最年轻的核心。\n\n对围棋教育界而言，周泓余的价值在于展现了 00 后女棋手的成长节奏：她们不再需要经历上一代女子棋手\"要出海才能证明自己\"的路径，而是在国内成熟的训练体系里就完成了从少年到世界冠军的跨越。她所代表的这一代女棋手，是中国女子围棋良性循环的最新一茬果实。"}, {"title": "日 · 杉内寿子：昭和至平成的活棋圣，逾九十岁仍执子的传奇", "body": "杉内寿子出生于 1927 年，是日本围棋界最资深的女棋手之一，长期活跃于日本棋院系统。\n\n她的职业生涯从昭和时代延续到平成、令和，跨越近八十年，本身就是日本女子围棋史的一部活字典。她的丈夫杉内雅男九段同样是日本著名男棋手，两人是围棋界少见的\"高段位夫妇\"，共同见证了日本围棋从战后重建到 21 世纪的完整历程。\n\n杉内寿子的战绩包括早期女流选手权战冠军、女流本因坊等国内头衔战成绩。这些赛事在她那一代人处于起步阶段，她是奠基一代的代表。她的棋风稳健、耐心，年轻时是攻防兼备的正统本格派，年老之后转为持重厚实。\n\n她最为围棋界所敬重的一点，是逾九十岁仍在日本棋院执子出赛。在日本棋院常规对局记录中，她多次刷新\"女子最高龄职业胜局\"等纪录，成为日本围棋界公认的\"活棋圣\"象征。她的存在本身就在告诉后辈：围棋是可以下一辈子的事。\n\n对围棋教育从业者而言，杉内寿子的意义超越具体战绩。她是日本女子围棋整个链条的源头之一，从她这一代人打下的基础，才有了后来小林泉美、谢依旻、藤泽里菜、上野爱咲美这些女子头衔战冠军的舞台。她也是围棋作为终身事业最有说服力的活证据。"}, {"title": "日 · 谢依旻：台湾出身的日本女流四冠，多年蝉联女流第一", "body": "谢依旻出生于 1989 年，台北人。少年赴日学棋，后加入日本棋院，成为日本围棋界长期站在女流第一位置的代表棋手之一。\n\n她的国际影响力主要来自日本女流三大战——女流本因坊、女流名人、女流棋圣三个头衔战。她曾多次蝉联女流本因坊、女流名人等头衔，长期占据日本女流第一的位置。合并其他女流头衔战，她累计的女流头衔数在日本历代女棋手中位居前列，是名副其实的\"女流四冠王\"级人物。\n\n她的棋风偏均衡厚重，中盘扎实，官子精细。这种\"稳的一手\"是她能在日本女流赛事中长期霸榜的关键。她在与韩国崔精、中国於之莹的国际对局中也贡献过多局高水平之作，是那一代日本女子围棋在国际赛场上的门面。\n\n除个人赛外，她长期代表日本参加中韩日女子团体赛、女子围棋世界大赛。她与年轻一代的藤泽里菜、上野爱咲美既是对手也是队友，共同支撑起日本女子围棋在 2010 年代到 2020 年代的国际竞争力。\n\n谢依旻的意义对台海围棋圈也有特殊分量。她证明了一位台湾出身的少年棋手，可以完整走完日本棋院从入段到女流第一的道路。对于围棋教育界，这段跨地域的成长路径，是很好的\"路径样本\"。"}, {"title": "日 · 藤泽里菜：藤泽秀行的孙女，日本女流首位 800 胜的四冠王", "body": "藤泽里菜出生于 1998 年，是日本著名棋士藤泽秀行的孙女。她少年时便展露天赋，2010 年前后成为日本棋院最年轻的女流入段选手之一，从此长期占据日本女子围棋头部位置。\n\n她的头衔战成绩非常密集：女流本因坊、女流名人、女流棋圣、扇兴杯等日本主要女流赛事，她都拿到过多次冠军，累计女流头衔数长期位居日本女棋手前列。她被日本围棋界视为\"藤泽家第三代\"的正统传承者。\n\n藤泽里菜的棋风偏灵动、锐利，敢于在中盘发起战斗，与谢依旻的稳健形成日本女流第一集团内部的两种风格。她与谢依旻长期形成\"女流两强\"的对局关系，也让日本女流赛事的观赏性大幅提高。\n\n国际赛场上，她与中国的於之莹、周泓余，以及韩国的崔精、吴侑珍多次交手，是 2010 年代到 2020 年代日本女子围棋在国际赛场上最具代表性的选手。她也是日本女子棋手中率先达到通算胜局数里程碑的一位，多次刷新\"日本女子职业首位达到 XX 胜\"的纪录。\n\n藤泽里菜的意义除了自身战绩，也包括她作为\"棋道世家第三代\"的公共形象。祖父藤泽秀行以豪爽和\"棋盘外传奇\"闻名日本棋坛，孙女藤泽里菜则用扎扎实实的头衔战冠军延续家族的围棋招牌。这种代际传承对围棋教育界而言，本身就是一个动人的样本。"}, {"title": "韩 · 尹映善：韩国女子第一位九段，早期女子围棋的奠基者", "body": "尹映善是韩国女子围棋早期最重要的奠基者之一，是韩国棋院女子棋手中较早达到高段位的代表。她的职业生涯主要活跃于 1980 年代末至 2000 年代初，是韩国女子围棋从起步阶段走向国际化的关键人物之一。\n\n在她成长的年代，韩国女子围棋人口极少，训练资源和公开赛事也远不如男子体系完善。她在这样的条件下逐步升段，最终成为韩国女子棋手第一位跨入职业九段的选手，是韩国女子围棋段位史上的重要里程碑。\n\n尹映善的战绩集中在国内女子赛事与早期国际女子团体赛。她多次代表韩国参加中韩、韩日女子对抗赛，是韩国女队组队初期的核心主力之一。她的棋风偏均衡稳健，注重形势判断与官子处理，符合韩国当时男子第一集团的整体训练风格。\n\n她的长远意义远超个人战绩。作为韩国女子围棋的奠基一代，她与后来涌现的朴志恩、赵惠连等中生代女棋手，共同为 90 后崔精、吴侑珍这批韩国女子世界冠军铺好了体系底座。没有她这一代人的积累，也就不会有今天韩国女子在世界女子舞台上的稳定竞争力。\n\n对围棋教育从业者而言，尹映善所代表的是一段\"从零到一\"的开垦时期。她的存在提醒我们：任何一个围棋强国的女子板块，都需要先有奠基者顶着资源匮乏往前走，才能长出后来枝繁叶茂的世界冠军群。"}, {"title": "韩 · 崔精：韩国女子第一人，多次进入男子公开赛决胜的女流三大天王", "body": "崔精出生于 1996 年，韩国釜山人。少年入段，从 2010 年代起长期占据韩国女子围棋第一的位置，是当代女子围棋世界舞台上的头号人物之一。\n\n她的头衔战成绩极为密集：女流国手战、女流名人战、麦馨杯女子最强战、女流十段等韩国女子头衔战她均多次蝉联，是韩国历代女棋手中头衔累计最多的选手之一。在国际女子赛事上，她多次夺得穹窿山兵圣杯世界女子锦标赛冠军，是同代女棋手中世界大赛冠军数最多的一位。\n\n她与中国的於之莹、日本的藤泽里菜并称\"女子三大天王\"，长期支撑起 2010 年代到 2020 年代女子围棋的世界最高水平对局。她的棋风兼具力战锐利与官子精细，中盘搏杀能力被韩国棋坛评为\"接近男子顶尖水准\"。\n\n她也是当代女子棋手中，与男子顶尖棋手过招最多的选手之一。在韩国 GS 加德士杯、名人战等男女混合公开赛中，她多次进入正赛决胜阶段，与顶尖男子九段贡献过多局引起国际棋坛关注的高水平对局。这些对局证明女子棋手完全可以在最高水平的公开赛体系里稳定竞争。\n\n崔精的价值不仅在战绩本身，还在于她的存在极大提振了整个女子围棋界的信心。对围棋教育从业者而言，她是当代女子围棋最有说服力的形象代言人——女子围棋不是\"男子的辅赛\"，而是有自己完整叙事线和世界巨星的独立舞台。"}, {"title": "韩 · 吴侑珍：韩国新一代女子九段，世界女子锦标赛冠军", "body": "吴侑珍出生于 1998 年，是韩国女子围棋新生代的代表棋手之一。她少年入段，2010 年代中期开始在韩国女流赛事中崭露头角，与稍长的崔精共同构成韩国女子第一集团。\n\n她的国内战绩包括女流名人战、女流国手战、女流最强战等多次决赛与夺冠。她随后在国际赛场上完成关键突破，在穹窿山兵圣杯世界女子围棋锦标赛等大赛中夺得世界冠军，让韩国女子围棋在国际舞台上继续保持双主力的架构。\n\n吴侑珍的棋风偏力战型，中盘搏杀凶悍，行棋速度快，被韩国棋坛评价为\"敢下\"的一位女棋手。她与崔精之间的对局，形成了韩国女子头部两种风格的对撞：崔精的均衡厚实与吴侑珍的锐利强攻。这种内部竞争关系让韩国女子头部选手长期保持竞技状态。\n\n她也是新一代韩国女子九段的代表性人物。在韩国女子围棋段位史上，从尹映善这一代拿到女子第一位九段开始，到崔精、吴侑珍这一代拿到女子九段，段位史的完整链条被清晰接续起来。\n\n国际赛场上，她与中国的於之莹、周泓余、日本的藤泽里菜多次交手，是当代女子世界大赛的常客。她与崔精\"双核\"驱动的韩国女队，是 2020 年代女子围棋世界舞台上稳定的一极。对围棋教育从业者而言，吴侑珍所代表的是韩国女子围棋自成体系的传承证据——她既是崔精之后的接棒者，也是下一代年轻棋手的追赶目标。"}];
        var existing = {};
        for(var i=0;i<arts.length;i++){ existing[arts[i].title] = true; }
        for(var j=0;j<addlist.length;j++){
          if(!existing[addlist[j].title]) arts.push(addlist[j]);
        }
      })();
      // ===== LUOBO-WOMEN-EXPAND v1.0 END =====
};


// ===== Showcase 5秒轮播 =====
(function(){
  var slides = document.querySelectorAll('.showcase-slide');
  var dots = document.querySelectorAll('.showcase-dot');
  var caption = document.getElementById('showcase-caption');
  var captions = ['2026 下半年 · 分享课表', '最新产物一览', '家校共育四书'];
  if (!slides.length) return;
  var cur = 0;
  function show(i){
    slides.forEach(function(s, k){ s.classList.toggle('active', k === i); });
    dots.forEach(function(d, k){ d.classList.toggle('active', k === i); });
    if (caption) caption.textContent = captions[i];
    cur = i;
  }
  dots.forEach(function(d, k){ d.addEventListener('click', function(){ show(k); }); });
  setInterval(function(){ show((cur + 1) % slides.length); }, 5000);
})();

// ===== Teaching 教学理念 =====
    
;

// ===== 练棋建议 v1 =====
// ===== 六期：练棋建议按需加载 =====
// 原 506 行模块(记忆周期+6:3:1计算器+CSV导出)拆到 practice-guide-lazy.js
// 首次点击"练棋建议"时拉取，后续调用走已加载的真实函数
(function(){
  var loaded = false;
  window.showPracticeGuide = function(){
    if(loaded){ return; }
    var container = document.getElementById('practice-guide') || document.getElementById('teaching');
    window.__luoboSkeleton.show(container);
    window.__luoboLoadScript('/assets/js/practice-guide-lazy.js').then(function(){
      loaded = true;
      window.__luoboSkeleton.hide(container);
      window.showPracticeGuide();
    }).catch(function(){
      window.__luoboSkeleton.hide(container);
    });
  };
  window.hidePracticeGuide = function(){
    var g = document.getElementById('practice-guide');
    if(g) g.classList.add('hidden');
    var h = document.getElementById('teaching-home');
    if(h) h.classList.remove('hidden');
    var e = document.querySelector('.practice-entry-card');
    if(e) e.classList.remove('hidden');
  };
})();
// ===== 练棋建议 v1 END =====

// ===== 给家长的建议 v6 =====
function showParentGuide(){
  var t = document.getElementById('teaching');
  var home = document.getElementById('teaching-home');
  var list = document.getElementById('teaching-list');
  var detail = document.getElementById('teaching-detail');
  var practiceEntry = document.querySelector('.practice-entry-card');
  var parentEntry = document.querySelector('.parent-entry-card');
  var pg = document.getElementById('parent-guide');
  var pcg = document.getElementById('practice-guide');
  if(home) home.style.display='none';
  if(list) list.classList.add('hidden');
  if(detail) detail.classList.add('hidden');
  if(practiceEntry) practiceEntry.style.display='none';
  if(parentEntry) parentEntry.style.display='none';
  if(pcg) pcg.classList.add('hidden');
  if(pg){ pg.classList.remove('hidden'); }
  // hotfix 2026-11-23：#teaching 已改 collapsible overlay，window.scrollTo 对其无效；
  // 先开面板再在面板滚动容器内定位
  if(t){
    if(typeof window.openSection === 'function') window.openSection('teaching');
    setTimeout(function(){
      var pg2 = document.getElementById('parent-guide');
      if(pg2 && pg2.scrollIntoView) pg2.scrollIntoView({behavior:'smooth', block:'start'});
    }, 380);
  }
}
function hideParentGuide(){
  var home = document.getElementById('teaching-home');
  var practiceEntry = document.querySelector('.practice-entry-card');
  var parentEntry = document.querySelector('.parent-entry-card');
  var pg = document.getElementById('parent-guide');
  if(pg) pg.classList.add('hidden');
  if(home) home.style.display='';
  if(practiceEntry) practiceEntry.style.display='';
  if(parentEntry) parentEntry.style.display='';
  var t = document.getElementById('teaching');
  if(t){
    // overlay 滚动容器回顶（openSection 打开时亦会重置，此处兜底）
    t.scrollTop = 0;
  }
}
// ===== 给家长的建议 v6 END =====


/* ===== 模块 F · 学情反馈单 已移至 practice-guide-lazy.js，随练棋建议面板按需加载 ===== */
;
/* ===== 折叠板块交互（独占展开）===== */
(function(){
  const HEADER_OFFSET = 72;
  const HORIZONTAL_SLIDE_IDS = ['hero','showcase','directory','mission'];
  function scrollToEl(el){
    if(!el) return;
    // 桌面端横向翻页 3 段之一，走 goToSlide（横向 scroll）
    if(window.innerWidth >= 901 && HORIZONTAL_SLIDE_IDS.includes(el.id)){
      if(typeof window.goToSlide === 'function'){
        window.goToSlide(HORIZONTAL_SLIDE_IDS.indexOf(el.id));
        return;
      }
    }
    const rect = el.getBoundingClientRect();
    const topAbs = rect.top + window.pageYOffset;
    // 元素小于 viewport-100 时上下居中；否则顶部靠 viewport 12% (标题清晰可见)
    const vh = window.innerHeight;
    let target;
    if (rect.height + 40 < vh) {
      target = topAbs - (vh - rect.height) / 2;
    } else {
      target = topAbs - vh * 0.12;
    }
    window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }
  var _scrollPositions = {}; // 面板滚动位置记忆
  function openSection(id){
    var doOpen = function() {
      // 独占模式：保存其他面板的滚动位置并关闭
      document.querySelectorAll('.collapsible.open').forEach(el => {
        if(el.id !== id) {
          _scrollPositions[el.id] = el.scrollTop;
          el.classList.remove('open');
        }
      });
      const target = document.getElementById(id);
      if(!target) return;
      if(target.classList.contains('collapsible')){
        target.classList.add('open');
        document.body.classList.add('body-lock');
        // 恢复上次滚动位置（首次打开则为 0）
        var saved = _scrollPositions[id] || 0;
        setTimeout(() => { target.scrollTop = saved; }, 30);
      } else {
        // 非折叠段（hero/showcase/mission/contact）走滚动
        setTimeout(() => scrollToEl(target), 60);
      }
      // 更新 side-nav active
      document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
      const btn = document.querySelector('.side-nav a[data-target="' + id + '"]');
      if(btn) btn.classList.add('active');
      // 关闭移动端菜单
      document.querySelector('.side-nav').classList.remove('mobile-open');
      document.body.classList.remove('side-open');
    };
    if (document.startViewTransition) {
      document.startViewTransition(doOpen);
    } else {
      doOpen();
    }
  }
  function closeAllPanels(){
    var doClose = function() {
      document.querySelectorAll('.collapsible.open').forEach(el => {
        _scrollPositions[el.id] = el.scrollTop;
        el.classList.remove('open');
      });
      document.body.classList.remove('body-lock');
      document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
    };
    if (document.startViewTransition) {
      document.startViewTransition(doClose);
    } else {
      doClose();
    }
  }
  // ===== LUOBO-OPENSECTION-EXPOSE v1.0 START =====
  // v3.14 fix18 · 大师星图点击跳转彻底修复：openSection 暴露到 window，供 __luoboJumpToMaster 调用
  window.openSection = openSection;
  // ===== LUOBO-OPENSECTION-EXPOSE v1.0 END =====
  window.closeAllPanels = closeAllPanels;

  // ===== 返回顶部按钮逻辑（移动端面板内） =====
  (function() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (!backToTopBtn) return;

    function checkScroll() {
      const openPanel = document.querySelector('.collapsible.open');
      if (!openPanel) {
        backToTopBtn.classList.remove('visible');
        return;
      }
      if (openPanel.scrollTop > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    backToTopBtn.addEventListener('click', function() {
      const openPanel = document.querySelector('.collapsible.open');
      if (openPanel) {
        openPanel.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // 监听所有 collapsible 面板的滚动
    document.querySelectorAll('.collapsible').forEach(function(panel) {
      panel.addEventListener('scroll', checkScroll, { passive: true });
    });

    // 面板关闭时隐藏按钮
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          checkScroll();
        }
      });
    });
    document.querySelectorAll('.collapsible').forEach(function(panel) {
      observer.observe(panel, { attributes: true });
    });
  })();

  // ===== v3.3: 智能层级关闭 —— 板块有子视图时先分层返回，最外层才关整个板块 =====
  function smartClose() {
    const openPanel = document.querySelector('.collapsible.open');
    if (!openPanel) return;
    const pid = openPanel.id;

    // culture: detail → list → home → 关闭整个板块
    if (pid === 'culture') {
      const detail = document.getElementById('culture-detail');
      const list = document.getElementById('culture-list');
      const home = document.getElementById('culture-home');
      if (detail && detail.style.display !== 'none') {
        detail.style.display = 'none';
        if (list) list.style.display = 'block';
        return;
      }
      if (list && list.style.display !== 'none') {
        list.style.display = 'none';
        if (home) home.style.display = '';
        return;
      }
    }

    // edulab: detail → content 卡片列表 → 关闭整个板块
    if (pid === 'edulab') {
      const detail = document.getElementById('edulab-detail');
      const content = document.getElementById('edulab-content');
      if (detail && detail.style.display !== 'none') {
        detail.style.display = 'none';
        if (content) content.style.display = 'block';
        return;
      }
    }

    // 默认：关闭整个 collapsible 回首页
    closeAllPanels();
  }
  window.smartClose = smartClose;
  // 折叠触发器（顶部"联系我们" + 侧栏 8 按钮）
  document.querySelectorAll('.nav-toggle').forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      const id = this.dataset.target;
      const role = this.dataset.role;
      if(id) openSection(id);
      if(role){
        setTimeout(function(){
          const tabBtn = document.querySelector('.test-tab-btn[data-role="'+role+'"]');
          if(tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
        }, 120);
      }
    });
  });
  // 顶部主页按钮（首页/展示/箴言）：仅滚动
  document.querySelectorAll('.nav-home').forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      const id = this.getAttribute('href').slice(1);
      scrollToEl(document.getElementById(id));
    });
  });
  // 首页 hero 里的"看正在做什么"按钮 → 展开 projects
  const projBtn = document.querySelector('a[href="#projects"].btn-secondary');
  if(projBtn){
    projBtn.addEventListener('click', function(e){
      e.preventDefault();
      openSection('projects');
    });
  }
  // 首页 hero 里的"加我微信"按钮 → 展开 contact
  const contactBtn = document.querySelector('a[href="#contact"].btn-primary');
  if(contactBtn){
    contactBtn.addEventListener('click', function(e){
      e.preventDefault();
      openSection('contact');
    });
  }
  // 全局事件委托（不受按钮 DOM 顺序影响）
  document.addEventListener('click', function(e){
    // 面板 × 关闭
    if(e.target.closest('#panelCloseBtn')){
      e.preventDefault();
      smartClose();
      return;
    }
    // P0-6: TabBar 项点击后设置 active 状态
    const tabItem = e.target.closest('.mobile-tabbar a');
    if(tabItem){
      document.querySelectorAll('.mobile-tabbar a').forEach(a => a.classList.remove('active'));
      tabItem.classList.add('active');
      // nav-toggle 走已有的 scrollToEl 逻辑，这里不 preventDefault
    }
    // 移动端汉堡菜单开关
    if(e.target.closest('#mobileMenuBtn')){
      e.preventDefault();
      const sn = document.querySelector('.side-nav');
      const willOpen = !sn.classList.contains('mobile-open');
      sn.classList.toggle('mobile-open');
      document.body.classList.toggle('side-open', willOpen);
      return;
    }
    // 上下翻页箭头
    if(e.target.closest('#slideUpBtn')){
      e.preventDefault();
      slideBy(-1);
      return;
    }
    if(e.target.closest('#slideDownBtn')){
      e.preventDefault();
      slideBy(1);
      return;
    }
    // 点击侧栏外 → 收起移动端菜单
    const sn = document.querySelector('.side-nav');
    if(sn && sn.classList.contains('mobile-open') && !sn.contains(e.target)){
      sn.classList.remove('mobile-open');
      document.body.classList.remove('side-open');
    }
  });
  // ESC 关闭面板
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') smartClose();
    // 桌面左右键翻页（未打开面板时）；保留 ↑↓/PageUp/PageDown 兼容
    if(!document.body.classList.contains('body-lock') && window.innerWidth >= 901){
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown'){
        e.preventDefault(); slideBy(1);
      } else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp'){
        e.preventDefault(); slideBy(-1);
      }
    }
  });
  // 横向翻页：page-track 元素 scrollLeft / viewport width
  const SLIDE_IDS = ['hero','showcase','directory','mission'];
  function pageTrack(){ return document.getElementById('pageTrack'); }
  function currentSlideIdx(){
    const pt = pageTrack();
    if(!pt || window.innerWidth < 901) return 0;
    return Math.round(pt.scrollLeft / window.innerWidth);
  }
  function slideBy(delta){
    const idx = currentSlideIdx();
    const next = Math.max(0, Math.min(SLIDE_IDS.length - 1, idx + delta));
    goToSlide(next);
  }
  function goToSlide(idx){
    const pt = pageTrack();
    if(!pt) return;
    if(window.innerWidth >= 901){
      pt.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
    } else {
      const el = document.getElementById(SLIDE_IDS[idx]);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    }
    updateSlideDots(idx);
  }
  window.slideBy = slideBy;
  window.goToSlide = goToSlide;
  // 更新箭头显隐 + dots
  function updateSlideDots(idx){
    if(idx === undefined) idx = currentSlideIdx();
    document.querySelectorAll('.slide-dot').forEach((d,i) => {
      d.classList.toggle('active', i === idx);
    });
    const up = document.getElementById('slideUpBtn');
    const down = document.getElementById('slideDownBtn');
    if(up) up.style.opacity = idx === 0 ? '0.25' : '1';
    if(down) down.style.opacity = idx === SLIDE_IDS.length - 1 ? '0.25' : '1';
  }
  // 监听 page-track 横向滚动 → 更新 active dot
  let scrollTimer = null;
  function onTrackScroll(){
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => updateSlideDots(), 80);
  }
  // 延迟挂载（等 DOM ready）
  setTimeout(() => {
    const pt = pageTrack();
    if(pt) pt.addEventListener('scroll', onTrackScroll, { passive: true });
    updateSlideDots(0);
  }, 100);
  // 窗口尺寸变化时保证当前页对齐
  window.addEventListener('resize', () => {
    const idx = currentSlideIdx();
    const pt = pageTrack();
    if(pt && window.innerWidth >= 901){
      pt.scrollLeft = idx * window.innerWidth;
    }
  });
  // dots 点击跳转
  document.addEventListener('click', function(e){
    const dot = e.target.closest('.slide-dot');
    if(!dot) return;
    const idx = parseInt(dot.dataset.idx, 10);
    if(!isNaN(idx)) goToSlide(idx);
  });
  // 初始化
  setTimeout(() => updateSlideDots(0), 100);

  // ===== v3.1: URL 带 hash 且指向 collapsible → 自动展开 =====
  (function autoExpandFromHash() {
    const h = window.location.hash;
    if (!h || h.length < 2) return;
    const id = h.substring(1);
    const tgt = document.getElementById(id);
    if (tgt && tgt.classList.contains('collapsible')) {
      setTimeout(function() { openSection(id); }, 150);
    }
  })();
})();
;
(function(){
  try{
    if(sessionStorage.getItem('luobo_ink_shown')==='1'){
      var m0=document.getElementById('ink-landing-mask');
      if(m0){m0.parentNode.removeChild(m0);}
      var s0=document.getElementById('ink-landing-style');
      if(s0){s0.parentNode.removeChild(s0);}
      return;
    }
  }catch(e){}
  var mask=document.getElementById('ink-landing-mask');
  var cvs=document.getElementById('ink-canvas');
  var skip=document.getElementById('ink-skip-btn');
  if(!mask||!cvs){return;}
  var ctx=cvs.getContext('2d');
  var W=cvs.width,H=cvs.height;
  var pad=30,cell=(W-pad*2)/8;
  function drawBoardGrid(){
    ctx.strokeStyle='rgba(70,50,20,.55)';
    ctx.lineWidth=1;
    for(var i=0;i<9;i++){
      var p=pad+i*cell;
      ctx.beginPath();ctx.moveTo(pad,p);ctx.lineTo(W-pad,p);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p,pad);ctx.lineTo(p,H-pad);ctx.stroke();
    }
    var stars=[[2,2],[6,2],[2,6],[6,6],[4,4]];
    ctx.fillStyle='rgba(70,50,20,.75)';
    for(var k=0;k<stars.length;k++){
      var sx=pad+stars[k][0]*cell,sy=pad+stars[k][1]*cell;
      ctx.beginPath();ctx.arc(sx,sy,2.5,0,Math.PI*2);ctx.fill();
    }
  }
  function drawInkStone(gx,gy,color,phase){
    var cx=pad+gx*cell,cy=pad+gy*cell;
    var maxR=cell*0.44;
    var r=maxR*Math.min(1,phase*1.6);
    var haloR=maxR*(1+phase*0.7);
    var haloA=Math.max(0,0.22-phase*0.22);
    ctx.beginPath();
    var grad0=ctx.createRadialGradient(cx,cy,0,cx,cy,haloR);
    grad0.addColorStop(0,'rgba(30,20,10,'+haloA+')');
    grad0.addColorStop(1,'rgba(30,20,10,0)');
    ctx.fillStyle=grad0;
    ctx.arc(cx,cy,haloR,0,Math.PI*2);ctx.fill();
    var grad=ctx.createRadialGradient(cx-r*0.3,cy-r*0.3,r*0.1,cx,cy,r);
    if(color==='B'){
      grad.addColorStop(0,'#4a4a4a');grad.addColorStop(1,'#0a0a0a');
    }else{
      grad.addColorStop(0,'#ffffff');grad.addColorStop(1,'#c9c1a8');
    }
    ctx.beginPath();ctx.fillStyle=grad;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
    if(color==='B'){
      ctx.beginPath();ctx.fillStyle='rgba(255,255,255,.35)';
      ctx.arc(cx-r*0.35,cy-r*0.35,r*0.22,0,Math.PI*2);ctx.fill();
    }
  }
  var stones=[
    {gx:4,gy:4,color:'B',t0:0},
    {gx:5,gy:3,color:'W',t0:350},
    {gx:3,gy:4,color:'B',t0:700},
    {gx:5,gy:5,color:'W',t0:1050},
    {gx:4,gy:2,color:'B',t0:1400}
  ];
  var start=performance.now();
  var stopped=false;
  function loop(now){
    if(stopped){return;}
    var t=now-start;
    ctx.clearRect(0,0,W,H);
    drawBoardGrid();
    for(var i=0;i<stones.length;i++){
      var s=stones[i];
      if(t<s.t0){continue;}
      var elapsed=t-s.t0;
      var phase=Math.min(1,elapsed/600);
      drawInkStone(s.gx,s.gy,s.color,phase);
    }
    if(t<2500){requestAnimationFrame(loop);}
    else{finish();}
  }
  function finish(){
    if(stopped){return;}
    stopped=true;
    try{sessionStorage.setItem('luobo_ink_shown','1');}catch(e){}
    mask.classList.add('hide');
    setTimeout(function(){
      if(mask&&mask.parentNode){mask.parentNode.removeChild(mask);}
      var s1=document.getElementById('ink-landing-style');
      if(s1){s1.parentNode.removeChild(s1);}
    },700);
  }
  if(skip){skip.addEventListener('click',finish);}
  requestAnimationFrame(loop);
})();
;
(function(){
  var mask=document.getElementById('hb-mask');
  var cvs=document.getElementById('hb-canvas');
  var toast=document.getElementById('hb-toast');
  if(!mask||!cvs){return;}
  var ctx=cvs.getContext('2d');
  var W=cvs.width,H=cvs.height,N=9,pad=22,cell=(W-pad*2)/(N-1);
  var stones=[];
  var turn='B';
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(70,50,20,.65)';ctx.lineWidth=1;
    for(var i=0;i<N;i++){
      var p=pad+i*cell;
      ctx.beginPath();ctx.moveTo(pad,p);ctx.lineTo(W-pad,p);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p,pad);ctx.lineTo(p,H-pad);ctx.stroke();
    }
    ctx.fillStyle='rgba(70,50,20,.8)';
    var stars=[[2,2],[6,2],[2,6],[6,6],[4,4]];
    for(var k=0;k<stars.length;k++){
      var sx=pad+stars[k][0]*cell,sy=pad+stars[k][1]*cell;
      ctx.beginPath();ctx.arc(sx,sy,2.6,0,Math.PI*2);ctx.fill();
    }
    var r=cell*0.42;
    for(var s=0;s<stones.length;s++){
      var st=stones[s],cx=pad+st.x*cell,cy=pad+st.y*cell;
      var g=ctx.createRadialGradient(cx-r*0.3,cy-r*0.3,r*0.1,cx,cy,r);
      if(st.c==='B'){g.addColorStop(0,'#555');g.addColorStop(1,'#080808');}
      else{g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8bfa2');}
      ctx.beginPath();ctx.fillStyle=g;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=.6;ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
      if(s===stones.length-1){
        ctx.beginPath();ctx.strokeStyle=st.c==='B'?'rgba(255,80,80,.9)':'rgba(200,60,60,.85)';ctx.lineWidth=1.6;
        ctx.arc(cx,cy,r*0.35,0,Math.PI*2);ctx.stroke();
      }
    }
    var dot=document.getElementById('hb-turn-dot');
    var txt=document.getElementById('hb-turn-text');
    var cnt=document.getElementById('hb-move-count');
    if(dot){dot.style.background=(turn==='B')?'#111':'#fff';}
    if(txt){txt.innerHTML=(turn==='B')?'\u9ed1\u65b9\u6765\u4e86':'\u767d\u65b9\u6765\u4e86';}
    if(cnt){cnt.textContent=stones.length;}
  }
  function onClick(e){
    var rect=cvs.getBoundingClientRect();
    var scale=cvs.width/rect.width;
    var mx=(e.clientX-rect.left)*scale,my=(e.clientY-rect.top)*scale;
    var gx=Math.round((mx-pad)/cell),gy=Math.round((my-pad)/cell);
    if(gx<0||gx>N-1||gy<0||gy>N-1){return;}
    for(var i=0;i<stones.length;i++){if(stones[i].x===gx&&stones[i].y===gy){return;}}
    stones.push({x:gx,y:gy,c:turn});
    turn=(turn==='B')?'W':'B';
    draw();
  }
  function undo(){if(stones.length){stones.pop();turn=(turn==='B')?'W':'B';draw();}}
  function clearAll(){stones=[];turn='B';draw();}
  function showToast(){toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1600);}
  function open(){mask.classList.add('show');mask.setAttribute('aria-hidden','false');draw();showToast();}
  function close(){mask.classList.remove('show');mask.setAttribute('aria-hidden','true');}
  cvs.addEventListener('click',onClick);
  document.getElementById('hb-undo').addEventListener('click',undo);
  document.getElementById('hb-clear').addEventListener('click',clearAll);
  document.getElementById('hb-close-btn').addEventListener('click',close);
  mask.addEventListener('click',function(e){if(e.target===mask){close();}});
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&e.altKey&&(e.key==='g'||e.key==='G')){e.preventDefault();open();}
    else if(e.key==='Escape'&&mask.classList.contains('show')){close();}
  });
  window.__luoboOpenPocketBoard=open;
})();
;
(function(){
  var MASTERS={"wuqingyuan": {"name": "吴清源", "alias": "昭和棋圣", "keys": ["新布局", "六合", "革新"], "intro": "从福建到日本的天才棋手。他与木谷实创立的新布局理论，彻底颠覆了三三小目的传统开局；晚年提出\"六合\"理念，追求棋盘上的整体和谐。", "style": "大局观 · 开创性 · 不拘定式", "action": "你天生有战略家的气质，欢迎来聊聊你对\"棋无定式\"的理解。"}, "lichanghao": {"name": "李昌镐", "alias": "石佛 · 半目大师", "keys": ["稳健", "官子", "铁大门"], "intro": "韩国旗手，14 岁夺得世界冠军。棋风像一堵铁大门，官子精准到误差半目之内，被称为\"上帝之子\"。", "style": "稳健派 · 完璧主义 · 精准官子", "action": "稳健派家长最放心的路线，欢迎围观萝卜干的稳扎稳打式教研。"}, "xufengzhu": {"name": "徐奉洙", "alias": "野草派 · 徐坛主", "keys": ["意外", "力战", "韧性"], "intro": "韩国老将，年少不学棋而先打工，20 岁才正式拜师。棋风像野草，烧不尽吹又生；逆境翻盘是他的拿手好戏。", "style": "韧性派 · 逆境王 · 险中求胜", "action": "韧性是一切启蒙的底色，欢迎聊聊怎么让孩子学会\"不放弃\"。"}, "tengzexiuxing": {"name": "藤泽秀行", "alias": "秀行棋圣", "keys": ["洒脱", "灵感", "大师风范"], "intro": "日本传奇棋圣，酒不离手棋不离身。他说过：\"我对棋的了解也不过百分之十\"。豪迈中有诗意，是真正的江湖大师。", "style": "写意派 · 灵感型 · 江湖气度", "action": "真正的启蒙从不紧绷，欢迎和萝卜干聊聊\"放手学棋\"的分寸。"}, "gaochuange": {"name": "高川格", "alias": "流水不争先", "keys": ["流水", "平静", "韧性"], "intro": "日本九段，连续九年蝉联本因坊。他的名言是\"流水不争先\"——像水一样绕过障碍，静静地赢下棋局。", "style": "平静派 · 长跑型 · 不争而胜", "action": "不争一时的家长最难得，欢迎聊聊怎么让孩子在慢中出彩。"}, "wugongzhengshu": {"name": "武宫正树", "alias": "宇宙流", "keys": ["外势", "浪漫", "大模样"], "intro": "日本九段，独创\"宇宙流\"——不占实地，专筑外势。他的每一盘棋都像一幅画，宏大而浪漫。", "style": "浪漫派 · 大模样 · 审美优先", "action": "审美派家长最喜欢，欢迎聊聊怎么让孩子学出\"美感\"。"}, "caoxunxuan": {"name": "曹薰铉", "alias": "燕子飞刀", "keys": ["战斗", "快棋", "锐利"], "intro": "韩国现代围棋之父，快棋战神。他的棋短兵相接，出手迅捷如燕；是李昌镐的启蒙老师。", "style": "战斗派 · 快棋型 · 锐利凌厉", "action": "竞技家长最认可的路线，欢迎聊聊怎么在实战中稳步提高。"}, "maxiaochun": {"name": "马晓春", "alias": "中国妖刀", "keys": ["妖刀", "灵动", "艺术"], "intro": "第一位夺得世界冠军的中国棋手。棋风灵动如刀，每盘都能下出一两个惊人的妙手，是艺术家型的棋手。", "style": "艺术派 · 灵动型 · 妙手频现", "action": "艺术家型家长最偏爱，欢迎聊聊怎么让孩子下出\"灵光\"。"}};
  var QUESTIONS=[{"q": "你偏爱的开局风格是？", "opts": [["先占大场，简明扎实", "lichanghao"], ["追求外势的浪漫铺陈", "wugongzhengshu"], ["突破定式的新布局思路", "wuqingyuan"], ["随手拈来，先看对手反应", "tengzexiuxing"]]}, {"q": "面对不利局面，你的第一反应是？", "opts": [["稳住阵脚，等对手犯错", "gaochuange"], ["拼一次，野火也能烧出生机", "xufengzhu"], ["换一个大局思路重新定盘", "wuqingyuan"], ["用一手妖刀翻盘", "maxiaochun"]]}, {"q": "你最欣赏的对局是？", "opts": [["一子撑起半盘大势", "wugongzhengshu"], ["中盘一击定江山", "caoxunxuan"], ["布局深远，从容不迫", "gaochuange"], ["险中求胜的一击", "xufengzhu"]]}, {"q": "学棋方式你更倾向于？", "opts": [["反复复盘经典名局", "maxiaochun"], ["大量实战积累经验", "caoxunxuan"], ["研究布局革新的思路", "wuqingyuan"], ["观棋千局，感悟为主", "tengzexiuxing"]]}, {"q": "你最喜欢的一手棋是？", "opts": [["意料之外的妖刀", "maxiaochun"], ["一子成模的宇宙外势", "wugongzhengshu"], ["精准无双的官子", "lichanghao"], ["犀利凌厉的攻杀", "caoxunxuan"]]}, {"q": "你的性格底色更像？", "opts": [["沉稳内敛，凡事求稳", "lichanghao"], ["韧性顽强，逆境不服", "xufengzhu"], ["洒脱写意，随心所欲", "tengzexiuxing"], ["平和淡然，如水行山", "gaochuange"]]}, {"q": "你希望自己下棋像谁？", "opts": [["一手定乾坤的战略家", "wuqingyuan"], ["一子铸就大势的浪漫派", "wugongzhengshu"], ["兵行险着的野草派", "xufengzhu"], ["一子含花的艺术家", "maxiaochun"]]}, {"q": "关于胜负，你更认可？", "opts": [["半目胜也是完美", "lichanghao"], ["一战决出高下", "caoxunxuan"], ["平和落子，不争先亦不失后", "gaochuange"], ["顺其自然，赢了也无所谓", "tengzexiuxing"]]}];
  var CONTACT_WX='yxwq0909';
  var mask=document.getElementById('quiz-mask');
  var body=document.getElementById('quiz-body');
  var closeBtn=document.getElementById('q-close');
  if(!mask||!body){return;}
  var idx=0;
  var scores={};
  function reset(){idx=0;scores={};for(var k in MASTERS){scores[k]=0;}}
  function open(){reset();renderQ();mask.classList.add('show');mask.setAttribute('aria-hidden','false');}
  function close(){mask.classList.remove('show');mask.setAttribute('aria-hidden','true');}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function renderQ(){
    var q=QUESTIONS[idx];
    var pct=Math.round((idx/QUESTIONS.length)*100);
    var html='<div class="q-head"><div class="q-title">&#20320;&#26159;&#21738;&#20301;&#26827;&#25163;&#65311;</div><div class="q-subtitle">8&#38788;&#23567;&#39064; &middot; &#25214;&#21040;&#20320;&#30340;&#26827;&#39118;&#22823;&#24072;</div></div>';
    html+='<div class="q-progress"><div class="q-progress-bar" style="width:'+pct+'%"></div></div>';
    html+='<div class="q-num">Q'+(idx+1)+' / '+QUESTIONS.length+'</div>';
    html+='<div class="q-question">'+esc(q.q)+'</div>';
    html+='<div class="q-opts">';
    for(var i=0;i<q.opts.length;i++){
      html+='<button class="q-opt" data-mid="'+q.opts[i][1]+'">'+esc(q.opts[i][0])+'</button>';
    }
    html+='</div>';
    body.innerHTML=html;
    var opts=body.querySelectorAll('.q-opt');
    for(var j=0;j<opts.length;j++){
      opts[j].addEventListener('click',function(e){
        var mid=e.currentTarget.getAttribute('data-mid');
        scores[mid]=(scores[mid]||0)+1;
        idx++;
        if(idx>=QUESTIONS.length){renderResult();}else{renderQ();}
      });
    }
  }
  function pickWinner(){
    var best=null,bestScore=-1;
    for(var k in scores){if(scores[k]>bestScore){bestScore=scores[k];best=k;}}
    return best;
  }
  function renderResult(){
    var mid=pickWinner();
    var m=MASTERS[mid];
    var html='<div class="q-head"><div class="q-result-title">&#20320;&#26159;&#8230;&#8230;</div><div class="q-result-name">'+esc(m.name)+'</div><div class="q-result-alias">'+esc(m.alias)+'</div></div>';
    html+='<div class="q-result-keys">';
    for(var i=0;i<m.keys.length;i++){html+='<span class="q-key">'+esc(m.keys[i])+'</span>';}
    html+='</div>';
    html+='<div class="q-result-intro">'+esc(m.intro)+'</div>';
    html+='<div class="q-result-style">&#26827;&#39118;&#65306;'+esc(m.style)+'</div>';
    html+='<div class="q-result-action">'+esc(m.action)+'</div>';
    html+='<div class="q-cta"><div class="q-cta-text">&#33832;&#21340;&#24178;&#22260;&#26827;&#25945;&#32946; &middot; &#25307;&#29983;&#20808;&#28155;&#28216;&#25103;&#21592;&#24494;&#20449;</div><div class="q-cta-wx">'+CONTACT_WX+'</div></div>';
    html+='<div class="q-btns"><button class="q-btn" id="q-again">&#37325;&#26469;&#19968;&#27425;</button><button class="q-btn q-primary" id="q-share">&#29983;&#25104;&#20998;&#20139;&#22270;</button></div>';
    body.innerHTML=html;
    document.getElementById('q-again').addEventListener('click',function(){reset();renderQ();});
    document.getElementById('q-share').addEventListener('click',function(){makeShareImage(m);});
  }
  function makeShareImage(m){
    var cvs=document.createElement('canvas');
    cvs.width=720;cvs.height=1080;
    var ctx=cvs.getContext('2d');
    var g=ctx.createLinearGradient(0,0,720,1080);
    g.addColorStop(0,'#faf1d8');g.addColorStop(1,'#e8d29a');
    ctx.fillStyle=g;ctx.fillRect(0,0,720,1080);
    ctx.strokeStyle='rgba(120,90,50,.35)';ctx.lineWidth=2;
    ctx.strokeRect(28,28,720-56,1080-56);
    ctx.fillStyle='#8a5a20';ctx.font='24px "KaiTi","STKaiti",serif';
    ctx.textAlign='center';
    ctx.fillText('\u4f60\u662f\u54ea\u4f4d\u68cb\u624b',360,110);
    ctx.font='16px "KaiTi","STKaiti",serif';
    ctx.fillStyle='#8a7042';
    ctx.fillText('8\u9053\u5c0f\u9898 \u00b7 \u627e\u5230\u4f60\u7684\u68cb\u98ce\u5927\u5e08',360,140);
    ctx.font='14px "KaiTi",serif';ctx.fillStyle='#7a5a20';
    ctx.fillText('\u4f60\u662f\u2026\u2026',360,220);
    ctx.font='bold 72px "KaiTi","STKaiti",serif';ctx.fillStyle='#3a2a10';
    ctx.fillText(m.name,360,310);
    ctx.font='20px "KaiTi",serif';ctx.fillStyle='#8a5a20';
    ctx.fillText(m.alias,360,350);
    var keysX=360,keysY=410;
    ctx.font='16px "KaiTi",serif';
    var totalW=0,gaps=[];
    for(var i=0;i<m.keys.length;i++){
      var w=ctx.measureText(m.keys[i]).width+30;
      gaps.push(w);totalW+=w;
    }
    totalW+=(m.keys.length-1)*10;
    var startX=(720-totalW)/2;
    for(var j=0;j<m.keys.length;j++){
      ctx.fillStyle='rgba(196,139,58,.2)';
      ctx.strokeStyle='rgba(196,139,58,.55)';
      ctx.beginPath();
      var w2=gaps[j];
      ctx.roundRect?ctx.roundRect(startX,keysY-20,w2,32,16):ctx.rect(startX,keysY-20,w2,32);
      ctx.fill();ctx.stroke();
      ctx.fillStyle='#7a4a10';
      ctx.textAlign='center';
      ctx.fillText(m.keys[j],startX+w2/2,keysY);
      startX+=w2+10;
    }
    ctx.font='18px "KaiTi",serif';ctx.fillStyle='#4a3a20';
    ctx.textAlign='center';
    var lines=wrap(ctx,m.intro,600);
    var y=490;
    for(var k=0;k<lines.length;k++){ctx.fillText(lines[k],360,y);y+=30;}
    y+=20;
    ctx.font='16px "KaiTi",serif';ctx.fillStyle='#8a5a20';
    ctx.fillText('\u68cb\u98ce: '+m.style,360,y);y+=44;
    ctx.font='16px "KaiTi",serif';ctx.fillStyle='#5a3a10';
    var alines=wrap(ctx,m.action,600);
    for(var q=0;q<alines.length;q++){ctx.fillText(alines[q],360,y);y+=28;}
    ctx.font='14px "KaiTi",serif';ctx.fillStyle='#8a7042';
    ctx.fillText('\u2015\u2015 \u841d\u535c\u5e72\u56f4\u68cb\u6559\u80b2 \u00b7 \u542f\u8499\u4e13\u7532 \u2015\u2015',360,980);
    ctx.font='bold 20px "KaiTi",serif';ctx.fillStyle='#3a2a10';
    ctx.fillText('\u5fae\u4fe1: '+CONTACT_WX,360,1020);
    window.__luoboShareImage(cvs, 'luobo_go_quiz_'+m.name+'.png');
  }
  function wrap(ctx,text,maxW){
    var out=[],cur='';
    for(var i=0;i<text.length;i++){
      var t=cur+text[i];
      if(ctx.measureText(t).width>maxW){out.push(cur);cur=text[i];}
      else{cur=t;}
    }
    if(cur){out.push(cur);}
    return out;
  }
  launcher_stub_removed:true;
  closeBtn.addEventListener('click',close);
  mask.addEventListener('click',function(e){if(e.target===mask){close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('show')){close();}});
  window.__luoboOpenQuiz=open;
})();
;
(function(){
  var EPOCHS_MEN=[["spring", "春秋战国"], ["tang", "唐宋"], ["qingzao", "清初"], ["qingzhong", "清中"], ["minguo", "民国"], ["early20", "20世纪前半"], ["late20", "20世纪后半"], ["modern", "当代"]];
  var EPOCHS_WOMEN=[["early20", "20世纪前半"], ["late20", "20世纪后半"], ["modern", "当代"]];
  var REGIONS=[["CN", "中"], ["JP", "日"], ["KR", "韩"]];
  var MASTERS_MEN=[{"name": "弈秋", "ep": "spring", "region": "CN", "color": "B", "brief": "春秋时期国手，孟子笔下\"通国之善弈者\"。"}, {"name": "王积薪", "ep": "tang", "region": "CN", "color": "B", "brief": "盛唐棋待诏，\"围棋十诀\"传世千载。"}, {"name": "黄龙士", "ep": "qingzao", "region": "CN", "color": "B", "brief": "清初\"十四圣\"之一，出神入化的少年国手。"}, {"name": "范西屏", "ep": "qingzhong", "region": "CN", "color": "B", "brief": "清乾隆年间\"双子星\"之一，气势磅礴。"}, {"name": "施襄夏", "ep": "qingzhong", "region": "CN", "color": "W", "brief": "与范西屏合称\"当湖十局\"双绝，官子入圣。"}, {"name": "顾水如", "ep": "minguo", "region": "CN", "color": "B", "brief": "民国国手，中国近代围棋启蒙先驱。"}, {"name": "过惕生", "ep": "minguo", "region": "CN", "color": "W", "brief": "新中国围棋教父之一，聂卫平的启蒙恩师。"}, {"name": "陈祖德", "ep": "late20", "region": "CN", "color": "B", "brief": "首破日本九段的中国棋手，中国围棋事业奠基人。"}, {"name": "聂卫平", "ep": "late20", "region": "CN", "color": "W", "brief": "中日擂台赛\"棋圣\"，凝聚一个时代的民族记忆。"}, {"name": "马晓春", "ep": "late20", "region": "CN", "color": "B", "brief": "中国首位世界冠军，\"妖刀\"般的灵动棋风。"}, {"name": "古力", "ep": "late20", "region": "CN", "color": "W", "brief": "八冠王，21 世纪初中国围棋领军人物。"}, {"name": "柯洁", "ep": "modern", "region": "CN", "color": "B", "brief": "90 后世界冠军新王，围棋 AI 时代的坚守者。"}, {"name": "常昊", "ep": "modern", "region": "CN", "color": "W", "brief": "应氏杯、春兰杯冠军，坚韧稳健的\"农心杯八连胜\"。"}, {"name": "本因坊道策", "ep": "qingzao", "region": "JP", "color": "W", "brief": "江户前期围棋名人，\"棋圣\"称号首人。"}, {"name": "本因坊丈和", "ep": "qingzhong", "region": "JP", "color": "W", "brief": "江户后期名人棋所，\"三英杰\"之一。"}, {"name": "本因坊秀策", "ep": "qingzhong", "region": "JP", "color": "B", "brief": "江户末期\"棋圣\"，御城棋十九连胜，秀策流布局传世。"}, {"name": "吴清源", "ep": "early20", "region": "JP", "color": "B", "brief": "昭和棋圣，与木谷实共创\"新布局\"理论。"}, {"name": "高川格", "ep": "early20", "region": "JP", "color": "W", "brief": "连续九年蝉联本因坊，\"流水不争先\"。"}, {"name": "坂田荣男", "ep": "late20", "region": "JP", "color": "B", "brief": "20 世纪日本第一人，\"剃刀\"般的攻防大师。"}, {"name": "小林光一", "ep": "late20", "region": "JP", "color": "W", "brief": "八连霸名人，日本\"六超\"时代的定石之王。"}, {"name": "井山裕太", "ep": "modern", "region": "JP", "color": "B", "brief": "日本首位七冠王，当代日本围棋第一人。"}, {"name": "曹薰铉", "ep": "late20", "region": "KR", "color": "B", "brief": "韩国现代围棋之父，\"燕子飞刀\"般的快棋战神。"}, {"name": "徐奉洙", "ep": "late20", "region": "KR", "color": "W", "brief": "韩国\"野草派\"老将，逆境翻盘的代名词。"}, {"name": "李昌镐", "ep": "late20", "region": "KR", "color": "B", "brief": "\"石佛\"般冷静，官子精准到误差半目之内。"}, {"name": "朴廷桓", "ep": "modern", "region": "KR", "color": "W", "brief": "韩国 90 后领军人，多次问鼎世界大赛。"}, {"name": "申真谞", "ep": "modern", "region": "KR", "color": "B", "brief": "\"申工智能\"，与 AI 契合度极高的当代第一人。"}];
  var MASTERS_WOMEN=[{"name": "芮乃伟", "ep": "late20", "region": "CN", "color": "B", "brief": "中国首位女子九段，跨越三国的女子第一人。"}, {"name": "张璇", "ep": "late20", "region": "CN", "color": "W", "brief": "新中国自主培养的女子九段，稳健厚重的国内领军。"}, {"name": "华学明", "ep": "late20", "region": "CN", "color": "B", "brief": "国家围棋队领队，桃李满门的女子教练代表。"}, {"name": "於之莹", "ep": "modern", "region": "CN", "color": "W", "brief": "女子建桥杯八连霸，中国女子第一人。"}, {"name": "王晨星", "ep": "modern", "region": "CN", "color": "B", "brief": "世界女子锦标赛冠军，稳健厚重的中生代女将。"}, {"name": "周泓余", "ep": "modern", "region": "CN", "color": "W", "brief": "00 后女子世界冠军，中国女子当代最活跃的执棋人。"}, {"name": "杉内寿子", "ep": "early20", "region": "JP", "color": "W", "brief": "昭和至令和的\"活棋圣\"，逾九十岁仍执子的传奇。"}, {"name": "谢依旻", "ep": "modern", "region": "JP", "color": "B", "brief": "台湾出身的日本女流四冠，多年蝉联女流第一。"}, {"name": "藤泽里菜", "ep": "modern", "region": "JP", "color": "W", "brief": "藤泽秀行之孙，女流首位 800 胜的四冠王。"}, {"name": "尹映善", "ep": "late20", "region": "KR", "color": "B", "brief": "韩国首位女子九段，早期女子围棋的奠基者。"}, {"name": "崔精", "ep": "modern", "region": "KR", "color": "W", "brief": "韩国女子第一人，女流三大天王级世界冠军。"}, {"name": "吴侑珍", "ep": "modern", "region": "KR", "color": "B", "brief": "韩国新生代女子九段，世界女子锦标赛冠军。"}];
  var TAB_META={
    men:  {title:"中日韩大师星图",   subtitle:"26 位棋手 \u00b7 2500 年时光 \u00b7 悬停看简介 \u00b7 点击跳阅文章", data:MASTERS_MEN,   epochs:EPOCHS_MEN},
    women:{title:"围棋巾帼 \u00b7 女子星图", subtitle:"12 位女棋手 \u00b7 生平与成绩 \u00b7 悬停看简介 \u00b7 点击跳阅文章", data:MASTERS_WOMEN, epochs:EPOCHS_WOMEN}
  };
  var mask=document.getElementById('mm-mask');
  var closeBtn=document.getElementById('mm-close');
  var wrap=document.getElementById('mm-svg-wrap');
  var tip=document.getElementById('mm-tip');
  var titleEl=document.getElementById('mm-title');
  var subEl=document.getElementById('mm-subtitle');
  var autoTag=document.getElementById('mm-auto-tag');
  var tabBtns=document.querySelectorAll('#mm-panel .mm-tab');
  if(!mask||!wrap){return;}
  var currentTab='men';
  var autoTimer=null;
  var AUTO_INTERVAL=3000;
  function xOf(ep, epochs, padL, colW){for(var i=0;i<epochs.length;i++){if(epochs[i][0]===ep){return padL+colW*i+colW/2;}}return padL;}
  function yOf(region, padT, rowH){for(var i=0;i<REGIONS.length;i++){if(REGIONS[i][0]===region){return padT+rowH*i+rowH/2;}}return padT;}
  function grouped(dataset){
    var g={};
    for(var i=0;i<dataset.length;i++){
      var m=dataset[i];
      var key=m.ep+'_'+m.region;
      if(!g[key]){g[key]=[];}
      g[key].push(m);
    }
    return g;
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function buildSVG(dataset, epochs){
    var W=1180,H=460,padL=90,padR=30,padT=44,padB=44;
    var colW=(W-padL-padR)/epochs.length;
    var rowH=(H-padT-padB)/REGIONS.length;
    var svgHead='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">';
    var parts=[svgHead];
    parts.push('<defs>');
    parts.push('<radialGradient id="mm-b" cx="30%" cy="30%" r="60%"><stop offset="0%" stop-color="#5a5a5a"/><stop offset="100%" stop-color="#080808"/></radialGradient>');
    parts.push('<radialGradient id="mm-w" cx="30%" cy="30%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#c8bfa2"/></radialGradient>');
    parts.push('</defs>');
    for(var r=0;r<REGIONS.length;r++){
      var yLine=padT+rowH*r+rowH/2;
      parts.push('<line x1="'+padL+'" y1="'+yLine+'" x2="'+(W-padR)+'" y2="'+yLine+'" stroke="rgba(120,90,50,.22)" stroke-width="1" stroke-dasharray="4 4"/>');
      parts.push('<text x="'+(padL-14)+'" y="'+(yLine+5)+'" font-size="16" fill="#5a4a20" text-anchor="end" font-family="KaiTi,STKaiti,serif" letter-spacing="4">'+esc(REGIONS[r][1])+'</text>');
    }
    for(var e=0;e<epochs.length;e++){
      var xLabel=padL+colW*e+colW/2;
      parts.push('<text x="'+xLabel+'" y="'+(padT-16)+'" font-size="11.5" fill="#7a5a20" text-anchor="middle" font-family="KaiTi,serif" letter-spacing="2">'+esc(epochs[e][1])+'</text>');
      parts.push('<line x1="'+xLabel+'" y1="'+(padT-8)+'" x2="'+xLabel+'" y2="'+(H-padB+4)+'" stroke="rgba(120,90,50,.1)" stroke-width="1"/>');
    }
    parts.push('<line x1="'+padL+'" y1="'+(H-padB)+'" x2="'+(W-padR)+'" y2="'+(H-padB)+'" stroke="rgba(120,90,50,.5)" stroke-width="1.2"/>');
    parts.push('<text x="'+(W/2)+'" y="'+(H-padB+26)+'" font-size="12" fill="#8a7042" text-anchor="middle" font-family="KaiTi,serif" letter-spacing="4">&#8592; &#26102;&#20195; &#8594;</text>');
    var g=grouped(dataset);
    for(var k in g){
      var arr=g[k];
      var count=arr.length;
      for(var i=0;i<count;i++){
        var m=arr[i];
        var cx=xOf(m.ep, epochs, padL, colW);
        var cy=yOf(m.region, padT, rowH);
        if(count>1){
          var stepDot=32;
          var totalW2=(count-1)*stepDot;
          cx=cx-totalW2/2+i*stepDot;
        }
        var fill=(m.color==='B')?'url(#mm-b)':'url(#mm-w)';
        var strokeC=(m.color==='B')?'#000':'#8a6a3a';
        parts.push('<g class="mm-node" data-name="'+esc(m.name)+'" data-brief="'+esc(m.brief)+'">');
        // v3.13 fix13 · 透明大热区（覆盖 circle 与上下 label），避免点击死角
        parts.push('<rect x="'+(cx-24)+'" y="'+(cy-28)+'" width="48" height="68" fill="transparent" pointer-events="all"/>');
        parts.push('<circle cx="'+cx+'" cy="'+cy+'" r="12" fill="'+fill+'" stroke="'+strokeC+'" stroke-width="1"/>');
        // fix11 · 名字上下错落：黑子名字放棋子上方（浅色配深描边·衬棋盘背景），白子名字放棋子下方（深色加粗），字号 10.5→12，加粗更显眼
        if(m.color==='B'){
          parts.push('<text x="'+cx+'" y="'+(cy-18)+'" font-size="12" fill="#2a1a08" stroke="#faf3dc" stroke-width="2.5" paint-order="stroke" font-weight="700" text-anchor="middle" font-family="KaiTi,STKaiti,serif" letter-spacing="1">'+esc(m.name)+'</text>');
        }else{
          parts.push('<text x="'+cx+'" y="'+(cy+32)+'" font-size="12" fill="#2a1a08" stroke="#faf3dc" stroke-width="2.5" paint-order="stroke" font-weight="700" text-anchor="middle" font-family="KaiTi,STKaiti,serif" letter-spacing="1">'+esc(m.name)+'</text>');
        }
        parts.push('</g>');
      }
    }
    parts.push('</svg>');
    return parts.join('');
  }
  function renderTab(tabKey, animate){
    var meta=TAB_META[tabKey]||TAB_META.men;
    if(animate){
      wrap.classList.add('fading');
      setTimeout(function(){
        wrap.innerHTML=buildSVG(meta.data, meta.epochs);
        titleEl.textContent=meta.title;
        subEl.textContent=meta.subtitle;
        bindNodes();
        wrap.classList.remove('fading');
      }, 180);
    }else{
      wrap.innerHTML=buildSVG(meta.data, meta.epochs);
      titleEl.textContent=meta.title;
      subEl.textContent=meta.subtitle;
      bindNodes();
    }
    // 更新 tab 按钮 active 状态
    for(var i=0;i<tabBtns.length;i++){
      var b=tabBtns[i];
      if(b.getAttribute('data-tab')===tabKey){b.classList.add('active');}
      else{b.classList.remove('active');}
    }
    currentTab=tabKey;
  }
  function bindNodes(){
    var nodes=wrap.querySelectorAll('.mm-node');
    for(var i=0;i<nodes.length;i++){
      nodes[i].addEventListener('mouseenter',function(e){
        var name=e.currentTarget.getAttribute('data-name');
        var brief=e.currentTarget.getAttribute('data-brief');
        tip.innerHTML='<div class="mm-tip-name">'+name+'</div><div>'+brief+'</div>';
        tip.classList.add('show');
      });
      nodes[i].addEventListener('mousemove',function(e){
        var panelRect=document.getElementById('mm-panel').getBoundingClientRect();
        var x=e.clientX-panelRect.left+14;
        var y=e.clientY-panelRect.top+14;
        var tipRect=tip.getBoundingClientRect();
        if(x+tipRect.width>panelRect.width-10){x=e.clientX-panelRect.left-tipRect.width-14;}
        tip.style.left=x+'px';
        tip.style.top=y+'px';
      });
      nodes[i].addEventListener('mouseleave',function(){tip.classList.remove('show');});
      nodes[i].addEventListener('click',function(e){
        var name=e.currentTarget.getAttribute('data-name');
        console.log('[mm-node click]', name);
        jumpTo(name);
      });
      // v3.13 fix13 · 追加 touchend 事件，规避移动端 hover 抢占 click
      nodes[i].addEventListener('touchend',function(e){
        e.preventDefault();
        var name=e.currentTarget.getAttribute('data-name');
        console.log('[mm-node touchend]', name);
        jumpTo(name);
      },{passive:false});
    }
  }
  function jumpTo(name){
    // v3.11 fix7：优先调用主页暴露的 CULTURE_DATA 两级匹配跳转钩子
    if(typeof window.__luoboJumpToMaster==='function'){
      try{
        var ok=window.__luoboJumpToMaster(name);
        if(ok){close();return;}
      }catch(e){}
    }
    // fallback：旧版 DOM 精确匹配（保留兼容）
    var candidates=document.querySelectorAll('[data-person],[data-person-name],.person-card,.person,.people-card');
    var found=null;
    for(var i=0;i<candidates.length;i++){
      var el=candidates[i];
      var attr=el.getAttribute('data-person')||el.getAttribute('data-person-name')||'';
      if(attr.indexOf(name)>-1||(el.textContent||'').indexOf(name)>-1){found=el;break;}
    }
    if(!found){
      var all=document.querySelectorAll('h1,h2,h3,h4,.card-title,.person-name,strong,b');
      for(var j=0;j<all.length;j++){
        if((all[j].textContent||'').indexOf(name)===0||(all[j].textContent||'').trim()===name){found=all[j];break;}
      }
    }
    if(found){
      close();
      setTimeout(function(){
        found.scrollIntoView({behavior:'smooth',block:'center'});
        var orig=found.style.transition;
        var origBg=found.style.background;
        found.style.transition='background .5s ease';
        found.style.background='rgba(196,139,58,.35)';
        setTimeout(function(){found.style.background=origBg||'';found.style.transition=orig||'';},1800);
      },400);
    }else{
      alert(name+'\n\n'+(getBriefByName(name)||'')+'\n\n(&#26410;&#25214;&#21040;&#23545;&#24212;&#25991;&#31456;&#65292;&#35831;&#21040;&#22260;&#26827;&#25991;&#21270;&#26495;&#22359;&#25214;&#25214;)');
    }
  }
  function getBriefByName(name){
    var all=MASTERS_MEN.concat(MASTERS_WOMEN);
    for(var i=0;i<all.length;i++){if(all[i].name===name){return all[i].brief;}}
    return '';
  }
  function startAuto(){
    stopAuto();
    autoTag.classList.remove('hide');
    autoTag.textContent='\u81ea\u52a8\u8f6e\u64ad\u4e2d \u00b7 \u70b9\u51fb tab \u5207\u6362\u624b\u52a8';
    autoTimer=setInterval(function(){
      var next=(currentTab==='men')?'women':'men';
      renderTab(next, true);
    }, AUTO_INTERVAL);
  }
  function stopAuto(){
    if(autoTimer){clearInterval(autoTimer);autoTimer=null;}
  }
  function switchToManual(tabKey){
    stopAuto();
    autoTag.textContent='\u624b\u52a8\u6a21\u5f0f \u00b7 \u5df2\u505c\u81ea\u52a8\u8f6e\u64ad';
    renderTab(tabKey, true);
  }
  // 绑定 tab 按钮点击
  for(var t=0;t<tabBtns.length;t++){
    (function(btn){
      btn.addEventListener('click',function(){
        var key=btn.getAttribute('data-tab');
        if(key===currentTab && !autoTimer){return;}
        switchToManual(key);
      });
    })(tabBtns[t]);
  }
  function open(){
    renderTab('men', false);
    mask.classList.add('show');
    mask.setAttribute('aria-hidden','false');
    startAuto();
  }
  function close(){
    mask.classList.remove('show');
    mask.setAttribute('aria-hidden','true');
    stopAuto();
  }
  closeBtn.addEventListener('click',close);
  mask.addEventListener('click',function(e){if(e.target===mask){close();}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mask.classList.contains('show')){close();}});
  window.__luoboOpenMasterMap=open;
})();
;
// ===== 六期：每日棋事簿按需加载 =====
// 原 813 行模块(含 QUOTES/DAILY_SIGN/LUCK_SIGNS ~60KB 内联数据)拆到 daily-ritual-lazy.js
// 首次点击"每日棋事簿"时拉取，后续调用走已加载的真实函数
(function(){
  var loaded = false;
  window.__luoboOpenDailyRitual = function(tab){
    if(loaded){ return; }
    window.__luoboLoadScript('/assets/js/daily-ritual-lazy.js').then(function(){
      loaded = true;
      window.__luoboOpenDailyRitual(tab);
    }).catch(function(){});
  };
})();
;
/* ===== v3.14 fix14 · 白子下方 label 深字光晕 + 每日棋事簿重置 ===== */
/* ===== v3.14 fix14 · 每日棋事簿一键重置（?reset_daily=1）===== */
(function(){
  try{
    var qs = (location.search||'').toLowerCase();
    if (qs.indexOf('reset_daily=1') < 0) return;
    var KEYS = [
      'luobo_days','luobo_teacher_config','luobo_luck_today',
      'luobo_last_style','luobo_last_teacher_ids','luobo_checkin_today',
      '_lbg_msg_ts','luobo_ink_shown'
    ];
    for (var i=0;i<KEYS.length;i++){
      try{ localStorage.removeItem(KEYS[i]); }catch(e){}
      try{ sessionStorage.removeItem(KEYS[i]); }catch(e){}
    }
    // 备用清扫：删除所有以 luobo_ 开头的历史 key
    try{
      var toDel = [];
      for (var j=0;j<localStorage.length;j++){
        var k = localStorage.key(j);
        if (k && (k.indexOf('luobo_')===0 || k.indexOf('_lbg_')===0)) toDel.push(k);
      }
      toDel.forEach(function(k){ localStorage.removeItem(k); });
    }catch(e){}
    console.log('[fix14] 每日棋事簿已重置，将跳回首页刷新状态');
    // 跳回不带参数的 URL（等 500ms 让日志显示）
    setTimeout(function(){
      location.replace(location.origin + location.pathname);
    }, 400);
  }catch(e){ console.warn('[fix14 reset] error:', e); }
})();
;
/* v3.14 fix19 · 大师星图关闭详情后自动复原星图 */
(function(){
  function setup(){
    var _origJump = window.__luoboJumpToMaster;
    if(typeof _origJump === 'function' && !_origJump.__luoboWrapped){
      var wrapped = function(name){
        var ok = _origJump.call(this, name);
        if(ok){ window.__luoboFromMasterMap = true; }
        return ok;
      };
      wrapped.__luoboWrapped = true;
      window.__luoboJumpToMaster = wrapped;
    }
    function bindReturnHook(id){
      var el = document.getElementById(id);
      if(!el || el.__luoboMMReturnBound) return;
      el.__luoboMMReturnBound = true;
      el.addEventListener('click', function(){
        if(window.__luoboFromMasterMap){
          window.__luoboFromMasterMap = false;
          setTimeout(function(){
            if(typeof window.__luoboOpenMasterMap === 'function'){
              window.__luoboOpenMasterMap();
            }
          }, 60);
        }
      });
    }
    ['cul-back-home','cul-back-list','cul-back-list-2'].forEach(bindReturnHook);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
  setTimeout(setup, 500);
  setTimeout(setup, 1500);
})();
;
/* v3.15 fix21 已移至 /assets/js/culture-fix21.js，随围棋文化板块按需加载 */
;
/* 萝卜干官网 · 分享路由 + 动态 SEO + 分享按钮 v1.0
   - hash 路由深链：#culture / #culture/master/曹薰铉 / #tools / #brain / #daily / #master / #quiz
   - 反向写 hash + 动态更新 title/description/og
   - 大师传记页尾部自动注入"复制链接 / 微信 / 微博"分享按钮 */
(function(){
  var SITE_ROOT = 'https://www.weiqiluobogan.com/';
  var DEFAULT_DESC = '多年围棋教学一线，专注少儿围棋教师系统成长与围棋家庭教育。';
  var SECTION_META = {
    'hero':      {t:'萝卜干 · 围棋教育 | 教师成长与围棋家庭教育', d:DEFAULT_DESC},
    'showcase':  {t:'家校共育四书 · 萝卜干围棋教育', d:'家校共育四书：围棋教师成长手册、校长治校指南、家长成长手册、家庭围棋教育手册。'},
    'mission':   {t:'我们做什么 · 萝卜干围棋教育', d:'教师训练营、家长成长、家庭教育、围棋教研。'},
    'culture':   {t:'围棋文化 · 萝卜干围棋教育', d:'围棋历史、大师传记、经典古谱、围棋故事——走进五千年围棋文化。'},
    'tools':     {t:'教学工具箱 · 萝卜干围棋教育', d:'围棋教师、校长、家长、家庭教育——四个角色的实用工具与深度专题。'},
    'brain':     {t:'思维训练室 · 萝卜干围棋教育', d:'围棋思维力训练：7 种脑力训练小工具，家长和孩子一起玩。'},
    'parents':   {t:'家长成长 · 萝卜干围棋教育', d:'孩子学围棋的家长该怎么陪伴——分级家长成长指南。'},
    'teacher':   {t:'教师成长 · 萝卜干围棋教育', d:'围棋教师从入行到独立成师的完整路径。'},
    'teaching':  {t:'教研沙龙 · 萝卜干围棋教育', d:'教学教研、学情反馈、备课资源、专题课程。'},
    'concentration-test': {t:'专注力体验测试 · 萝卜干围棋教育', d:'基于经典 5×5 舒尔特方格的专注力体验测试，与同年龄段常模对比，看看你的视觉搜索速度。'},
    'contact':   {t:'联系我们 · 萝卜干围棋教育', d:'预约咨询、加入我们的家长群和教师训练营。'}
  };

  function updateSeo(title, desc){
    if(title) document.title = title;
    var m = document.querySelector('meta[name="description"]');
    if(m && desc) m.setAttribute('content', desc);
    var og = document.querySelector('meta[property="og:title"]');
    if(og && title) og.setAttribute('content', title);
    var ogd = document.querySelector('meta[property="og:description"]');
    if(ogd && desc) ogd.setAttribute('content', desc);
    var ogu = document.querySelector('meta[property="og:url"]');
    if(ogu) ogu.setAttribute('content', SITE_ROOT + (location.hash||''));
    var lc = document.querySelector('link[rel="canonical"]');
    if(lc) lc.setAttribute('href', SITE_ROOT + (location.hash||''));
  }

  function setHash(h, silent){
    if(location.hash === h) return;
    if(silent) window.__luoboHashSilent = true;
    try { history.replaceState(null, '', h); } catch(e){ location.hash = h; }
  }

  // wrap openSection：打开面板时反向写 hash + 动态 title
  function wrapOpenSection(){
    var _orig = window.openSection;
    if(typeof _orig !== 'function' || _orig.__luoboHashWrapped) return false;
    var wrapped = function(id){
      var r = _orig.apply(this, arguments);
      if(window.__luoboJumpFlag) return r; // 大师跳转过程中，不覆盖 hash
      if(SECTION_META[id]){
        setHash('#'+id, true);
        var m = SECTION_META[id];
        updateSeo(m.t, m.d);
      }
      return r;
    };
    wrapped.__luoboHashWrapped = true;
    window.openSection = wrapped;
    return true;
  }

  // wrap __luoboJumpToMaster：大师传记打开后写 hash + 动态 title
  function wrapJumpToMaster(){
    var _orig = window.__luoboJumpToMaster;
    if(typeof _orig !== 'function' || _orig.__luoboHashWrapped) return false;
    var wrapped = function(name){
      window.__luoboJumpFlag = true;
      var ok = false;
      try { ok = _orig.call(this, name); } finally { window.__luoboJumpFlag = false; }
      if(ok){
        setHash('#culture/master/'+encodeURIComponent(name), true);
        var titleEl = document.getElementById('cul-detail-title');
        var fullTitle = titleEl ? titleEl.textContent : name;
        var t = (fullTitle || name) + ' · 萝卜干围棋教育';
        var d = '走进围棋大师' + name + '的故事——由萝卜干为家长和孩子讲述的围棋人物传记，附「为什么值得讲给孩子」三点点评。';
        setTimeout(function(){ updateSeo(t, d); }, 80);
      }
      return ok;
    };
    wrapped.__luoboHashWrapped = true;
    window.__luoboJumpToMaster = wrapped;
    return true;
  }

  function showToast(msg){
    var t = document.getElementById('luobo-toast-el');
    if(!t){
      t = document.createElement('div');
      t.id = 'luobo-toast-el';
      t.className = 'luobo-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t.__luoboTimer);
    t.__luoboTimer = setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }
  window.showToast = showToast;

  function copyLink(url){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(
        function(){ showToast('链接已复制'); },
        function(){ fallbackCopy(url); }
      );
    } else { fallbackCopy(url); }
  }
  function fallbackCopy(url){
    var i = document.createElement('textarea');
    i.value = url; i.style.position='fixed'; i.style.left='-9999px';
    document.body.appendChild(i); i.select();
    try { document.execCommand('copy'); showToast('链接已复制'); }
    catch(e){ showToast('请手动复制：' + url); }
    document.body.removeChild(i);
  }

  function buildShareBar(title){
    var bar = document.createElement('div');
    bar.className = 'luobo-share-bar';
    bar.setAttribute('data-luobo-share', '1');
    var t = title || document.title;
    var currentUrl = SITE_ROOT + (location.hash||'');
    bar.innerHTML =
      '<button type="button" class="luobo-share-btn" data-act="copy">📋 复制链接</button>' +
      '<button type="button" class="luobo-share-btn" data-act="wechat">🟢 微信分享</button>' +
      '<a class="luobo-share-btn" data-act="weibo" target="_blank" rel="noopener">📮 微博分享</a>' +
      '<a class="luobo-share-btn" data-act="qzone" target="_blank" rel="noopener">🌐 QQ空间</a>' +
      '<div class="luobo-share-hint">觉得对孩子和家长有帮助，欢迎分享给身边的朋友</div>';
    bar.querySelector('[data-act="copy"]').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      copyLink(SITE_ROOT + (location.hash||''));
    });
    bar.querySelector('[data-act="wechat"]').addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      copyLink(SITE_ROOT + (location.hash||''));
      setTimeout(function(){ showToast('链接已复制，粘贴到微信对话或朋友圈'); }, 250);
    });
    var wb = bar.querySelector('[data-act="weibo"]');
    wb.href = 'https://service.weibo.com/share/share.php?url=' + encodeURIComponent(currentUrl) +
              '&title=' + encodeURIComponent(t);
    var qz = bar.querySelector('[data-act="qzone"]');
    qz.href = 'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + encodeURIComponent(currentUrl) +
              '&title=' + encodeURIComponent(t);
    return bar;
  }

  // 监听 detail body 变化，切换文章时重建 share bar
  function bindDetailShare(){
    var detailEl = document.getElementById('cul-detail-body');
    if(!detailEl || detailEl.__luoboShareBound) return;
    detailEl.__luoboShareBound = true;
    var refresh = function(){
      var titleEl = document.getElementById('cul-detail-title');
      var t = (titleEl ? titleEl.textContent : '') + ' - 萝卜干围棋教育';
      var container = detailEl.parentNode;
      if(!container) return;
      var old = container.querySelector('.luobo-share-bar');
      if(old) old.remove();
      var bar = buildShareBar(t);
      // 插到 detailEl 之后（不进入 detailEl 内部，避免 observer 死循环）
      if(detailEl.nextSibling){
        container.insertBefore(bar, detailEl.nextSibling);
      } else {
        container.appendChild(bar);
      }
    };
    var observer = new MutationObserver(function(){ refresh(); });
    observer.observe(detailEl, {childList:true, characterData:true, subtree:true});
    // detail 面板初次显示可能已经有内容
    setTimeout(function(){
      if(detailEl.innerHTML && detailEl.innerHTML.trim().length > 0){ refresh(); }
    }, 400);
  }

  // 解析 hash 路由
  function resolveHash(){
    if(window.__luoboHashSilent){ window.__luoboHashSilent = false; return; }
    var h = location.hash;
    if(!h || h === '#') return;
    // #culture/master/曹薰铉
    var m = h.match(/^#culture\/master\/(.+)$/);
    if(m){
      var name;
      try { name = decodeURIComponent(m[1]); } catch(e){ name = m[1]; }
      // 先打开 culture 面板，再 jump
      if(typeof window.openSection === 'function') window.openSection('culture');
      setTimeout(function(){
        if(typeof window.__luoboJumpToMaster === 'function'){
          window.__luoboJumpToMaster(name);
        }
      }, 120);
      return;
    }
    var id = h.slice(1);
    // 特殊入口
    if(id === 'daily' && window.__luoboOpenDailyRitual){ window.__luoboOpenDailyRitual(); return; }
    if(id === 'master' && window.__luoboOpenMasterMap){ window.__luoboOpenMasterMap(); return; }
    if(id === 'quiz' && window.__luoboOpenQuiz){ window.__luoboOpenQuiz(); return; }
    if(id === 'pocket' && window.__luoboOpenPocketBoard){ window.__luoboOpenPocketBoard(); return; }
    // 普通 collapsible section
    if(SECTION_META[id] && typeof window.openSection === 'function'){
      window.openSection(id);
    }
  }

  window.addEventListener('hashchange', resolveHash);

  function boot(){
    wrapOpenSection();
    wrapJumpToMaster();
    bindDetailShare();
    if(location.hash) setTimeout(resolveHash, 300);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
  // 延迟兜底（等其他 IIFE 都定义完 window 钩子）
  setTimeout(boot, 500);
  setTimeout(boot, 1500);
})();
;
/* ===== 七期：CG 课堂小游戏按需加载 ===== */
/* 原 772 行模块(37KB)拆到 classroom-games-lazy.js；首次点击“课堂小游戏”时拉取 */
(function(){
  var loaded = false;
  window.openClassroomGames = function(){
    if(loaded){ return; }
    window.__luoboLoadScript('/assets/js/classroom-games-lazy.js').then(function(){
      loaded = true;
      window.openClassroomGames();
    }).catch(function(){});
  };
  window.closeClassroomGames = function(){};
})();

;
  // ===== 三期：思维训练室按需加载 =====
  // 脑室游戏代码已拆到 brain-games.js；当 #brain-training 被加上 .open（任意打开路径）时再拉取并自启动
  (function(){
    var sec = document.getElementById('brain-training');
    if(!sec) return;
    function loadBrain() {
      window.__luoboSkeleton.show(sec);
      window.__luoboLoadScript('/assets/js/brain-games.js').then(function(){
        window.__luoboSkeleton.hide(sec);
      }).catch(function(){
        window.__luoboSkeleton.hide(sec);
      });
    }
    if(sec.classList.contains('open')){ loadBrain(); return; }
    var mo = new MutationObserver(function(){
      if(sec.classList.contains('open')){ mo.disconnect(); loadBrain(); }
    });
    mo.observe(sec, {attributes:true, attributeFilter:['class']});
  })();

;
  // ===== 四期：围棋文化按需加载 =====
  // culture_data.js(406KB) 与 initCulture/fix21 不再首屏执行；#culture 加 .open 时拉数据再初始化
  (function(){
    var sec = document.getElementById('culture');
    if(!sec) return;
    var loading = false;
    window.__luoboEnsureCulture = function(){
      if(loading) return window.__luoboCulturePromise;
      loading = true;
      window.__luoboSkeleton.show(sec);
      window.__luoboCulturePromise = window.__luoboLoadScript('/assets/data/culture_data.js').then(function(){
        return window.__luoboLoadScript('/assets/js/culture-fix21.js');
      }).then(function(){
        window.__luoboSkeleton.hide(sec);
        if(typeof window.__luoboInitCulture === 'function') window.__luoboInitCulture();
        if(typeof window.__luoboCultureFix21 === 'function') window.__luoboCultureFix21();
      }).catch(function(){
        window.__luoboSkeleton.hide(sec);
        loading = false; // 允许重试
      });
      return window.__luoboCulturePromise;
    };
    if(sec.classList.contains('open')){ window.__luoboEnsureCulture(); return; }
    var mo = new MutationObserver(function(){
      if(sec.classList.contains('open')){ mo.disconnect(); window.__luoboEnsureCulture(); }
    });
    mo.observe(sec, {attributes:true, attributeFilter:['class']});
  })();

;
  // ===== 五期：启蒙教学研讨按需加载 =====
  // edulab_data.js(66KB) + edulab-lazy.js(6KB) 不再首屏执行；#edulab 加 .open 时拉取
  (function(){
    var sec = document.getElementById('edulab');
    if(!sec) return;
    var loading = false;
    window.__luoboEnsureEdulab = function(){
      if(loading) return window.__luoboEdulabPromise;
      loading = true;
      window.__luoboSkeleton.show(sec);
      window.__luoboEdulabPromise = window.__luoboLoadScript('/assets/data/edulab_data.js').then(function(){
        return window.__luoboLoadScript('/assets/js/edulab-lazy.js');
      }).then(function(){
        window.__luoboSkeleton.hide(sec);
      }).catch(function(){
        window.__luoboSkeleton.hide(sec);
        loading = false;
      });
      return window.__luoboEdulabPromise;
    };
    if(sec.classList.contains('open')){ window.__luoboEnsureEdulab(); return; }
    var mo = new MutationObserver(function(){
      if(sec.classList.contains('open')){ mo.disconnect(); window.__luoboEnsureEdulab(); }
    });
    mo.observe(sec, {attributes:true, attributeFilter:['class']});
  })();

;
  // ===== 五期：教学理念板块按需加载 =====
  // teaching_data.js(69KB) + teaching-lazy.js(3KB) 不再首屏执行；#teaching 进入视口前 200px 触发
  (function(){
    var sec = document.getElementById('teaching');
    if(!sec) return;
    var loading = false;
    window.__luoboEnsureTeaching = function(){
      if(loading) return window.__luoboTeachingPromise;
      loading = true;
      window.__luoboSkeleton.show(sec);
      window.__luoboTeachingPromise = window.__luoboLoadScript('/assets/data/teaching_data.js').then(function(){
        return window.__luoboLoadScript('/assets/js/teaching-lazy.js');
      }).then(function(){
        window.__luoboSkeleton.hide(sec);
      }).catch(function(){
        window.__luoboSkeleton.hide(sec);
        loading = false;
      });
      return window.__luoboTeachingPromise;
    };
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        if(entries[0].isIntersecting){ io.disconnect(); window.__luoboEnsureTeaching(); }
      }, {rootMargin:'200px'});
      io.observe(sec);
    } else {
      // fallback：不支持 IO 的浏览器直接加载
      window.__luoboEnsureTeaching();
    }
    // hotfix 2026-11-23：#teaching 改 collapsible 后基态 display:none，IO 不再触发；
    // 照 edulab 同款兜底：overlay 打开（.open）时确保按需脚本加载（与 IO 互斥断开，不会重复加载）
    var mo = new MutationObserver(function(){
      if(sec.classList.contains('open')){ mo.disconnect(); window.__luoboEnsureTeaching(); }
    });
    mo.observe(sec, {attributes:true, attributeFilter:['class']});
  })();
