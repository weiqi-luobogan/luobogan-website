/* ===== 专注力测试(ct)模块 · 按需加载分片 =====
   P0-1(2026-11-25)：原 site.js L187-704(518 行/18KB)整块迁出，首屏不再解析执行。
   触发：#concentration-test 首次 .open 时由 site.js __luoboEnsureCT() 拉取。
   自包含：内部 __luoboCTInit 幂等守卫 + document.readyState 分支(懒加载时直接 init())。 */
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
      else window.__luoboDialog.alert('微信号已复制：' + wx + '\n请去微信搜索添加');
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
      window.__luoboDialog.alert('请手动复制微信号：' + txt);
    }
  }

  // ==== 提交样本 ====
  function submitSample(){
    var list = loadHistory();
    if (!list.length) {
      if (window.showToast) window.showToast('请先完成一次测试');
      else window.__luoboDialog.alert('请先完成一次测试');
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
        else window.__luoboDialog.alert('已尝试打开邮件客户端，本次数据也已保存在本地');
      }, 500);
    } catch(e){
      if (window.showToast) window.showToast('感谢参与，样本已记录到本地');
      else window.__luoboDialog.alert('感谢参与，样本已记录到本地');
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
