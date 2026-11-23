    // 全局脚本懒加载器：多次调用同一 URL 只加载一次
    window.__luoboLoadScript = function(url) {
      window.__luoboLoadedScripts = window.__luoboLoadedScripts || {};
      if (window.__luoboLoadedScripts[url]) return window.__luoboLoadedScripts[url];
      var p = new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = url;
        s.async = true;
        s.onload = function() { resolve(); };
        s.onerror = function() { reject(new Error('failed to load ' + url)); };
        document.head.appendChild(s);
      });
      window.__luoboLoadedScripts[url] = p;
      return p;
    };
  
;
    // header 更多下拉：点击外部关闭
    document.addEventListener('click', function(e) {
      var dd = document.querySelector('.header-dropdown');
      if (dd && !e.target.closest('.relative')) dd.style.display = 'none';
    });
    // toggle
    document.querySelectorAll('.header-dropdown').forEach(function(dd) {
      var btn = dd.previousElementSibling;
      if (btn) btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
      });
    });
    
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
    try {
      var url = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = url;
      a.download = '专注力测试-' + (state.info && state.info.nick || '匿名') + '-' + Date.now() + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch(e) {
      alert('下载失败，请长按海报保存到相册');
    }
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
      window.scrollTo({top: document.getElementById('ability-test').offsetTop - 20, behavior: 'smooth'});
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
      window.scrollTo({top: document.getElementById('ability-test').offsetTop - 20, behavior: 'smooth'});
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
        cvs.toBlob(png => {
          const pngUrl = URL.createObjectURL(png);
          const a = document.createElement('a');
          a.href = pngUrl;
          const lvName = document.getElementById('res-level').textContent;
          a.download = '萝卜干围棋认证-' + lvName + '.png';
          a.click();
          setTimeout(() => { URL.revokeObjectURL(pngUrl); URL.revokeObjectURL(url); }, 1000);
        }, 'image/png');
      };
      img.onerror = () => { alert('证书下载失败，请刷新页面重试'); URL.revokeObjectURL(url); };
      img.src = url;
    });

    // ===== 重做本版 =====
    document.getElementById('btn-retry').addEventListener('click', () => {
      document.getElementById('test-result').style.display = 'none';
      document.getElementById('test-intro').style.display = 'block';
      document.getElementById('test-selector').style.display = 'flex';
      window.scrollTo({top: document.getElementById('ability-test').offsetTop - 20, behavior: 'smooth'});
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
      window.scrollTo({top: document.getElementById('ability-test').offsetTop - 20, behavior: 'smooth'});
    });
  })();


    // ===== 围棋文化专栏 =====
    
;
    (function initCulture() {
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
        window.scrollTo({ top: document.getElementById('culture').offsetTop - 20, behavior: 'smooth' });
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
    })();


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
(function(){
  var home = document.getElementById('teaching-home');
  var list = document.getElementById('teaching-list');
  var detail = document.getElementById('teaching-detail');
  if (!home) return;
  function renderHome(){
    home.innerHTML = TEACHING_DATA.sections.map(function(s){
      return '<button class="teaching-entry" onclick="showTeachingList(\''+s.id+'\')">'
           + '<div class="teaching-entry-icon">'+s.icon+'</div>'
           + '<div class="teaching-entry-title">'+s.title+'</div>'
           + '<div class="teaching-entry-desc">'+s.desc+'</div>'
           + '<div class="teaching-entry-count">'+s.articles.length+' 篇</div>'
           + '</button>';
    }).join('');
  }
  window.showTeachingList = function(id){
    var s = TEACHING_DATA.sections.find(function(x){ return x.id === id; });
    if (!s) return;
    home.classList.add('hidden');
    detail.classList.add('hidden');
    list.classList.remove('hidden');
    document.getElementById('teaching-list-title').textContent = s.title;
    var body = document.getElementById('teaching-list-body');
    if (s.articles.length){
      body.innerHTML = s.articles.map(function(a, k){
        return '<div class="teaching-list-item" onclick="showTeachingDetail(\''+id+'\','+k+')">'
             + '<h4>'+a.title+'</h4>'
             + '<p>'+(a.summary || '')+'</p>'
             + '</div>';
      }).join('');
    } else {
      body.innerHTML = '<p class="text-gray-soft text-sm py-8">这个板块正在整理中，很快上线。</p>';
    }
    window.__teachingCurSection = id;
    window.scrollTo({top: document.getElementById('teaching').offsetTop - 60, behavior: 'smooth'});
  };
  window.showTeachingDetail = function(id, k){
    var s = TEACHING_DATA.sections.find(function(x){ return x.id === id; });
    if (!s || !s.articles[k]) return;
    var a = s.articles[k];
    home.classList.add('hidden');
    list.classList.add('hidden');
    detail.classList.remove('hidden');
    document.getElementById('teaching-detail-title').textContent = a.title;
    document.getElementById('teaching-detail-meta').textContent = a.meta || '';
    document.getElementById('teaching-detail-body').innerHTML = a.body || '';
    window.scrollTo({top: document.getElementById('teaching').offsetTop - 60, behavior: 'smooth'});
  };
  window.showTeachingHome = function(){
    list.classList.add('hidden');
    detail.classList.add('hidden');
    home.classList.remove('hidden');
  };
  window.teachingBackToList = function(){
    if (window.__teachingCurSection) showTeachingList(window.__teachingCurSection);
    else showTeachingHome();
  };
  renderHome();
})();

// ===== 练棋建议 v1 =====
(function(){
  var homeEl = document.getElementById('teaching-home');
  var listEl = document.getElementById('teaching-list');
  var detailEl = document.getElementById('teaching-detail');
  var guideEl = document.getElementById('practice-guide');
  if (!guideEl) return;
  var entryBtn = document.querySelector('.practice-entry-card');

  window.showPracticeGuide = function(){
    if (homeEl) homeEl.classList.add('hidden');
    if (listEl) listEl.classList.add('hidden');
    if (detailEl) detailEl.classList.add('hidden');
    if (entryBtn) entryBtn.classList.add('hidden');
    guideEl.classList.remove('hidden');
    var teachingSec = document.getElementById('teaching');
    if (teachingSec && teachingSec.classList.contains('collapsible')) {
      setTimeout(function(){ teachingSec.scrollTop = 0; }, 30);
    } else {
      window.scrollTo({top: document.getElementById('teaching').offsetTop - 60, behavior:'smooth'});
    }
  };
  window.hidePracticeGuide = function(){
    guideEl.classList.add('hidden');
    if (homeEl) homeEl.classList.remove('hidden');
    if (entryBtn) entryBtn.classList.remove('hidden');
  };

  // ---- 模块 A：阶段 tab ----
  var stageTabs = document.querySelectorAll('.stage-tab');
  var stagePanels = document.querySelectorAll('.stage-panel');
  stageTabs.forEach(function(btn){
    btn.addEventListener('click', function(){
      var s = btn.getAttribute('data-stage');
      stageTabs.forEach(function(b){ b.classList.remove('active'); });
      stagePanels.forEach(function(p){ p.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelector('.stage-panel[data-stage="'+s+'"]').classList.add('active');
    });
  });

  // ---- 模块 B：题型判断器 ----
  var QUIZ_TYPES = [
    {id:'lianluo', name:'联络题', feat:'某一方被包围，或双方相互分断、相互包围，无法通过对杀实现吃子，只能通过连接把棋救回；也可以通过分断对方来实现吃子的目的', steps:[
      '判断前提：两块棋是不是真的被分断（不是就先跳过这一手）',
      '找关键点：通常在双方接触处、断点或气紧的位置',
      '选联络手段：小尖、虎、跳、飞、渡等，按棋形和距离选择',
      '推演对方分断：对方最强的分断或阻拦手段是什么',
      '选最简明的一手：能一步接上就不用绕两步',
      '再确认气：接上之后自己的气是否充足，有没有留下新的问题'
    ]},
    {id:'chizi', name:'吃子题', feat:'对方棋形存在明显缺陷（断点、气紧、结构薄），我方相对强大，可以用紧气手法拿下对方的棋子', steps:[
      '判断前提：对方棋形是否真的存在明显缺陷（断点、气紧、结构薄）',
      '判断己方：包围圈是否严密、周边援兵是否充足',
      '警惕做活隐患：对方若还有做眼空间，先考虑破眼、点杀等抑制手段，避免走成死活题',
      '找关键点：断点、扑吃点、双打吃、征吃出路、倒扑',
      '选紧气方向：从子力充足、有配合的方向紧起，避免自己撞气或走成愚形',
      '走完复查：预判对方的弃子、倒扑、反打，确认收益是"净吃"还是"打劫"'
    ]},
    {id:'duisha', name:'对杀题', feat:'相互分断、相互包围，双方都无法做活或逃跑，只能通过吃掉对方来生存', steps:[
      '确认前置：是否真正进入对杀 —— 双方都无法做活、无法出头',
      '寻找扭十字：找到正在参与对杀的棋子',
      '数气分四类：<strong>外气、内气、公气、暗气</strong> 分别数清楚',
      '连接成块再数：把必然会连在一起的棋子看成一块整体来数',
      '紧气顺序与归属：一般先紧外气，公气一般最后紧；对方若有眼，公气归有眼一方',
      '气不够不硬撞：气明显不够时，学会保留或弃子，避免逼迫对方长气'
    ], note:'quiztype_note_duisha'},
    {id:'sihuo', name:'死活题', feat:'一方被包围、还没有两只眼，需要自己做活；包围的一方也未能完全杜绝做眼的可能', steps:[
      '判断前提：这块棋是否真的被封锁（未封锁时优先考虑连接、出头、吃子）',
      '目标明确：目标是活棋，不是救子；弃子求活是常见思路',
      '找眼位：现有的眼形结构，还能扩大或做出哪些眼形',
      '找关键点：中心点、对称点、棋形要点，往往是死活成败的那一手',
      '推演对方破眼：对方最强的破眼、点杀手段是什么',
      '收益比较：双活优于劫活，劫活优于死棋；先谈活死，再谈大小'
    ]}
  ];

  // 题型知识卡（PPT 精华 · 数气四类 + 大眼气数）
  var QUIZ_KNOWLEDGE = {
    duisha: {
      qi: {
        title: '数气·四类气（对杀必备）',
        cells: [
          { name: '外气', desc: '一块棋外围能被对方直接紧到的气' },
          { name: '内气', desc: '一块棋内部空点带来的气' },
          { name: '公气', desc: '对杀双方共有、彼此都能紧的气' },
          { name: '暗气', desc: '看不见但对方紧气时被迫多走的手数——如虎口需先送子被吃、接不归要多提一手；对对杀计算至关重要' }
        ]
      },
      dayan: {
        title: '大眼气数（眼位大小决定的气）',
        rows: [
          ['3 格及以下', '小眼（不构成完整活棋气数）'],
          ['4 格',      '5 气'],
          ['5 格',      '8 气'],
          ['6 格',      '12 气']
        ],
        hint: '对杀有眼一方，眼位越大、气越多；这是"有眼杀无眼"的量化依据。'
      },
      img: {
        src: 'assets/ppt/duisha_flow.png',
        alt: '围棋对杀思维导图（4 大分支）',
        cap: '对杀思维导图 · 4 大分支路径（点击放大）'
      }
    },
    sihuo: {
      img: {
        src: 'assets/ppt/sihuo_flow.png',
        alt: '围棋死活思维导图',
        cap: '死活思维导图 · 做活与破眼路径（点击放大）'
      }
    }
  };

  var qtGrid = document.getElementById('quiztype-grid');
  var qtDetail = document.getElementById('quiztype-detail');
  if (qtGrid) {
    qtGrid.innerHTML = QUIZ_TYPES.map(function(q){
      return '<div class="quiztype-card" data-id="'+q.id+'">'
           + '<div class="qt-name">'+q.name+'</div>'
           + '<div class="qt-feat">'+q.feat+'</div>'
           + '</div>';
    }).join('');
    qtGrid.querySelectorAll('.quiztype-card').forEach(function(card){
      card.addEventListener('click', function(){
        var id = card.getAttribute('data-id');
        var q = QUIZ_TYPES.find(function(x){ return x.id === id; });
        qtGrid.querySelectorAll('.quiztype-card').forEach(function(c){ c.classList.remove('active'); });
        card.classList.add('active');
        var kb = QUIZ_KNOWLEDGE[q.id];
        var kbHtml = '';
        if (kb) {
          if (kb.qi) {
            kbHtml += '<div class="kcard-block"><div class="kcard-title">' + kb.qi.title + '</div>'
                   + '<div class="qi-grid">'
                   + kb.qi.cells.map(function(c){ return '<div class="qi-cell"><div class="qi-name">'+c.name+'</div><div class="qi-desc">'+c.desc+'</div></div>'; }).join('')
                   + '</div></div>';
          }
          if (kb.dayan) {
            kbHtml += '<div class="kcard-block"><div class="kcard-title">' + kb.dayan.title + '</div>'
                   + '<table class="dayan-table"><thead><tr><th>眼位大小</th><th>气数</th></tr></thead><tbody>'
                   + kb.dayan.rows.map(function(r){ return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>'; }).join('')
                   + '</tbody></table>'
                   + (kb.dayan.hint ? '<div class="kcard-hint">'+kb.dayan.hint+'</div>' : '')
                   + '</div>';
          }
          if (kb.img) {
            kbHtml += '<figure class="ppt-figure" data-lightbox="'+kb.img.src+'">'
                   + '<img src="'+kb.img.src+'" alt="'+kb.img.alt+'" loading="lazy" />'
                   + '<figcaption class="ppt-cap">'+kb.img.cap+'</figcaption>'
                   + '</figure>';
          }
        }
        qtDetail.innerHTML = '<h5>'+q.name+' · 做题次序（6 步）</h5><ol>'
          + q.steps.map(function(s){ return '<li>'+s+'</li>'; }).join('') + '</ol>'
          + kbHtml;
        qtDetail.classList.add('show');
      });
    });
  }

  // ---- 模块 C：记忆周期 ----
  var CYCLES = [
    {days: 5/1440, label:'5 分钟', desc:'刚做错时立刻擦掉重做，直到全对'},
    {days: 0.5,    label:'12 小时', desc:'当天晚上或次日早晨再看一次'},
    {days: 1,      label:'1 天',    desc:'第二天原题重做'},
    {days: 2,      label:'2 天',    desc:'第三天原题重做'},
    {days: 4,      label:'4 天',    desc:'第五天再回顾'},
    {days: 7,      label:'7 天',    desc:'一周后回顾'},
    {days: 15,     label:'15 天',   desc:'半月后回顾'},
    {days: 30,     label:'1 个月',  desc:'一个月后回顾'},
    {days: 90,     label:'3 个月',  desc:'三个月后回顾（此时基本沉进本能）'},
    {days: 180,    label:'半年',    desc:'半年后终检，全对就毕业'}
  ];
  var mcDate = document.getElementById('mc-date');
  if (mcDate) {
    var todayStr = new Date().toISOString().slice(0,10);
    mcDate.value = todayStr;
  }
  window.calcMemcycle = function(){
    var val = document.getElementById('mc-date').value;
    if (!val) return;
    var d = new Date(val + 'T00:00:00');
    var res = document.getElementById('mc-result');
    var planList = [];
    var rows = CYCLES.map(function(c){
      var forward = new Date(d.getTime() + c.days * 86400000);
      var y = forward.getFullYear();
      var m = String(forward.getMonth()+1).padStart(2,'0');
      var dd = String(forward.getDate()).padStart(2,'0');
      var label = c.days < 1 ? '当天' : y + '-' + m + '-' + dd;
      planList.push([c.label+'后', label, c.desc, '']);
      return '<div class="memcycle-row">'
           + '<div class="mc-cycle">'+c.label+'后</div>'
           + '<div class="mc-desc"><strong>'+label+'</strong> 复习 · '+c.desc+'</div>'
           + '</div>';
    }).join('');
    // 组装可直接使用的错题本工作模板 CSV
    var csv = [];
    csv.push(['围棋错题复习跟踪表 · 基于艾宾浩斯遗忘曲线']);
    csv.push(['基准日期（本批错题登记日）', val]);
    csv.push(['生成时间', new Date().toLocaleString('zh-CN')]);
    csv.push([]);
    csv.push(['【第一部分】本批错题的复习计划（今日登记后，未来在这些节点各复习一次）']);
    csv.push(['复习节点','对应日期','操作说明','是否完成 √']);
    planList.forEach(function(r){ csv.push(r); });
    csv.push([]);
    csv.push(['【第二部分】错题登记 + 10 次复习打卡表(每天做错的题填入下方,复习一次打一个√)']);
    csv.push(['批次日期','题号','题型','内容/棋图页码','5分钟后','12小时后','1天后','2天后','4天后','7天后','15天后','1月后','3月后','半年后','全对毕业']);
    // 预填 30 行空白，默认第一批次为基准日期
    for (var i=0; i<30; i++){
      csv.push([i<10 ? val : '', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    }
    csv.push([]);
    csv.push(['【使用说明】']);
    csv.push(['1. 每天做错的题按"批次日期=当天"登记到第二部分，题号/题型/棋图页码方便日后翻找']);
    csv.push(['2. 复习一次就在对应节点栏打一个 √，10 次全对了在末尾"全对毕业"栏打 √']);
    csv.push(['3. 若想生成"某一天新错题"的复习计划，把基准日期改成那一天再重新下载一份']);
    csv.push(['4. 建议每天固定时间(如晚饭后 15 分钟)翻表:先做到期的老批次,再登记今天的新错题']);
    window.__mcCsv = { rows: csv, filename: '围棋错题复习跟踪表_'+val+'.csv' };
    res.innerHTML = rows + '<button class="download-csv-btn" onclick="downloadCsv(\'mc\')">📥 下载"错题复习跟踪表"（Excel 可直接打开填写）</button>';
    res.classList.remove('flash-in'); void res.offsetWidth; res.classList.add('flash-in');
  };

  // ---- 模块 D：6:3:1 计算器 ----
  function formatLevel(type, num){
    if (num <= 0) return type === 'ji' ? '1级' : '1段';
    return num + (type === 'ji' ? '级' : '段');
  }
  function adjust(type, num, offset){
    // 级：数字变小 = 变强；段：数字变大 = 变强
    var newNum, newType = type;
    if (type === 'ji') {
      newNum = num - offset;
      if (newNum <= 0) { newType = 'duan'; newNum = 1 - newNum; }
    } else {
      newNum = num + offset;
      if (newNum <= 0) { newType = 'ji'; newNum = 1 - newNum; }
    }
    return formatLevel(newType, newNum);
  }
  window.calcRatio631 = function(){
    var type = document.getElementById('r631-type').value;
    var num = parseInt(document.getElementById('r631-num').value, 10);
    var total = parseInt(document.getElementById('r631-total').value, 10);
    if (!num || num < 1 || !total || total < 10) return;
    // 低 2 级（比当前弱 2 级）= 从"当前"降 2 级：级往数字大方向、段往数字小方向
    // 我们统一按"当前棋力"上下浮动来表达：低=更弱，高=更强
    // 弱化 offset 传负数，强化传正数
    var weakLabel = adjust(type, num, type === 'ji' ? +2 : -2);
    var sameLabel = formatLevel(type, num);
    var strongLabel = adjust(type, num, type === 'ji' ? -1 : +1);
    var w = Math.round(total * 0.6);
    var s = Math.round(total * 0.3);
    var h = total - w - s;
    var res = document.getElementById('r631-result');
    res.innerHTML =
      '<div class="ratio631-card"><div class="r-ratio">60%</div>'
        + '<div class="r-label">'+weakLabel+' 题 · '+w+' 道</div>'
        + '<div class="r-desc">夯基础、找信心。每题 1-2 分钟解决，追求"一看就懂"。</div></div>'
      + '<div class="ratio631-card"><div class="r-ratio">30%</div>'
        + '<div class="r-label">'+sameLabel+' 题 · '+s+' 道</div>'
        + '<div class="r-desc">测水平。做对说明当前棋力扎实，做错记入错题本进入记忆周期。</div></div>'
      + '<div class="ratio631-card"><div class="r-ratio">10%</div>'
        + '<div class="r-label">'+strongLabel+' 题 · '+h+' 道</div>'
        + '<div class="r-desc">挑战成长。想 5 分钟再翻答案，读棋不做题。</div></div>';
    // 把每档周总量分到周一~周日（前 remainder 天多 1 道）
    function split7(t){
      var base = Math.floor(t/7), rem = t%7, arr = [];
      for (var i=0;i<7;i++) arr.push(base + (i<rem ? 1 : 0));
      return arr;
    }
    var wDays = split7(w), sDays = split7(s), hDays = split7(h);
    var dayHeader = ['周一','周二','周三','周四','周五','周六','周日'];
    var totalDays = [0,1,2,3,4,5,6].map(function(i){ return wDays[i]+sDays[i]+hDays[i]; });
    var csv = [];
    csv.push(['围棋周训练打卡表 · 6:3:1 难度配比']);
    csv.push(['当前棋力', sameLabel]);
    csv.push(['本周总题量', total+' 道']);
    csv.push(['生成时间', new Date().toLocaleString('zh-CN')]);
    csv.push([]);
    csv.push(['难度档位','占比','棋力','本周总量'].concat(dayHeader).concat(['完成情况 √']));
    csv.push(['低 2 级（打基础）','60%',weakLabel,w+' 道'].concat(wDays).concat(['']));
    csv.push(['同级（测水平）','30%',sameLabel,s+' 道'].concat(sDays).concat(['']));
    csv.push(['高 1 级（挑战）','10%',strongLabel,h+' 道'].concat(hDays).concat(['']));
    csv.push(['每日合计','','',total+' 道'].concat(totalDays).concat(['']));
    csv.push([]);
    csv.push(['【使用说明】']);
    csv.push(['1. 顺序：每天先做低 2 级题热身找信心，再做同级题验证水平，最后挑战高 1 级']);
    csv.push(['2. 记录：每完成一档，在"完成情况"格子里打 √ 或写实际完成数']);
    csv.push(['3. 错题：所有做错的题按当天日期登记进《错题复习跟踪表》，进入 10 次复习循环']);
    csv.push(['4. 底线：三档比例不要反转——不要先做高级题、也不要跳过低级题，一定崩']);
    csv.push(['5. 复盘：周日晚上花 10 分钟看这张表，估算这周实际完成率，下周再调总量']);
    window.__r631Csv = { rows: csv, filename: '围棋周训练打卡表_'+sameLabel+'_'+total+'题.csv' };
    res.innerHTML += '<button class="download-csv-btn" onclick="downloadCsv(\'r631\')">📥 下载"周训练打卡表"（Excel 可直接打开填写）</button>';
    res.classList.remove('flash-in'); void res.offsetWidth; res.classList.add('flash-in');
  };
  // 通用 CSV 下载函数（BOM + 转义，Excel 中文不乱码）
  window.downloadCsv = function(kind){
    var data = kind === 'mc' ? window.__mcCsv : window.__r631Csv;
    if (!data) return;
    var csv = '\ufeff' + data.rows.map(function(row){
      return row.map(function(cell){
        var s = cell == null ? '' : String(cell);
        s = s.replace(/"/g, '""');
        return /[",\n\r]/.test(s) ? '"'+s+'"' : s;
      }).join(',');
    }).join('\r\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  };
  // 初始跑一次
  if (document.getElementById('r631-result')) window.calcRatio631();
  if (document.getElementById('mc-result')) window.calcMemcycle();
  // 输入变化自动重算
  if (mcDate) mcDate.addEventListener('change', window.calcMemcycle);
  var r631Type = document.getElementById('r631-type');
  var r631Num = document.getElementById('r631-num');
  var r631Total = document.getElementById('r631-total');
  if (r631Type) r631Type.addEventListener('change', window.calcRatio631);
  if (r631Num) r631Num.addEventListener('input', window.calcRatio631);
  if (r631Total) r631Total.addEventListener('input', window.calcRatio631);


  // ---- 模块 E：高阶练棋思考 ----
  var ADVANCED_TOPICS = {
    observe: {
      name: '观察',
      lead: '拿到一手棋，先不算、先看。观察是整个思考的起点，也是最容易被跳过的一步。一手好棋往往不是算出来的，是看出来的。',
      img: 'assets/ppt/advanced_observe.png',
      imgCap: '观察实战示例（点击放大）',
      points: [
        '看接触处：双方短兵相接的位置，往往就是急所所在',
        '看子力分布：判断双方棋块的根据、出头、棋形、联络',
        '看强弱：和对方挨着的棋子容易变弱，需要格外留意',
        '判断危险棋子的价值与生存能力（丢不丢得起、能不能活）',
        '依据场合的混乱程度依次观察，急所与大场按场合看',
        '见合处（两个方向都能走、差别不大）暂时不走，先处理别处'
      ],
      hint: '图中 B、C、D 三个红框就是典型的实战观察对象：什么地方强、什么地方弱、哪里是见合可以暂不走。'
    },
    goal: {
      name: '确立目标',
      lead: '观察完之后要做的第二件事，是想清楚这一手要做什么。看似简单，很多人就是在这一步上日复一日地失去方向。',
      img: 'assets/ppt/advanced_goal.png',
      imgCap: '计算力提升 · 五步流程（点击放大）',
      steps: [
        { no: 1, tag: '判断', title: '避免战斗', desc: '联络、生根、整形等手段，避免不必要、或明显不利局面下的战斗' },
        { no: 2, tag: '归类', title: '确立战斗类型', desc: '确立战斗类型，检索该类型下所需的条件与常用方法，对局面进行分析' },
        { no: 3, tag: '目的', title: '根据战斗类型明确目的', desc: '明确落子目的，构思正确的变化图形' },
        { no: 4, tag: '变化', title: '基于目的的变化图', desc: '思考与目的相关的变化图，并判定目的能否实现、双方手段是否合理' },
        { no: 5, tag: '验证', title: '对变化图进行检验思考', desc: '确保变化图是正确、合理、符合双方利益的图形' }
      ],
      hint: '这五步一步都不能跳：跳了判断就是盲打，跳了验证就容易足先。'
    },
    layout: {
      name: '布局思考',
      lead: '布局阶段的思路，可以拆成三条线：角部怎么走、要点怎么找、策略怎么定。',
      img: 'assets/ppt/advanced_layout.png',
      imgCap: '围棋布局思维导图（点击放大）',
      branches: [
        { name: '角部手段', items: [
          '抢占空角 → 建立根据（获得实地 / 获得发展）',
          '挂角守角',
          '选择定式：方向判断（全局配合）+ 熟悉定式（避免上当）',
          '布局结构：两翼张开 / 连片发展 / 箱型结构 / 立体结构'
        ]},
        { name: '布局要点', items: [
          '布局急所：根据 / 棋形 / 出头 / 联络 要点（战略要点：事关生死或劳逸）',
          '布局大场：小天王山 / 大天王山 / 两翼张开 / 发展方向（发展要点：模样 / 外势大小）',
          '全局配合：连片分投 / 打入侵消 / 夹逼方向',
          '价值比较：一般急所优于大场'
        ]},
        { name: '策略提炼', items: [
          '方向判断：棋走宽处 + 有效配合',
          '强弱判断：子力对比 / 棋形结构 / 根据情况 / 出路分析',
          '厚薄判断：形棋分寸',
          '形势判断：地盘对比 / 发展对比 → 招法与战略选择（保守或激进）'
        ]}
      ],
      hint: '布局不是每一手都要三大分支都想一遍，而是把这个骨架记在心里，遇到对应情境时自然调用。'
    },
    midgame: {
      name: '中盘思考',
      lead: '中盘是一盘棋最热闹也最容易翻车的阶段。思考的骨架就是“1-2-3-4-5”：一个观察、两个问题、三个棋形、四大急所、五大判断。',
      img: 'assets/ppt/advanced_midgame.png',
      imgCap: '中盘提升思维导图（点击放大）',
      mid: [
        { tag: '一', title: '一个观察', desc: '先看接触处、看块数；凡义当争一招净、争取一个先手' },
        { tag: '二', title: '两个问题：断点 + 气紧', desc: '断点（棋从断处生：防被断/自己断点）+ 气紧（有气才能活：防紧气/避免撞气）——围棋的基础就是分断、包围、紧气' },
        { tag: '三', title: '三个棋形：愚形 / 裂形 / 凝形', desc: '愚形（凝结、气变少，看结果不全是坏棋）/ 裂形（分裂、各处不活，基本全部坏棋）/ 凝形（发展重复、子效低下）' },
        { tag: '四', title: '四大急所：根据 / 出头 / 联络 / 棋形', desc: '根据（做活空间）/ 出头（不被包围）/ 联络（连强分弱）/ 棋形（方便战斗、方便做活）' },
        { tag: '五', title: '五大判断：类型 / 强弱 / 方向 / 厚薄 / 价值', desc: '类型（吃子/对杀/死活/官子/布局）/ 强弱（攻守脱先）/ 方向（行棋方向）/ 厚薄（开拆逼攻距离）/ 价值（战斗次序）' }
      ],
      hint: '1 看 → 2 想 → 3 避 → 4 抢 → 5 判：看接触、想断气、避坏形、抢急所、判五大。'
    }
  };

  var advPanel = document.getElementById('adv-panel');
  var advTabs = document.querySelectorAll('.adv-tab');

  function renderAdv(key){
    var t = ADVANCED_TOPICS[key];
    if (!t) return '';
    var body = '';
    body += '<div class="adv-lead">' + t.lead + '</div>';

    if (t.points) {
      body += '<ul class="adv-points">' + t.points.map(function(p){ return '<li>'+p+'</li>'; }).join('') + '</ul>';
    }

    if (t.steps) {
      body += '<div class="adv-steps">' + t.steps.map(function(s){
        return '<div class="adv-step">'
             + '<div class="adv-step-no">'+s.no+'</div>'
             + '<div class="adv-step-tag">'+s.tag+'</div>'
             + '<div class="adv-step-body">'
             + '<div class="adv-step-title">'+s.title+'</div>'
             + '<div class="adv-step-desc">'+s.desc+'</div>'
             + '</div>'
             + '</div>';
      }).join('') + '</div>';
    }

    if (t.branches) {
      body += '<div class="adv-branches">' + t.branches.map(function(b){
        return '<div class="adv-branch"><div class="adv-branch-name">'+b.name+'</div>'
             + '<ul>'+b.items.map(function(i){ return '<li>'+i+'</li>'; }).join('')+'</ul>'
             + '</div>';
      }).join('') + '</div>';
    }

    if (t.mid) {
      body += '<div class="adv-mid-list">' + t.mid.map(function(m){
        return '<div class="adv-mid-cell">'
             + '<div class="adv-mid-tag">'+m.tag+'</div>'
             + '<div class="adv-mid-body">'
             + '<div class="adv-mid-title">'+m.title+'</div>'
             + '<div class="adv-mid-desc">'+m.desc+'</div>'
             + '</div>'
             + '</div>';
      }).join('') + '</div>';
    }

    if (t.img) {
      body += '<figure class="ppt-figure" data-lightbox="'+t.img+'">'
           + '<img src="'+t.img+'" alt="'+t.name+' 思维导图" loading="lazy" />'
           + '<figcaption class="ppt-cap">'+t.imgCap+'</figcaption>'
           + '</figure>';
    }

    if (t.hint) {
      body += '<div class="adv-hint">'+t.hint+'</div>';
    }

    return body;
  }

  if (advPanel) {
    advPanel.innerHTML = renderAdv('observe');
    advTabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var key = tab.getAttribute('data-adv');
        advTabs.forEach(function(x){ x.classList.remove('active'); });
        tab.classList.add('active');
        advPanel.innerHTML = renderAdv(key);
      });
    });
  }

  // ---- lightbox（PPT 原图放大） ----
  (function(){
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="关闭">✕ 关闭</button><img alt="围棋课件大图预览" />';
    document.body.appendChild(overlay);
    var lbImg = overlay.querySelector('img');
    function open(src, alt){
      lbImg.src = src;
      lbImg.alt = alt || '';
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function close(){
      overlay.classList.remove('show');
      lbImg.src = '';
      document.body.style.overflow = '';
    }
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
    document.addEventListener('click', function(e){
      var fig = e.target.closest && e.target.closest('.ppt-figure');
      if (!fig) return;
      if (fig.closest('.lightbox-overlay')) return;
      var src = fig.getAttribute('data-lightbox') || (fig.querySelector('img') && fig.querySelector('img').src);
      var alt = fig.querySelector('img') ? fig.querySelector('img').alt : '';
      if (src) open(src, alt);
    });
  })();
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
  if(t){
    var y = t.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({top:y, behavior:'smooth'});
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
    var y = t.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({top:y, behavior:'smooth'});
  }
}
// ===== 给家长的建议 v6 END =====


// ===== 模块 F · 学情反馈单 =====
(function(){
  var RAD_LABELS = ['计算力','死活对杀','手筋招法','布局大局','官子收官','定式棋形'];
  var BAR_LABELS = ['学习兴趣','课堂专注','抗挫能力','复盘反思','家庭配合'];

  // 滑块联动数值
  document.querySelectorAll('.feedback-form input[type=range]').forEach(function(el){
    el.addEventListener('input', function(){
      var tid = el.getAttribute('data-target');
      if (tid) {
        var tgt = document.getElementById(tid);
        if (tgt) tgt.textContent = el.value;
      }
      window.generateFeedback && window.generateFeedback();
    });
  });
  // 其他输入实时预览
  ['fb-name','fb-teacher','fb-period','fb-stage','fb-strength','fb-weakness','fb-advice'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) {
      var evt = (el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(evt, function(){ window.generateFeedback && window.generateFeedback(); });
    }
  });

  function getData(){
    var name = (document.getElementById('fb-name').value || '').trim() || '学员';
    var teacher = (document.getElementById('fb-teacher').value || '').trim() || '老师';
    var period = document.getElementById('fb-period').value;
    var stage = document.getElementById('fb-stage').value;
    var radVals = [];
    for (var i=1;i<=6;i++) radVals.push(parseFloat(document.getElementById('fb-rad-'+i).textContent));
    var barVals = [];
    for (var j=1;j<=5;j++) barVals.push(parseFloat(document.getElementById('fb-bar-'+j).textContent));
    return {
      name: name, teacher: teacher, period: period, stage: stage,
      radVals: radVals, barVals: barVals,
      strength: (document.getElementById('fb-strength').value||'').trim(),
      weakness: (document.getElementById('fb-weakness').value||'').trim(),
      advice:   (document.getElementById('fb-advice').value||'').trim()
    };
  }

  function drawRadar(ctx, cx, cy, R, labels, vals, maxVal){
    var n = labels.length;
    // 底网 5 层
    for (var k=1;k<=5;k++){
      ctx.beginPath();
      for (var i=0;i<n;i++){
        var ang = -Math.PI/2 + i * 2*Math.PI/n;
        var r = R * k/5;
        var x = cx + r*Math.cos(ang);
        var y = cy + r*Math.sin(ang);
        (i===0)?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle = (k===5)?'#a89a7f':'#d8cfbc';
      ctx.lineWidth = (k===5)?1.5:1;
      ctx.stroke();
    }
    // 辐射线
    ctx.strokeStyle = '#d8cfbc';
    ctx.lineWidth = 1;
    for (var i=0;i<n;i++){
      var ang = -Math.PI/2 + i * 2*Math.PI/n;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R*Math.cos(ang), cy + R*Math.sin(ang));
      ctx.stroke();
    }
    // 数据多边形
    ctx.beginPath();
    for (var i=0;i<n;i++){
      var ang = -Math.PI/2 + i * 2*Math.PI/n;
      var r = R * vals[i]/maxVal;
      var x = cx + r*Math.cos(ang);
      var y = cy + r*Math.sin(ang);
      (i===0)?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(168,54,42,0.22)';
    ctx.fill();
    ctx.strokeStyle = '#a8362a';
    ctx.lineWidth = 2;
    ctx.stroke();
    // 数据点
    for (var i=0;i<n;i++){
      var ang = -Math.PI/2 + i * 2*Math.PI/n;
      var r = R * vals[i]/maxVal;
      var x = cx + r*Math.cos(ang);
      var y = cy + r*Math.sin(ang);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI*2);
      ctx.fillStyle = '#a8362a';
      ctx.fill();
      ctx.strokeStyle = '#f8f5ef';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // 标签 + 分数
    for (var i=0;i<n;i++){
      var ang = -Math.PI/2 + i * 2*Math.PI/n;
      var lx = cx + (R+28)*Math.cos(ang);
      var ly = cy + (R+28)*Math.sin(ang);
      ctx.fillStyle = '#2a2a2a';
      ctx.font = '600 14px "Noto Serif SC", "Songti SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], lx, ly);
      ctx.fillStyle = '#a8362a';
      ctx.font = '700 13px Inter, sans-serif';
      ctx.fillText(vals[i].toFixed(1), lx, ly + 16);
    }
    // 中心分数
    var avg = vals.reduce(function(a,b){return a+b;},0) / vals.length;
    ctx.fillStyle = '#a8362a';
    ctx.font = '700 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(avg.toFixed(1), cx, cy - 8);
    ctx.fillStyle = '#6b6b6b';
    ctx.font = '400 11px "Noto Serif SC", serif';
    ctx.fillText('技术均分', cx, cy + 12);
  }

  function drawBars(ctx, x, y, w, h, labels, vals, maxVal){
    var n = labels.length;
    var padL = 34, padR = 12, padT = 20, padB = 46;
    var chartW = w - padL - padR;
    var chartH = h - padT - padB;
    var barW = chartW / (n * 1.6);
    var gap = (chartW - barW*n) / (n-1);
    var ox = x + padL, oy = y + padT;
    // 参考线
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (var i=0;i<=5;i++){
      var gy = oy + chartH - chartH * i/maxVal;
      ctx.strokeStyle = (i===0)?'#a89a7f':(i%1===0?'#e6e0d5':'#f2ede2');
      ctx.lineWidth = (i===0)?1.2:1;
      ctx.beginPath();
      ctx.moveTo(ox, gy);
      ctx.lineTo(ox + chartW, gy);
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.fillText(i, ox-6, gy);
    }
    // 柱子
    for (var i=0;i<n;i++){
      var bx = ox + i * (barW + gap);
      var bh = chartH * vals[i]/maxVal;
      var by = oy + chartH - bh;
      // 阴影
      ctx.fillStyle = 'rgba(168,54,42,0.10)';
      ctx.fillRect(bx+2, by+3, barW, bh);
      // 主体渐变
      var grad = ctx.createLinearGradient(bx, by, bx, by+bh);
      grad.addColorStop(0, '#c74e3f');
      grad.addColorStop(1, '#8a2a20');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, barW, bh);
      // 顶部亮线
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(bx, by, barW, 2);
      // 数值
      ctx.fillStyle = '#a8362a';
      ctx.font = '700 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(vals[i].toFixed(1), bx + barW/2, by - 5);
      // 标签
      ctx.fillStyle = '#2a2a2a';
      ctx.font = '600 13px "Noto Serif SC", "Songti SC", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(labels[i], bx + barW/2, oy + chartH + 10);
    }
  }

  function wrapText(ctx, text, x, y, maxW, lineH){
    if (!text) return y;
    var chars = String(text).split('');
    var line = '';
    for (var i=0;i<chars.length;i++){
      var c = chars[i];
      if (c === '\n') {
        ctx.fillText(line, x, y);
        line = '';
        y += lineH;
        continue;
      }
      var test = line + c;
      if (ctx.measureText(test).width > maxW && line){
        ctx.fillText(line, x, y);
        line = c;
        y += lineH;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, x, y); y += lineH; }
    return y;
  }

  window.generateFeedback = function(){
    var d = getData();
    var canvas = document.getElementById('fb-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;

    // 底纸
    ctx.fillStyle = '#f8f5ef';
    ctx.fillRect(0,0,W,H);
    // 双边框
    ctx.strokeStyle = '#a8362a';
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, W-56, H-56);
    ctx.strokeStyle = 'rgba(168,54,42,0.35)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(38, 38, W-76, H-76);

    // 顶部品牌条（左）
    ctx.fillStyle = '#a8362a';
    ctx.fillRect(60, 60, 6, 40);
    // 标题
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '700 30px "Noto Serif SC", "Songti SC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('学 情 反 馈 单', 78, 62);
    ctx.fillStyle = '#8a6b1a';
    ctx.font = '400 13px "Noto Serif SC", serif';
    ctx.fillText('· 围棋是普通孩子的教育 ·', 82, 102);

    // 印章（右）
    ctx.save();
    ctx.translate(W-100, 88);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#a8362a';
    ctx.fillRect(-30, -30, 60, 60);
    ctx.fillStyle = '#f8f5ef';
    ctx.font = '700 15px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('萝卜', 0, -10);
    ctx.fillText('围棋', 0, 10);
    ctx.restore();

    // 分割线
    var y = 140;
    ctx.strokeStyle = '#c9c0af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(W-60, y);
    ctx.stroke();

    // 基本信息栏
    y += 20;
    ctx.fillStyle = '#6b6b6b';
    ctx.font = '400 13px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('学员', 76, y+18);
    ctx.fillStyle = '#a8362a';
    ctx.font = '700 26px "Noto Serif SC", serif';
    ctx.fillText(d.name, 118, y+18);

    ctx.fillStyle = '#6b6b6b';
    ctx.font = '400 13px "Noto Serif SC", serif';
    ctx.textAlign = 'right';
    ctx.fillText('周期：' + d.period + '   |   ' + d.stage, W-80, y+8);
    ctx.fillText('授课老师：' + d.teacher, W-80, y+30);

    y += 50;
    // 装饰虚线
    ctx.strokeStyle = '#e6e0d5';
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(W-60, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 图表区标题
    y += 22;
    ctx.fillStyle = '#a8362a';
    ctx.font = '700 15px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('▍技术能力雷达', 76, y);
    ctx.fillText('▍学习状态柱状', 478, y);
    ctx.fillStyle = '#888';
    ctx.font = '400 12px "Noto Serif SC", serif';
    ctx.fillText('（对棋艺六个维度的当期评估）', 202, y+3);
    ctx.fillText('（对学习状态五个维度的当期评估）', 604, y+3);

    // 雷达 + 柱状
    drawRadar(ctx, 240, y + 200, 130, RAD_LABELS, d.radVals, 5);
    drawBars(ctx, 460, y + 40, 400, 310, BAR_LABELS, d.barVals, 5);

    // 分割线
    y = 660;
    ctx.strokeStyle = '#c9c0af';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(W-60, y);
    ctx.stroke();

    // 老师寄语
    y += 20;
    ctx.fillStyle = '#a8362a';
    ctx.font = '700 16px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('▍老师寄语', 76, y);
    y += 32;

    var blocks = [
      { title: '✿ 本期亮点', text: d.strength || '（老师未填写）', color: '#2e7d5d', bg: 'rgba(46,125,93,0.06)' },
      { title: '△ 需要加强', text: d.weakness || '（老师未填写）', color: '#8a6b1a', bg: 'rgba(138,107,26,0.06)' },
      { title: '❤ 家长建议', text: d.advice   || '（老师未填写）', color: '#a8362a', bg: 'rgba(168,54,42,0.06)' }
    ];
    blocks.forEach(function(b){
      // 背景
      var blockY = y;
      ctx.fillStyle = b.bg;
      // 先测算高度
      ctx.font = '400 15px "Noto Serif SC", "Songti SC", serif';
      var testX = 108, testMaxW = W - 108 - 76;
      var lines = 0, ln = '';
      for (var i=0;i<b.text.length;i++){
        var t = ln + b.text[i];
        if (ctx.measureText(t).width > testMaxW && ln){ lines++; ln = b.text[i]; }
        else ln = t;
      }
      if (ln) lines++;
      var boxH = 30 + lines * 24 + 10;
      ctx.fillRect(76, blockY - 2, W-152, boxH);
      // 左侧色条
      ctx.fillStyle = b.color;
      ctx.fillRect(76, blockY - 2, 4, boxH);
      // 标题
      ctx.fillStyle = b.color;
      ctx.font = '700 15px "Noto Serif SC", serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(b.title, 96, blockY + 6);
      // 正文
      ctx.fillStyle = '#2a2a2a';
      ctx.font = '400 15px "Noto Serif SC", "Songti SC", serif';
      y = wrapText(ctx, b.text, 108, blockY + 30, W - 108 - 76, 24);
      y += 14;
    });

    // 底部落款
    y = H - 110;
    ctx.strokeStyle = '#c9c0af';
    ctx.beginPath();
    ctx.moveTo(60, y); ctx.lineTo(W-60, y);
    ctx.stroke();
    y += 20;
    var now = new Date();
    var pad2 = function(n){ return String(n).padStart(2,'0'); };
    var todayStr = now.getFullYear() + '-' + pad2(now.getMonth()+1) + '-' + pad2(now.getDate());
    ctx.fillStyle = '#6b6b6b';
    ctx.font = '400 13px "Noto Serif SC", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('授课老师签名：' + d.teacher, 76, y);
    ctx.textAlign = 'right';
    ctx.fillText('签发日期：' + todayStr, W-76, y);
    y += 26;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a8362a';
    ctx.font = 'italic 400 13px "Noto Serif SC", serif';
    ctx.fillText('萝卜干围棋教育  ·  weiqiluobogan.com  ·  段位是结果，能力是因', W/2, y);

    // 结果区淡入
    var preview = document.getElementById('fb-preview');
    if (preview){
      preview.classList.remove('flash-in');
      void preview.offsetWidth;
      preview.classList.add('flash-in');
    }
  };

  window.downloadFeedback = function(kind){
    var d = getData();
    if (kind === 'png'){
      window.generateFeedback();
      var canvas = document.getElementById('fb-canvas');
      var url = canvas.toDataURL('image/png');
      var a = document.createElement('a');
      a.href = url;
      a.download = '学情反馈单_' + d.name + '_' + new Date().toISOString().slice(0,10) + '.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      return;
    }
    if (kind === 'csv'){
      var csv = [];
      csv.push(['围棋学情反馈单 · 数据模板']);
      csv.push(['学员姓名', d.name]);
      csv.push(['授课老师', d.teacher]);
      csv.push(['反馈周期', d.period]);
      csv.push(['当前阶段', d.stage]);
      csv.push(['签发日期', new Date().toISOString().slice(0,10)]);
      csv.push([]);
      csv.push(['【技术能力评分】1~5 分  ·  维度含义：1=启蒙 / 2=在学 / 3=能应用 / 4=熟练 / 5=可讲给别人听']);
      csv.push(['维度','评分','老师批注']);
      RAD_LABELS.forEach(function(lb, i){ csv.push([lb, d.radVals[i], '']); });
      var radAvg = d.radVals.reduce(function(a,b){return a+b;},0) / d.radVals.length;
      csv.push(['技术均分', radAvg.toFixed(2), '']);
      csv.push([]);
      csv.push(['【学习状态评分】1~5 分']);
      csv.push(['维度','评分','老师批注']);
      BAR_LABELS.forEach(function(lb, i){ csv.push([lb, d.barVals[i], '']); });
      var barAvg = d.barVals.reduce(function(a,b){return a+b;},0) / d.barVals.length;
      csv.push(['状态均分', barAvg.toFixed(2), '']);
      csv.push([]);
      csv.push(['【老师寄语】']);
      csv.push(['✿ 本期亮点', d.strength]);
      csv.push(['△ 需要加强', d.weakness]);
      csv.push(['❤ 家长建议', d.advice]);
      csv.push([]);
      csv.push(['【使用说明】']);
      csv.push(['1. 每月/每季度末，老师根据孩子实际表现填写打分']);
      csv.push(['2. 打分口径：1=启蒙 / 2=在学 / 3=能应用 / 4=熟练 / 5=可讲给别人听']);
      csv.push(['3. 三段寄语建议每段不超 50 字，具体到一件可观察的事，避免空泛表述']);
      csv.push(['4. 生成 PNG 后直发家长群/私聊；CSV 用于机构长期存档，便于横向比较']);
      csv.push(['5. 建议同一学员每季度做一次，能形成"能力成长曲线"']);
      var csvStr = '\ufeff' + csv.map(function(row){
        return row.map(function(cell){
          var s = cell == null ? '' : String(cell);
          s = s.replace(/"/g, '""');
          return /[",\n\r]/.test(s) ? '"'+s+'"' : s;
        }).join(',');
      }).join('\r\n');
      var blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '学情反馈模板_' + d.name + '_' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
    }
  };

  // 首次渲染
  if (document.getElementById('fb-canvas')){
    // 字体可能还没加载完，稍微延后一下
    setTimeout(function(){ window.generateFeedback(); }, 50);
  }
})();
// ===== 学情反馈单 END =====
;
/* ===== 折叠板块交互（独占展开）===== */
(function(){
  const HEADER_OFFSET = 72;
  const HORIZONTAL_SLIDE_IDS = ['hero','showcase','mission'];
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
  function openSection(id){
    // 独占模式：关闭其他
    document.querySelectorAll('.collapsible.open').forEach(el => {
      if(el.id !== id) el.classList.remove('open');
    });
    const target = document.getElementById(id);
    if(!target) return;
    if(target.classList.contains('collapsible')){
      target.classList.add('open');
      document.body.classList.add('body-lock');
      // 面板内滚动重置到顶部
      setTimeout(() => { target.scrollTop = 0; }, 30);
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
  }
  function closeAllPanels(){
    document.querySelectorAll('.collapsible.open').forEach(el => el.classList.remove('open'));
    document.body.classList.remove('body-lock');
    document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
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
  const SLIDE_IDS = ['hero','showcase','mission'];
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

  // ===== v3.1: side-nav 点击 → 新标签页打开（不覆盖旧页面）=====
  document.addEventListener('click', function(e) {
    const a = e.target.closest('.side-nav a.nav-toggle');
    if (!a) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const id = a.dataset.target || '';
    const url = new URL(window.location.href);
    url.hash = id;
    window.open(url.toString(), '_blank', 'noopener');
  }, true); // capture 阶段：早于原独占 handler

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
  // ===== 启蒙教学研讨 - 密钥板块脚本 v2（账号+密码）=====
  (function() {
    const STORAGE_KEY = "edulab_unlock_v2";
    const EXPIRE_DAYS = 30;

    // 内容加密 key 混淆存储（前端反编译仍可拿到，静态站固有限制）
    const _mkArr = ["luobogan", "edulab", "master", "2026"];
    function _mk() { return _mkArr.join("-"); }

    function sha256(text) {
      return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
    }

    function aesDecrypt(cipherB64, password) {
      try {
        const decrypted = CryptoJS.AES.decrypt(cipherB64, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
      } catch(e) {
        return null;
      }
    }

    function saveUnlock(account) {
      const payload = { account: account, expire: Date.now() + EXPIRE_DAYS * 86400000 };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }

    function readUnlock() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (data.expire && data.expire > Date.now() && data.account) return data.account;
        localStorage.removeItem(STORAGE_KEY);
        return null;
      } catch(e) { return null; }
    }

    window.submitEdulabKey = async function() {
      const accInput = document.getElementById("edulab-account-input");
      const pwdInput = document.getElementById("edulab-pass-input");
      const msg = document.getElementById("edulab-gate-msg");
      const account = (accInput.value || "").trim().toUpperCase();
      const password = (pwdInput.value || "").trim();

      if (!account || !password) {
        msg.textContent = "请输入账号和密码";
        msg.className = "gate-msg";
        return;
      }

      // P0-3: 按需加载 crypto-js（首次点击时下载 60 KB）
      if (typeof CryptoJS === "undefined") {
        msg.textContent = "正在加载安全组件…";
        msg.className = "gate-msg";
        try {
          await window.__luoboLoadScript("/assets/vendor/crypto-js.min.js");
        } catch(e) {
          msg.textContent = "安全组件加载失败，请检查网络后重试";
          msg.className = "gate-msg";
          return;
        }
      }
      const hash = sha256(account + ":" + password);
      if (window.EDULAB_DATA.hashList.indexOf(hash) >= 0) {
        saveUnlock(account);
        msg.textContent = "✓ 登录成功，正在进入…";
        msg.className = "gate-msg ok";
        setTimeout(() => unlockEdulab(account), 400);
      } else {
        msg.textContent = "账号或密码不正确，请检查后重试";
        msg.className = "gate-msg";
      }
    };

    function unlockEdulab(account) {
      document.getElementById("edulab-gate").style.display = "none";
      document.getElementById("edulab-content").style.display = "block";
      document.getElementById("edulab-current-account").textContent = account;
      // 用 master key 解密所有卡片内容
      const mk = _mk();
      window.EDULAB_DATA.cards.forEach(c => {
        c._plain = aesDecrypt(c.cipher, mk);
      });
    }

    window.openEdulabCard = function(cardId) {
      const card = window.EDULAB_DATA.cards.find(c => c.id === cardId);
      if (!card || !card._plain) return;
      document.getElementById("edulab-content").style.display = "none";
      document.getElementById("edulab-detail").style.display = "block";
      document.getElementById("edulab-detail-content").innerHTML =
        '<h3 style="font-size:22px;color:var(--ink);letter-spacing:3px;margin-bottom:8px;">' +
        card.icon + ' ' + card.title + '</h3>' +
        '<p style="color:var(--gray-soft);font-size:13px;margin-bottom:20px;line-height:1.7;">' +
        card.intro + '</p>' + card._plain;
      window.scrollTo({ top: document.getElementById("edulab").offsetTop - 40, behavior: "smooth" });
    };

    window.closeEdulabCard = function() {
      document.getElementById("edulab-detail").style.display = "none";
      document.getElementById("edulab-content").style.display = "block";
    };

    window.logoutEdulab = function() {
      if (!confirm("确定要退出登录吗？下次进入需要重新输入账号密码。")) return;
      localStorage.removeItem(STORAGE_KEY);
      document.getElementById("edulab-detail").style.display = "none";
      document.getElementById("edulab-content").style.display = "none";
      document.getElementById("edulab-gate").style.display = "block";
      document.getElementById("edulab-account-input").value = "";
      document.getElementById("edulab-pass-input").value = "";
      document.getElementById("edulab-gate-msg").textContent = "";
    };

    document.addEventListener("DOMContentLoaded", function() {
      const accInput = document.getElementById("edulab-account-input");
      const pwdInput = document.getElementById("edulab-pass-input");
      [accInput, pwdInput].forEach(el => {
        if (el) el.addEventListener("keydown", function(e) {
          if (e.key === "Enter") submitEdulabKey();
        });
      });
      // ===== v3.2: Owner Mode（本机永久免登，优先级最高）=====
      // 主人 F12 控制台执行 localStorage.setItem('luobogan_owner','1'); 即可激活
      if (localStorage.getItem('luobogan_owner') === '1') {
        unlockEdulab('OWNER');
        return;
      }
      // 自动登录（30 天免登）
      const savedAccount = readUnlock();
      if (savedAccount) {
        unlockEdulab(savedAccount);
      }
    });
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
    var url=cvs.toDataURL('image/png');
    var a=document.createElement('a');
    a.href=url;
    a.download='luobo_go_quiz_'+m.name+'.png';
    document.body.appendChild(a);a.click();
    setTimeout(function(){document.body.removeChild(a);},400);
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
(function() {
  'use strict';

  // ============ 数据注入点 ============
  var QUOTES = {"gentle": {"label": "温柔治愈", "icon": "🌸", "desc": "累了想被抱抱", "quotes": ["今天下一手也好，不下也没关系，你已经是我心里的定式。", "累了就搁棋盒里歇歇，明天棋盘还是原来那张。", "别急，慢慢来。李昌镐当年也只是先摆一手小飞挂。", "你今天愿意点开我，就是最好的复盘。", "棋盘不会走的，你什么时候回来它都在。", "输一盘不算什么，你还没输过明天。", "一手没下好，抱抱自己，再摸一颗子。", "深呼吸，然后就着这口气下一颗棋，就一颗，不多要。", "手上有点凉？先把棋子握热了再落。", "今天不想复盘也可以，就看看昨天赢下的那颗子。", "你已经很棒了，能坚持到今天点开我。", "不用做完整盘，摆两个死活题也很好。", "我给你打个招呼，你回我一手，就当我们对话过了。", "困的话就睡吧，梦里也可以下棋。", "别跟自己较劲，围棋这一辈子学不完，也不用今天学完。", "你想停就停，想开始就开始，我一直在角落。", "有你在，棋盘就有温度。", "今天下得不好也是今天的样子，我喜欢的。", "把手洗干净，摸一颗子，就是最好的开始。", "累了就跟棋子说话，它会听的。", "不用赢，只要今天你摸过棋子，我就替你高兴。", "你不需要证明什么，你已经在坚持了。", "下不好也别删复盘记录，那是你走过的路。", "今晚就下三手好不好？三手就够。", "允许自己有一手臭棋，允许自己今天不想赢。", "你在棋盘边坐着的样子，最温柔了。", "泡杯茶，等它凉，再落第一颗子。", "记得吃饭。棋可以慢慢下，胃不能。", "今天想被夸就点我，我夸你：你真棒。", "谢谢你，今天也没有把我关起来。"]}, "spicy": {"label": "辛辣嘲讽", "icon": "🌶️", "desc": "犯懒需要人骂", "quotes": ["都三天没碰棋盘了，你手筋是断了吗？", "你的棋盒是不是被封条贴住了？", "上次输棋以后就再没打开过棋谱，是被打怕了吧。", "你这种坚持速度，聂卫平的孙子都能拿冠军了。", "点开我又不下棋，你是在跟我谈恋爱吗？", "你的复盘本比灰姑娘的水晶鞋还干净。", "李昌镐半夜起来摆棋，你半夜起来刷手机。", "别人下棋是打劫，你下棋是打卡，还打得不勤。", "你要再这么下下去，段位表都要把你除名了。", "上一次你完整下完一盘棋是什么朝代的事？", "棋盘想问你：你多久不理我了，心里没数？", "别摆姿势了，摆点子。", "点一次我，下一手不亏，你亏的是良心。", "你说要冲三段，我以为你要认真，结果你连三天都没冲过去。", "你的棋力最近唯一的进步，是理直气壮不下棋。", "藤泽秀行 60 岁还在拼冠军，你 30 岁就想退休？", "别怪自己没时间，你打游戏的时候可从没喊过没时间。", "你这样下棋，对得起你屋里那副贵棋盘吗？", "上次你说要每天做题，题在哭。", "棋书买了一书架，看过的比封面还少。", "别急着骂我毒舌，你摸一手棋我就闭嘴。", "「明天再下」——这话你说了 90 天了。", "你的坚持力，比对方长考的时间还短。", "输了怪 AI 强，赢了夸自己天才，你这心态挺稳。", "别人打卡是打卡，你打卡是打卡机自己在响。", "你今天要是再不摆一题，我就把你收藏的名局给你删了。", "复盘本翻开的次数，比你朋友圈还稀有。", "你以为你在缓一缓，其实你在退一退。", "别怪 AI 让不动你，是你压根没上桌。", "承认吧，你今天不是没时间，你是没脸下。"]}, "backup": {"label": "坚强后盾", "icon": "💪", "desc": "低谷需要托底", "quotes": ["李昌镐输了世界大赛第二天照样复盘。你今天下几手，我陪着。", "输一盘算什么，藤泽秀行输过多少你数得过来吗？他后来赢的更多。", "手抖没关系，落下去就是子。", "别看别人段位，你的对手只有昨天的自己。", "你不是不行，你是还没找到自己的那一手。", "跌到谷底也就多一颗黑子的重量，你扛得住。", "有我在，你今天摆一题，我陪你复一题。", "怕输就先输一盘，输完就不怕了。", "你走过的每一手臭棋，都是你后来那一手妙手的地基。", "别怕慢。徐奉洙 17 岁才入段，40 多岁还能一杆清台。", "你今天下的这一颗子，比昨天所有想法都值钱。", "输了咱不哭，我给你打张分手图，明天再来。", "困难的局面才配得上你，你不是普通选手。", "有人比你聪明，但没人比你更懂你自己的棋风。", "你不是坚持不下来，你只是没找到跟自己和解的方式。", "累的时候看一眼吴清源的棋谱，他 60 岁还在悟大局观。", "别怕臭棋，臭棋才让你记住教训。", "你已经比昨天的你多摆了一颗子，够了。", "被 AI 让 9 子还输？没事，明天让 8 子再来一次。", "你手里的那颗黑子，装着你所有走过来的路。", "刘昌赫经历那么多都没放下棋盘，你的坎跟他比是小坎。", "输给学生也没什么，说明你教得好。", "你不是没天赋，你是没给自己那么多时间。", "回来了就好，棋盘一直在等你。", "怕挨骂就先下给我看，我不骂你。", "你要是塌了，我先把你的棋盘擦干净等你。", "陈祖德带病写完《超越自我》，你今天下三手，也是超越自我。", "别人夸你不用当真，你自己夸自己那才是真的。", "这一手落下去，就没有「如果」了，好过盯着「如果」一辈子。", "你只要还在点开我，我们就没输。"]}, "classic": {"label": "古风诗意", "icon": "🎋", "desc": "想文艺一下", "quotes": ["山僧对棋坐，局上竹阴清——今日一手，何妨？", "偶来松树下，高枕石头眠。棋声一响，梦亦清。", "闲敲棋子落灯花，落一颗，便算你今日的花。", "野桥经雨断，涧水向田分。落子无声，心自安。", "手谈之乐，非在胜负，在于一子一心。", "一子落，风未动；再一子，霜华生。", "松下问童子，言师采药去——你且落一手，我等师归。", "十九路间藏山河，你一手一手，走出一片乾坤。", "对坐清风里，无言胜有言。今日之棋，不必多言。", "君子矜而不争，群而不党——棋盘之上，亦复如是。", "空山不见人，但闻子声响。你落一手，我便应你。", "一枰春色，两袖清风。手谈半晌，胜过烟花万丈。", "秋风落叶时节，摆一局残谱，如故人重逢。", "落子须知白鹤翩翩之意，非为杀，为舞。", "白云回望合，青霭入看无——好棋，也是这般。", "行到水穷处，坐看云起时——棋到胶着时，落子勿急。", "一子无声，天地澄清。今日一手，值得。", "对着棋盘，恍见太古之风。", "落雪时节，一子如梅，一子如霜。", "半窗明月，一枰残棋，人生不过如此。", "对局如对镜，一手照见半生。", "「胜固欣然，败亦可喜」——苏子早已替你说尽。", "闲庭独坐棋盘边，风过处，落一子。", "洞庭西望楚江分，落子一声，江水又深一寸。", "青衫落魄不必愁，一子当空胜万筹。", "手谈无言，谈的是彼此一生的心事。", "今日一手，是给三千年前那位弈者的一句回音。", "一叶落知天下秋，一子落知你今日心境。", "云淡风轻近午天，落一子，便是圆满。", "对坐无言，落子有声——此乃棋之至乐。"]}, "burning": {"label": "热血燃系", "icon": "🔥", "desc": "想被点燃", "quotes": ["藤泽秀行 60 岁还在拼冠军！你这个年纪凭什么不摆棋！", "徐奉洙 44 岁真露杯 9 连胜一杆清台！你今天连一手都不落？", "李昌镐每天研究棋 8 小时，你连 8 分钟都拿不出来？", "陈祖德带着癌症写完《超越自我》。你今天有什么理由不下？", "本因坊丈和血泪拼杀爬到名人棋所！你的棋盘也在等你冲！", "刘昌赫失去妻子后拿出五连冠气魄！你手里那点低谷不算什么！", "赵治勋一年下 100 盘正式赛！你一年下几盘？", "吴清源为一个新手研究 30 年！你连坚持 30 天都做不到？", "聂卫平中日擂台十一连胜！你手里就没这股劲吗？", "马晓春连续 40 个月国内第一！你连续 4 天都撑不住？", "曹薰铉带着李昌镐横扫世界！你带着自己走完今天！", "秀策十九手中国流至今无人破解！你哪来的资格说自己没天赋？", "范西屏施定庵下当湖十局手不发抖！你握颗棋子发什么抖？", "王积薪听老妇下棋一夜通神！你听我一句话，落一手！", "黄龙士 20 出头封棋圣！你 20 出头都没握过棋盒？", "道策发明手割理论重新定义围棋！你也可以重新定义你自己！", "常昊七次世界大赛决赛四次亚军最后拿冠军！你怕过什么！", "古力柯洁哪一个不是拼命练出来的！你手里有的是时间！", "石佛李昌镐一步没错走完官子！你连开局都不敢开？", "藤泽朋斋 90 岁还在摆棋！你 30 岁就摆烂？", "曹薰铉三届富士通冠军！你三天都撑不住？", "过惕生弱冠拜师终成新中国教父！你也是从零开始，为什么不能？", "顾水如民国孤军抗日棋界的骨头！你现在下棋，是幸福的！", "王子晏文人下棋两袖清风一枰春秋！你也可以，落一颗！", "坂田荣男剃刀般精准！你也曾锋利过，别忘了！", "高川格「流水不争先」拿七连霸！你的从容还在！", "武宫正树宇宙流开天辟地！你也有你的宇宙！", "小林光一严谨到令人窒息！你的自律值得再来一次！", "所有大师都是从一手臭棋开始的。你现在，就是他们的起点。", "你不落这一手，你就永远不知道自己能走到哪。落！"]}, "zen": {"label": "佛系躺平", "icon": "🧘", "desc": "想放过自己", "quotes": ["下也好，不下也好，一切随缘…但你已经三天没下了哦。", "赢了是运气好，输了是运气差，人生嘛。", "AI 说你这手不好？AI 又不用交房租，随它说去。", "段位不重要，重要的是今天有没有笑过。", "错手也是手，反正棋盘不会告你。", "你不下，棋盘也不会怪你，我可能会哦。", "复盘就复盘吧，不复盘就不复盘吧，天亮了再说。", "输了？没事，反正世界不会因此改变半分。", "「胜固欣然，败亦可喜」——你看古人多想得开。", "今天没时间就明天，明天没时间就下周，慢慢来。", "棋盘上放两颗子摆个心形也可以，谁规定必须要下正经棋？", "累了就走，累了就停，累了就当自己是一颗被拈起来又放回去的棋子。", "「空亦是色，色亦是空」——一颗子的得失，何足挂齿。", "别想了，先睡觉，睡醒棋子还是黑白两色。", "赢的时候不飞，输的时候不哭，佛系棋手就是这样。", "水到渠成，棋到手熟。别硬掰。", "今天下不下都行，我就是想你了。", "下棋是修行，不下棋也是修行。", "对手强？强就强呗，你有你的活法。", "少一手棋，多一次呼吸，也是收获。", "别人 30 岁得世界冠军，你 30 岁得心平气和，一样值钱。", "AI 让你 9 子？让就让呗，反正它也不发工资。", "有些棋走不好，是因为还没到时候。", "今日棋不悟，明日再悟。棋不生锈，你也是。", "「落子无悔」是对高手说的，你落错了改改也没关系。", "「不争，天下莫能与之争」——不下棋的人反而下得最好？", "今天你不点我我不怪你，你点我我陪你聊两句。", "输给学生了？说明你会教书了，恭喜。", "「棋道一百，我只知七」——你今天连一都不用知。", "算了，别摆了，就当你已经赢了。（其实我盼你摆一颗。）"]}, "joke": {"label": "段子搞笑", "icon": "😂", "desc": "想乐一乐", "quotes": ["医生说我血压高，我说我一天不下棋才血压高。", "「落子无悔」是骗小孩的，我每次落完都想悔到唐朝。", "你的棋盘再不用，就要长蘑菇了。（真的。）", "AI 让我 9 子，我谢它 9 遍。", "问我为什么下棋？因为麻将三缺一。", "你的棋，臭得像我上周忘在冰箱里的鱼。", "「金角银边草肚皮」——我下的每一手都在肚皮。", "别人复盘是学，我复盘是回顾人生失败史。", "我下棋不看段位看运气，运气不好我就说昨晚没睡好。", "上次赢学生一盘，学生 3 岁。这算成就吗算吗？", "打劫？我劫我自己的时间下不下棋，天天打。", "「棋盘如战场」——那我就是那个总迷路的士兵。", "别问我为啥输，问就是天时地利人和都不在我这。", "棋圣是别人的，我是棋剩，剩下来的剩。", "「一子定乾坤」——我一子定坟头。", "输了别难过，赢的人可能是作弊。（别真信，转发这段可赢十年好棋。）", "我以为我在下围棋，AI 以为我在给它送分。", "医生：你需要放松。我：好的，我去下棋。医生：换一个。", "「胜负乃兵家常事」——但主要是我在负。", "别人下棋越下越聪明，我下棋越下越沉默。", "AI 说这手是妙手，我以为夸我，其实夸的是它自己。", "「落子无声」是骗人的，我每次都「啪」一声，主要是气。", "我棋盘上放了张辣椒图片，希望能辣一辣我的棋力。", "「一将功成万骨枯」——我这盘棋，是万骨我全占了。", "下棋前抽卡：抽到大师就赢，抽到菜鸡就是我今天。", "有人吸猫，有人吸猫粮，我吸棋谱。", "「棋逢对手」的下句应该是「把把落荒」。（我改的。）", "我不是不会下，我是给对手让分，我心善。", "以后下棋前先拜三下棋盘，气运是不是会好点？", "「黑白分明」不适用于我的棋盘，我的棋盘是灰的。"]}, "master": {"label": "师父型", "icon": "🎓", "desc": "想被指点", "quotes": ["小友，一手棋看三年功夫。今日一手，胜过明日十手空想。", "棋道之精，不在多，在于专。今日一子，即是一课。", "初学者贪多，中手贪快，高手贪静。你今日在哪一层？", "手筋易学，大局难修。你先摆一子，我们再谈大局。", "记住：先看全局，再看一手。眼里有天地，手中才有分寸。", "败棋不弃，胜棋不骄。这是你今日该守的两条。", "「不失先手」不是不让，而是知道何时该让。", "手谈无言，谈的是心境。你今日心境如何？", "棋盘上藏着三重关：手筋、气势、心法。你在哪一关？", "「弃子争先」的道理，很多人一辈子学不会。你今日试着弃一颗。", "为师告诉你：别人的棋是别人的路，你的棋只能你自己走。", "复盘之要，不在找错，而在找懂。", "落子如种树，今日一子，十年才见其枝繁。", "求快求胜，是初学者的心。求稳求悟，是老者的心。", "一盘棋能改变一天，一年棋能改变一生。莫小看今日一手。", "「不争而胜」是境界，但先要学会争。", "眼中有子，心中有势——先练前者，再修后者。", "为师看过太多天才夭折，只因忘了每日一手。你今日别忘。", "输不可怕，可怕的是不知为何输。今日复一盘，明日胜一分。", "手谈之趣，在于「手」字。你的手，就是你的心。", "记住这句：「棋高一着，缚手缚脚」——你今日别被「高」字困住。", "小友，急躁是棋手的第一大敌。落一子前，先呼吸三次。", "「当局者迷，旁观者清」——你有时也做做自己的旁观者。", "为师年轻时也懒过。补回来的路很长，不如今日一手。", "别问何时能成高手，先问今日有没有一手。", "「棋无第一手」——每一手都可能是妙手，每一手都可能是败手。", "记住：好棋是练出来的，不是等出来的。", "有些棋要下十年才懂，有些棋只需一秒就懂。你今日该下哪种？", "手中一颗子，胜过书架一整排棋谱。", "为师一句话赠你：「棋在纸上，路在脚下。」今日一手，走一步。"]}};
  var DAILY_SIGN = [{"text": "山僧对棋坐，局上竹阴清。", "source": "白居易《池上二绝》"}, {"text": "闲敲棋子落灯花。", "source": "赵师秀《约客》"}, {"text": "偶来松树下，高枕石头眠。", "source": "太上隐者《答人》"}, {"text": "行到水穷处，坐看云起时。", "source": "王维《终南别业》"}, {"text": "白云回望合，青霭入看无。", "source": "王维《终南山》"}, {"text": "松下问童子，言师采药去。", "source": "贾岛《寻隐者不遇》"}, {"text": "野桥经雨断，涧水向田分。", "source": "唐 佚名"}, {"text": "对局如对镜，一手照见半生。", "source": "手谈古语"}, {"text": "半窗明月，一枰残棋。", "source": "宋人棋话"}, {"text": "一叶落知天下秋，一子落知今日心。", "source": "手谈古语"}, {"text": "金角银边草肚皮。", "source": "围棋谚语"}, {"text": "宁失一子，不失一先。", "source": "围棋谚语"}, {"text": "两番收官胜过一步妙手。", "source": "围棋谚语"}, {"text": "势孤取和，实空取胜。", "source": "围棋谚语"}, {"text": "逢危须弃。", "source": "《棋经十三篇》"}, {"text": "彼强自保，势孤取和。", "source": "《棋经十三篇》"}, {"text": "有先手就下先手。", "source": "围棋谚语"}, {"text": "落子无悔，君子之约。", "source": "手谈古训"}, {"text": "棋从断处生。", "source": "围棋谚语"}, {"text": "宁数一目，勿弃一线。", "source": "围棋谚语"}, {"text": "棋道一百，我只知七。", "source": "藤泽秀行"}, {"text": "围棋的目的是把好棋下出来，不是把对手打败。", "source": "吴清源"}, {"text": "六合之棋，超越胜负。", "source": "吴清源"}, {"text": "流水不争先。", "source": "高川格"}, {"text": "宇宙流，看的不是一角，是整盘天地。", "source": "武宫正树"}, {"text": "先看全局，再看一手。", "source": "陈祖德《超越自我》"}, {"text": "棋逢知己，胜负不重要。", "source": "聂卫平"}, {"text": "一手棋，看三年功夫。", "source": "古老棋训"}, {"text": "手筋易学，大局难修。", "source": "围棋谚语"}, {"text": "败者，无一言。", "source": "本因坊道策"}, {"text": "胜固欣然，败亦可喜。", "source": "苏轼《观棋》"}, {"text": "一枰春色，两袖清风。", "source": "文人棋话"}, {"text": "对坐清风里，无言胜有言。", "source": "文人棋话"}, {"text": "青衫落魄不必愁，一子当空胜万筹。", "source": "宋人棋诗"}, {"text": "闲敲棋子夜灯花，一子入盘天地大。", "source": "文人棋话"}, {"text": "落雪时节，一子如梅，一子如霜。", "source": "文人棋话"}, {"text": "对着棋盘，恍见太古之风。", "source": "文人棋话"}, {"text": "十九路间藏山河，一手一手走乾坤。", "source": "文人棋话"}, {"text": "洞庭西望楚江分，落子一声江水深。", "source": "化用李白"}, {"text": "君子矜而不争，群而不党。", "source": "《论语》·适用于棋道"}];
  var LUCK_SIGNS = [{"id": "L01", "name": "飞龙在天", "level": "上上签", "verse": ["长空万里，云破月来", "落子无声，破敌于形", "天时地利，应者云集", "今日之棋，龙腾九霄"], "advice": "气势正盛之日，宜主动出击。教学如是，家事亦然。"}, {"id": "L02", "name": "天元定势", "level": "上上签", "verse": ["一子当中，四海归一", "心无旁骛，势自成局", "大道至简，妙手天成", "布局既定，胜负早分"], "advice": "思路清明、格局宏大之日，凡事顺势而为便有大成。"}, {"id": "L03", "name": "紫气东来", "level": "上上签", "verse": ["东方既白，紫气盈门", "贵人相助，暗手自开", "落子如刀，一击破关", "今日之运，福至心灵"], "advice": "好运叩门之日，善抓机遇即得成事。"}, {"id": "L04", "name": "一剑封喉", "level": "上上签", "verse": ["千算万算，只在一子", "藏锋于内，杀气不显", "时机既到，霹雳而下", "一招定局，无需回眸"], "advice": "果断出手之日，机不可失，犹豫即失先手。"}, {"id": "L05", "name": "金榜题名", "level": "上上签", "verse": ["十年寒窗，一朝金榜", "落子如笔，行棋如章", "前程似锦，明月照堂", "今日之势，如愿以偿"], "advice": "成就落定之日，付出终有回响，别忘记庆祝。"}, {"id": "L06", "name": "白鹤展翅", "level": "大吉", "verse": ["云横秦岭，雪拥蓝关", "一鹤凌云，白衣飘然", "落子从容，步步为营", "大势在我，何须多言"], "advice": "机会已至，稳中求进。忌急躁，宜从容布势。"}, {"id": "L07", "name": "云开见日", "level": "大吉", "verse": ["昨夜风雨，晨起云散", "阳光破雾，山色新鲜", "昔日困局，今朝豁然", "一子既落，前路自开"], "advice": "过去几日的沉闷今日消散，抓住这份清明推进要事。"}, {"id": "L08", "name": "春风得意", "level": "大吉", "verse": ["长安花放，马蹄轻快", "落子有神，思绪如泉", "今日之棋，处处生机", "春风拂面，何等自在"], "advice": "心情舒畅带来判断准确，趁着状态好把要紧的事推一推。"}, {"id": "L09", "name": "明月出关", "level": "大吉", "verse": ["关山万里，孤月一轮", "冷光如剑，照破重雾", "落子清冷，气势内敛", "今日之势，皎洁分明"], "advice": "清醒判断之日，看得透局面本质，宜作重大决策。"}, {"id": "L10", "name": "金鸡独立", "level": "大吉", "verse": ["一足撑天，气定神闲", "独立不动，八方来朝", "定力既强，风雨不惊", "今日之棋，自成一格"], "advice": "稳如泰山之日，不受外界干扰，坚持己见即胜。"}, {"id": "L11", "name": "雪压青松", "level": "大吉", "verse": ["大雪压枝，青松不屈", "越是艰难，越见风骨", "落子如钉，一步一稳", "今日之势，愈挫愈强"], "advice": "抗压能力大爆发，困境反而激出好棋。"}, {"id": "L12", "name": "龙翔九天", "level": "大吉", "verse": ["九霄之上，云卷云舒", "一飞冲天，睥睨四方", "昔日蛰伏，今朝腾达", "落子无形，胜势无边"], "advice": "厚积薄发之日，之前的准备今日兑现。"}, {"id": "L13", "name": "虎跃深山", "level": "大吉", "verse": ["潜行深山，蓄势已久", "一跃而起，山鸣谷应", "落子如虎，威风八面", "今日之棋，霸气自生"], "advice": "胆气正盛之日，敢于挑战强手，也易得意外收获。"}, {"id": "L14", "name": "凤仪千岫", "level": "大吉", "verse": ["五彩华光，凤鸣朝阳", "落子如舞，行云流水", "今日之棋，美不胜收", "一举一动，皆是章法"], "advice": "创造力爆棚之日，容易下出漂亮的手筋。"}, {"id": "L15", "name": "松下问童", "level": "大吉", "verse": ["山中日月，静如止水", "松下问童，云深不知", "今日之势，出尘脱俗", "落子无争，自有天地"], "advice": "气度从容之日，不与人争而胜自成。"}, {"id": "L16", "name": "柳暗花明", "level": "中吉", "verse": ["山重水复，路窄天低", "忽见村舍，又是一春", "棋势将转，忍字为先", "静待其变，柳暗花明"], "advice": "局面暂显被动，转机就在半盘外。多观察，少妄动。"}, {"id": "L17", "name": "山水相逢", "level": "中吉", "verse": ["青山依旧，绿水长流", "昔日棋友，今朝相逢", "落子交心，各有所得", "今日之棋，缘分自成"], "advice": "贵人相助之日，多与人交流复盘，收获意外。"}, {"id": "L18", "name": "老树逢春", "level": "中吉", "verse": ["老干虬枝，久无生机", "春风一至，新芽萌发", "昔日困局，今得转机", "落子如春，处处生意"], "advice": "老问题突然找到解法，别忽视这份新意。"}, {"id": "L19", "name": "静水流深", "level": "中吉", "verse": ["表面平静，暗涌千寻", "藏锋于底，蓄势于沉", "落子无声，思虑无穷", "今日之势，深不可测"], "advice": "思考深度之日，看似平常的一步可能大有玄机。"}, {"id": "L20", "name": "秋收之势", "level": "中吉", "verse": ["春耕夏种，秋收在望", "稻穗低垂，气象丰盈", "昔日之功，今朝可享", "落子从容，收获自成"], "advice": "兑现之日，之前的伏笔今日结果，别错过。"}, {"id": "L21", "name": "迎风扬帆", "level": "中吉", "verse": ["江河浩荡，逆风亦扬", "借力打力，顺势而为", "落子如帆，御风而行", "今日之棋，进退自如"], "advice": "善用外力之日。别硬扛，借势更快。"}, {"id": "L22", "name": "听雨观棋", "level": "中吉", "verse": ["檐前雨落，棋盘静置", "一子未落，思虑千回", "今日之势，宜观宜思", "慢工出品，胜负不急"], "advice": "适合复盘思考之日，不必急着行动。"}, {"id": "L23", "name": "晓风残月", "level": "中吉", "verse": ["一夜风狂，晨起微寒", "残月犹在，晨光初起", "昔日局面，尚可回旋", "今日之棋，冷静应对"], "advice": "昨日阴影尚存，今日冷静处理即无大碍。"}, {"id": "L24", "name": "借东风势", "level": "中吉", "verse": ["万事俱备，只欠东风", "时机将至，蓄势而发", "落子如箭，一发中的", "今日之势，天时正合"], "advice": "等待多时的机会终于成熟，别再犹豫。"}, {"id": "L25", "name": "山雨欲来", "level": "中吉", "verse": ["云压山低，风急水寒", "变数将起，格局将换", "落子谨慎，进退有度", "今日之棋，未雨绸缪"], "advice": "局势即将变化，提前准备好应对，不要被打乱。"}, {"id": "L26", "name": "细水长流", "level": "小吉", "verse": ["溪水潺潺，石上生苔", "不争不抢，自成一派", "今日之势，蓄而不发", "待到来日，万木争春"], "advice": "不必强求突破，慢慢积累即是胜势。"}, {"id": "L27", "name": "蓄势待发", "level": "小吉", "verse": ["弓已张满，箭在弦上", "时机未到，暂且沉稳", "落子如常，眼观八方", "今日之棋，静中有备"], "advice": "不出彩但也不出错，稳住即胜。"}, {"id": "L28", "name": "稳中求胜", "level": "小吉", "verse": ["一步一稳，如履薄冰", "不求华丽，只求周全", "落子踏实，思虑周密", "今日之势，成于稳字"], "advice": "今日不需要奇招，稳定发挥最重要。"}, {"id": "L29", "name": "借力打力", "level": "小吉", "verse": ["顺势而下，四两千斤", "不与人硬，只借人势", "落子如水，无形无迹", "今日之棋，柔中带刚"], "advice": "不要硬碰硬，借对方的力反而更省。"}, {"id": "L30", "name": "一步一景", "level": "小吉", "verse": ["走走看看，处处皆景", "落子不急，心境正好", "今日之棋，随缘自在", "一子一得，何其从容"], "advice": "过程比结果重要之日，享受每一步。"}, {"id": "L31", "name": "稳如磐石", "level": "小吉", "verse": ["山不动，云不惊", "立于其中，八风不摇", "落子沉稳，一子一实", "今日之势，稳字为先"], "advice": "稳定发挥即可，别追求突破。"}, {"id": "L32", "name": "月照池塘", "level": "小吉", "verse": ["明月一轮，池水一泓", "静观其变，倒影自明", "落子从容，不惊不惧", "今日之棋，心境如水"], "advice": "心态平和之日，下棋处事都不易冲动。"}, {"id": "L33", "name": "松间落子", "level": "小吉", "verse": ["松风阵阵，棋盘寂寂", "一子既落，山鸣谷应", "今日之势，简洁明了", "落子无声，得势有形"], "advice": "思路简洁清晰之日，不必想太复杂。"}, {"id": "L34", "name": "雁字南飞", "level": "小吉", "verse": ["一雁横空，成行成序", "有条不紊，各就其位", "落子有章，行棋有法", "今日之棋，井然自成"], "advice": "按部就班之日，别打乱自己的节奏。"}, {"id": "L35", "name": "溪桥独坐", "level": "小吉", "verse": ["溪水潺潺，桥影如画", "独坐观棋，物我两忘", "落子随心，无所强求", "今日之势，闲适自得"], "advice": "轻松心态反而下出好棋。"}, {"id": "L36", "name": "闲云野鹤", "level": "小吉", "verse": ["天高云淡，鹤舞长空", "无拘无束，自由自在", "落子如风，行棋如水", "今日之棋，随心所欲"], "advice": "不功利之日，反而超常发挥。"}, {"id": "L37", "name": "半日闲棋", "level": "小吉", "verse": ["手中一子，眼前一局", "半日光阴，浮生偷得", "今日之势，得失皆宜", "落子从容，胜负不问"], "advice": "享受下棋本身，胜负是副产品。"}, {"id": "L38", "name": "静观其变", "level": "平", "verse": ["云卷云舒，花开花落", "万事有序，不必躁动", "今日之势，等字为先", "落子从缓，胜负未定"], "advice": "不知道下什么就先不下，等待更清楚的信号。"}, {"id": "L39", "name": "收敛锋芒", "level": "平", "verse": ["剑归鞘中，锋芒暂敛", "不显山露水，才是高手", "今日之棋，低调为宜", "落子如常，不惹是非"], "advice": "不出头之日，低调处事反而顺利。"}, {"id": "L40", "name": "待时而动", "level": "平", "verse": ["万事俱备，唯待东风", "沉稳蓄力，一刻不松", "今日之势，忍字当先", "落子从容，等风来时"], "advice": "机会未到，急躁只会坏事。"}, {"id": "L41", "name": "顺其自然", "level": "平", "verse": ["水到渠成，瓜熟蒂落", "不强求，不勉强", "今日之棋，随缘自在", "落子如常，得失从心"], "advice": "不强求任何结果，随缘就好。"}, {"id": "L42", "name": "观棋不语", "level": "平", "verse": ["旁观者清，当局者迷", "今日闲坐，看人下棋", "学在其中，悟在其外", "落子未定，静字为先"], "advice": "适合复盘、学习、看别人下的日子。"}, {"id": "L43", "name": "平心静气", "level": "平", "verse": ["心如止水，气若清风", "不喜不悲，不惊不惧", "今日之棋，稳字当头", "落子如常，波澜不惊"], "advice": "情绪稳定之日，下棋处事都平顺。"}, {"id": "L44", "name": "知白守黑", "level": "平", "verse": ["明处见白，暗处守黑", "有形有法，无形无迹", "今日之势，虚实相生", "落子如常，攻守自如"], "advice": "懂得进退之日，有些地方该守就守。"}, {"id": "L45", "name": "子从心出", "level": "平", "verse": ["手随心动，子从意生", "不问吉凶，只求本真", "今日之棋，一子一诚", "落子无悔，天地自宽"], "advice": "跟着直觉走的日子，想太多反而错。"}, {"id": "L46", "name": "黑云过山", "level": "小凶", "verse": ["乌云压顶，山色阴沉", "风起云涌，暂避为宜", "今日之势，守多于攻", "落子谨慎，切莫强求"], "advice": "势有不利，暂避锋芒，等风头过去再动。"}, {"id": "L47", "name": "孤舟蓑笠", "level": "小凶", "verse": ["千山鸟飞尽，万径人踪灭", "孤舟蓑笠翁，独钓寒江雪", "今日之局，独木难支", "宜守勿攻，心宽自安"], "advice": "势有不利，暂避锋芒。此时的克制，是明日的伏笔。"}, {"id": "L48", "name": "迂回退避", "level": "小凶", "verse": ["前路有阻，转而绕行", "曲径通幽，殊途同归", "今日之势，退一步海阔", "落子避锋，另辟蹊径"], "advice": "正面冲突不利，换个路径更快。"}, {"id": "L49", "name": "月落西山", "level": "小凶", "verse": ["月已西斜，晨光未起", "昼夜交替，明暗未分", "今日之势，忍字最要", "落子从缓，静待天明"], "advice": "不上不下之日，多等等，别急着行动。"}, {"id": "L50", "name": "风雨兼程", "level": "小凶", "verse": ["风紧雨密，步履维艰", "咬牙坚持，尚可前行", "今日之棋，苦中求进", "落子谨慎，进退有节"], "advice": "艰难之日，坚持一下就过去了。"}, {"id": "L51", "name": "秋叶零落", "level": "小凶", "verse": ["一叶落下，天下皆秋", "昔日繁华，今朝凋零", "今日之势，休养为先", "落子从简，不求突破"], "advice": "状态下滑之日，少做多歇。"}, {"id": "L52", "name": "独木难支", "level": "中凶", "verse": ["大厦将倾，一木难支", "力有不逮，勿强为之", "今日之势，认清即胜", "落子从简，不作困兽斗"], "advice": "形势不利就承认，硬撑只会更累。"}, {"id": "L53", "name": "满盘皆输", "level": "中凶", "verse": ["一子错定，满盘皆非", "反思过往，方能新生", "今日之势，宜复盘不宜再战", "收子认负，另作打算"], "advice": "今日的输局是明日的教材，别急着扳回。"}, {"id": "L54", "name": "风声鹤唳", "level": "中凶", "verse": ["草木皆兵，风声鹤唳", "神经紧绷，越紧越乱", "今日之势，暂避为宜", "落子从简，勿多思虑"], "advice": "越焦虑越出错，今天不适合作关键决定。"}];
  var LEVEL_WEIGHTS = {"上上签": 5, "大吉": 12, "中吉": 20, "小吉": 25, "平": 20, "小凶": 12, "中凶": 6};
  var LEVEL_COLORS = {"上上签": "#8b1a1a", "大吉": "#a94b3d", "中吉": "#c17c3f", "小吉": "#8b7550", "平": "#5f6b6d", "小凶": "#4a5057", "中凶": "#2a2a2a"};
    
;
  var STYLE_LABELS = {
    gentle:'温柔治愈', spicy:'辛辣毒舌', backup:'铁哥后援', classic:'古风典雅',
    burning:'热血燃系', zen:'禅意清净', joke:'搞笑吐槽', master:'大师引言'
  };
  var STYLE_KEYS = Object.keys(STYLE_LABELS);

  var STORAGE_DAYS = 'luobo_days';        // 共享打卡日期集
  var STORAGE_TEACHER = 'luobo_teacher_config';
  var STORAGE_LUCK_TODAY = 'luobo_luck_today';
  var STORAGE_LAST_STYLE = 'luobo_last_style';
  var STORAGE_LAST_TEACHER = 'luobo_last_teacher_ids';
  var STORAGE_LUOBO_TODAY = 'luobo_checkin_today';  // v3.11 fix6：今日语录快照（每日一次）

  // ============ 工具函数 ============
  function $(id) { return document.getElementById(id); }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
  }
  function readJSON(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }
  function showToast(msg) {
    var t = $('dr-toast'); if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function() { t.classList.remove('show'); }, 1600);
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // ============ 打卡日历 ============
  function markToday() {
    var days = readJSON(STORAGE_DAYS, []);
    var k = todayKey();
    if (days.indexOf(k) === -1) {
      days.push(k);
      writeJSON(STORAGE_DAYS, days);
    }
    renderCalendar();
  }
  function renderCalendar() {
    var grid = $('dr-cal-grid');
    if (!grid) return;
    var days = readJSON(STORAGE_DAYS, []);
    var now = new Date();
    var y = now.getFullYear(), m = now.getMonth();
    var lastDay = new Date(y, m+1, 0).getDate();
    var todayD = now.getDate();
    var monthChecked = 0;
    grid.innerHTML = '';
    for (var d = 1; d <= lastDay; d++) {
      var key = y + '-' + (m+1) + '-' + d;
      var cell = document.createElement('div');
      cell.className = 'dr-cal-day';
      cell.textContent = d;
      if (days.indexOf(key) !== -1) { cell.classList.add('checked'); monthChecked++; }
      if (d === todayD) cell.classList.add('today');
      grid.appendChild(cell);
    }
    var cnt = $('dr-cal-count'); if (cnt) cnt.textContent = monthChecked + ' 天';
    // fix16 · 同步更新 header 副标题打卡数
    var hcnt = $('dr-header-count'); if (hcnt) hcnt.textContent = days.length;
  }

  // ============ Tab 切换 ============
  function switchTab(name) {
    var btns = document.querySelectorAll('.dr-tab-btn');
    for (var i=0;i<btns.length;i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-tab') === name);
    }
    var panels = ['luobo','luck','teacher'];
    for (var j=0;j<panels.length;j++) {
      var p = $('dr-tab-' + panels[j]);
      if (p) p.classList.toggle('active', panels[j] === name);
    }
    // v3.11 fix6：首次切到 luobo/luck 时按 localStorage 决定视图态；不再自动 renderLuoboQuote / drawLuck
    if (name === 'luobo') { syncLuoboView(); }
    if (name === 'luck')  { syncLuckView(); }
    if (name === 'teacher') {
      var cfg = readJSON(STORAGE_TEACHER, null);
      if (!cfg) { openTeacherConfig(); }
      else if (!$('teacher-title').__inited) { renderTeacherCard(); $('teacher-title').__inited = true; }
    }
  }

  // ============ 抽屉开关 ============
  function openPanel(tab) {
    var mask = $('daily-ritual-mask'), panel = $('daily-ritual-panel');
    if (!mask || !panel) return;
    mask.classList.add('show');
    panel.classList.add('show');
    document.body.style.overflow = 'hidden';
    renderCalendar();
    // v3.11 fix6：不再自动 renderLuoboQuote；按 localStorage 决定视图态
    syncLuoboView();
    if (tab) switchTab(tab);
  }
  function closePanel() {
    var mask = $('daily-ritual-mask'), panel = $('daily-ritual-panel');
    if (mask) mask.classList.remove('show');
    if (panel) panel.classList.remove('show');
    document.body.style.overflow = '';
    // 顺便关闭定制向导
    var cm = $('dr-teacher-config-modal');
    if (cm) cm.classList.remove('show');
  }

  // ============ 萝卜精 tab（v3.11 fix6 · 双态盲盒） ============

  // 切换到指定视图（cover / result）
  function setLuoboView(view) {
    var cover = $('dr-luobo-cover'), result = $('dr-luobo-result');
    if (!cover || !result) return;
    cover.classList.toggle('active', view === 'cover');
    result.classList.toggle('active', view === 'result');
    if (view === 'result') {
      result.classList.remove('dr-result-fade');
      // 强制 reflow，重启动画
      void result.offsetWidth;
      result.classList.add('dr-result-fade');
    }
  }

  // 按 localStorage 决定应显示哪个视图
  function syncLuoboView() {
    var stored = readJSON(STORAGE_LUOBO_TODAY, null);
    if (stored && stored.date === todayKey() && stored.style && stored.text) {
      // 今日已打卡：直接进入结果态，渲染当天的语录快照
      renderLuoboQuoteFromSnapshot(stored);
      setLuoboView('result');
    } else {
      // 未打卡：抽奖态
      setLuoboView('cover');
    }
  }

  // 生成新语录并写入今日快照
  function pickAndSaveLuoboQuote() {
    var lastStyle = localStorage.getItem(STORAGE_LAST_STYLE) || '';
    var pool = STYLE_KEYS.filter(function(k) { return k !== lastStyle; });
    var style = pick(pool);
    localStorage.setItem(STORAGE_LAST_STYLE, style);
    var q = pick(QUOTES[style].quotes);
    var text = (typeof q === 'string') ? q : (q.text || '');
    var s = pick(DAILY_SIGN);
    var snapshot = {
      date: todayKey(),
      style: style,
      label: QUOTES[style].label || STYLE_LABELS[style],
      icon: QUOTES[style].icon || '',
      text: text,
      signText: s.text,
      signSource: s.source
    };
    writeJSON(STORAGE_LUOBO_TODAY, snapshot);
    return snapshot;
  }

  // 从快照渲染 DOM
  function renderLuoboQuoteFromSnapshot(snap) {
    if (!snap) return;
    // badge 内置隐藏，仅用于内部记录风格类别
    var badge = $('luobo-style-badge');
    if (badge) badge.textContent = snap.label || '';
    $('luobo-quote-text').textContent = snap.text;
    $('luobo-quote-tag').textContent = '— 萝卜精' + (snap.icon ? ' ' + snap.icon : '');
    $('luobo-sign-text').textContent = snap.signText;
    $('luobo-sign-source').textContent = '— ' + snap.signSource;
  }

  // 兼容旧钩子：保留 renderLuoboQuote，内部调新逻辑
  function renderLuoboQuote() {
    var snap = pickAndSaveLuoboQuote();
    renderLuoboQuoteFromSnapshot(snap);
  }

  // 今日打卡：盲盒动画 + 抽签 + 切视图
  function luoboCheckin() {
    // 若今日已打卡，直接切到结果态（防重放）
    var stored = readJSON(STORAGE_LUOBO_TODAY, null);
    if (stored && stored.date === todayKey() && stored.text) {
      renderLuoboQuoteFromSnapshot(stored);
      setLuoboView('result');
      showToast('今日已打卡');
      return;
    }
    var btn = $('dr-luobo-cover-btn');
    var icon = $('dr-luobo-icon');
    if (btn) btn.disabled = true;
    if (icon) {
      icon.classList.remove('flipping');
      void icon.offsetWidth;
      icon.classList.add('flipping');
    }
    // 动画期间抽签，动画结束后切视图
    setTimeout(function() {
      var snap = pickAndSaveLuoboQuote();
      renderLuoboQuoteFromSnapshot(snap);
      markToday();
      setLuoboView('result');
      if (btn) btn.disabled = false;
      showToast('打卡成功');
    }, 620);
  }

  // ============ 每日棋运 tab（v3.11 fix6 · 摇签盲盒） ============
  function weightedPickLuck() {
    // 计算总权重
    var total = 0;
    for (var i=0;i<LUCK_SIGNS.length;i++) {
      total += (LEVEL_WEIGHTS[LUCK_SIGNS[i].level] || 1);
    }
    var r = Math.random() * total;
    var acc = 0;
    for (var j=0;j<LUCK_SIGNS.length;j++) {
      acc += (LEVEL_WEIGHTS[LUCK_SIGNS[j].level] || 1);
      if (r <= acc) return LUCK_SIGNS[j];
    }
    return LUCK_SIGNS[0];
  }

  // 切换到指定视图（cover / result）
  function setLuckView(view) {
    var cover = $('dr-luck-cover'), result = $('dr-luck-result');
    if (!cover || !result) return;
    cover.classList.toggle('active', view === 'cover');
    result.classList.toggle('active', view === 'result');
    if (view === 'result') {
      result.classList.remove('dr-result-fade');
      void result.offsetWidth;
      result.classList.add('dr-result-fade');
    }
  }

  // 按 localStorage 决定应显示哪个视图
  function syncLuckView() {
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (stored && stored.date === todayKey() && stored.id) {
      var sign = null;
      for (var i=0;i<LUCK_SIGNS.length;i++) {
        if (LUCK_SIGNS[i].id === stored.id) { sign = LUCK_SIGNS[i]; break; }
      }
      if (sign) {
        renderLuck(sign);
        setLuckView('result');
        return;
      }
    }
    setLuckView('cover');
  }

  // 摇签：动画 + 抽签 + 切视图（每日一次）
  function drawLuck() {
    // 已抽过：直接进入结果态
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (stored && stored.date === todayKey() && stored.id) {
      var existing = null;
      for (var i=0;i<LUCK_SIGNS.length;i++) {
        if (LUCK_SIGNS[i].id === stored.id) { existing = LUCK_SIGNS[i]; break; }
      }
      if (existing) {
        renderLuck(existing);
        setLuckView('result');
        showToast('今日已摇签');
        return;
      }
    }
    var btn = $('dr-luck-cover-btn');
    var icon = $('dr-luck-icon');
    if (btn) btn.disabled = true;
    if (icon) {
      icon.classList.remove('spinning');
      void icon.offsetWidth;
      icon.classList.add('spinning');
    }
    setTimeout(function() {
      var sign = weightedPickLuck();
      writeJSON(STORAGE_LUCK_TODAY, { date: todayKey(), id: sign.id });
      renderLuck(sign);
      markToday();
      setLuckView('result');
      if (btn) btn.disabled = false;
      showToast('已摇 · ' + sign.level);
    }, 580);
  }

  function renderLuck(sign) {
    $('luck-name').textContent = sign.name;
    $('luck-level-badge').textContent = sign.level;
    var color = LEVEL_COLORS[sign.level] || '#8b1a1a';
    $('luck-level-badge').style.background = color;
    $('luck-name').style.color = color;
    var verse = $('luck-verse');
    verse.innerHTML = '';
    for (var i=0;i<sign.verse.length;i++) {
      var line = document.createElement('div');
      line.className = 'luck-verse-line';
      line.textContent = sign.verse[i];
      verse.appendChild(line);
    }
    $('luck-advice').textContent = sign.advice;
  }

  // ============ 教师文案卡 tab ============
  function openTeacherConfig() {
    var m = $('dr-teacher-config-modal');
    if (m) m.classList.add('show');
    var cfg = readJSON(STORAGE_TEACHER, null) || {};
    // 恢复已选
    selectConfigOpt('cfg-position-options', cfg.position);
    selectConfigOpt('cfg-tone-options', cfg.tone);
    if (cfg.signature) $('cfg-signature-input').value = cfg.signature;
    updateConfigConfirmBtn();
  }
  function selectConfigOpt(containerId, value) {
    var opts = document.querySelectorAll('#' + containerId + ' .dr-config-opt');
    for (var i=0;i<opts.length;i++) {
      opts[i].classList.toggle('selected', opts[i].getAttribute('data-value') === value);
    }
  }
  function updateConfigConfirmBtn() {
    var p = document.querySelector('#cfg-position-options .dr-config-opt.selected');
    var t = document.querySelector('#cfg-tone-options .dr-config-opt.selected');
    var btn = $('cfg-confirm-btn');
    if (btn) btn.disabled = !(p && t);
  }
  function teacherConfigConfirm() {
    var p = document.querySelector('#cfg-position-options .dr-config-opt.selected');
    var t = document.querySelector('#cfg-tone-options .dr-config-opt.selected');
    if (!p || !t) { showToast('请选择定位和调性'); return; }
    var sig = $('cfg-signature-input').value.trim();
    var cfg = {
      position: p.getAttribute('data-value'),
      tone: t.getAttribute('data-value'),
      signature: sig
    };
    writeJSON(STORAGE_TEACHER, cfg);
    $('dr-teacher-config-modal').classList.remove('show');
    renderTeacherCard();
    showToast('定制完成');
  }
  function teacherConfigCancel() {
    $('dr-teacher-config-modal').classList.remove('show');
    // 先看看：使用默认（启蒙老师·温和引导）
    var cfg = readJSON(STORAGE_TEACHER, null);
    if (!cfg) {
      writeJSON(STORAGE_TEACHER, { position:'启蒙老师', tone:'温和引导', signature:'', preview:true });
    }
    renderTeacherCard();
  }
  function scoreCard(card, cfg) {
    var s = 0;
    if (card.position === cfg.position) s += 3;
    if (card.tone === cfg.tone) s += 2;
    return s;
  }
  function selectTeacherCard() {
    var cfg = readJSON(STORAGE_TEACHER, { position:'启蒙老师', tone:'温和引导', signature:'' });
    var recent = readJSON(STORAGE_LAST_TEACHER, []);
    // 打分池
    var scored = TEACHER_CARDS.map(function(c) {
      return { card: c, score: scoreCard(c, cfg) };
    });
    // 按分组
    scored.sort(function(a,b) { return b.score - a.score; });
    var maxScore = scored[0].score;
    // 高分池
    var pool = scored.filter(function(x) { return x.score === maxScore; }).map(function(x) { return x.card; });
    // 排除最近 5 张
    var filtered = pool.filter(function(c) { return recent.indexOf(c.id) === -1; });
    if (filtered.length === 0) filtered = pool;  // 池小则允许重复
    // 如果高分池太小（<8），扩到次高分
    if (filtered.length < 8 && scored.length > pool.length) {
      var secondScore = scored[pool.length] ? scored[pool.length].score : 0;
      var extra = scored.filter(function(x) { return x.score === secondScore; }).map(function(x) { return x.card; });
      var extraFiltered = extra.filter(function(c) { return recent.indexOf(c.id) === -1; });
      filtered = filtered.concat(extraFiltered.length ? extraFiltered : extra);
    }
    var card = pick(filtered);
    // 更新历史
    recent.push(card.id);
    if (recent.length > 5) recent.shift();
    writeJSON(STORAGE_LAST_TEACHER, recent);
    return { card: card, cfg: cfg };
  }
  function renderTeacherCard() {
    var r = selectTeacherCard();
    var card = r.card, cfg = r.cfg;
    $('teacher-theme-tag').textContent = card.theme;
    $('teacher-title').textContent = card.title;
    $('teacher-body').textContent = card.body;
    $('teacher-position-hint').textContent = cfg.position + ' · ' + cfg.tone;
    $('teacher-signature').textContent = cfg.signature ? ('— ' + cfg.signature) : '— 老师自填';
  }
  function teacherNext() {
    renderTeacherCard();
    markToday();
  }
  function teacherReconfig() {
    openTeacherConfig();
  }
  function teacherCopyText() {
    var title = $('teacher-title').textContent;
    var body = $('teacher-body').textContent;
    var sig = $('teacher-signature').textContent;
    var text = title + '\n\n' + body + '\n\n' + sig;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('已复制 · 可粘贴到朋友圈');
      }, function() { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
    markToday();
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.top = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast('已复制'); } catch(e) { showToast('复制失败，请手动选中'); }
    document.body.removeChild(ta);
  }

  // ============ 教师文案卡 · PNG 下载 ============
  function teacherDownloadPNG() {
    var title = $('teacher-title').textContent;
    var body = $('teacher-body').textContent;
    var theme = $('teacher-theme-tag').textContent;
    var sig = $('teacher-signature').textContent;

    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');

    // 背景
    var grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#fdfbf5');
    grad.addColorStop(1, '#f5efe0');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    // 边框装饰
    ctx.strokeStyle = 'rgba(139,26,26,.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W-60, H-60);
    ctx.strokeStyle = 'rgba(139,26,26,.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, W-84, H-84);

    // 顶部主题标签
    ctx.fillStyle = 'rgba(139,26,26,.08)';
    var tagW = 120, tagH = 32;
    var tagX = (W - tagW) / 2, tagY = 80;
    roundRect(ctx, tagX, tagY, tagW, tagH, 4); ctx.fill();
    ctx.fillStyle = '#8b1a1a';
    ctx.font = '18px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(theme, W/2, tagY + tagH/2);

    // 标题
    ctx.fillStyle = '#8b1a1a';
    ctx.font = 'bold 32px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    wrapText(ctx, title, W/2, 145, W-140, 44, 'center');

    // 分割线
    var titleLines = Math.ceil((title.length * 32) / (W-140));
    var bodyStart = 145 + titleLines * 44 + 24;
    ctx.strokeStyle = 'rgba(139,26,26,.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(120, bodyStart - 12); ctx.lineTo(W-120, bodyStart - 12);
    ctx.stroke();

    // 正文
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '22px "PingFang SC","STSong",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    wrapText(ctx, body, 80, bodyStart, W-160, 38, 'left');

    // 底部落款
    ctx.strokeStyle = 'rgba(0,0,0,.1)';
    ctx.beginPath();
    ctx.moveTo(80, H-140); ctx.lineTo(W-80, H-140);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '16px "PingFang SC",sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(sig, W-80, H-110);

    // 底部品牌水印
    ctx.fillStyle = '#a08b5c';
    ctx.font = '14px "PingFang SC",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('萝卜干聊围棋教育 · 每日棋事簿', W/2, H-70);

    // 下载
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = '教师文案卡_' + Date.now() + '.png';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 500);
      showToast('图片已生成');
      markToday();
    }, 'image/png');
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, align) {
    var chars = text.split('');
    var line = '';
    var offsetY = 0;
    for (var i=0;i<chars.length;i++) {
      var testLine = line + chars[i];
      var testWidth = ctx.measureText(testLine).width;
      if (chars[i] === '\n') {
        ctx.fillText(line, x, y + offsetY);
        line = ''; offsetY += lineHeight;
      } else if (testWidth > maxWidth && line.length > 0) {
        ctx.fillText(line, x, y + offsetY);
        line = chars[i]; offsetY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, y + offsetY);
    return offsetY;
  }

  // ============ v3.11 fix6 · 通用竖版卡片 canvas 底 ============
  function _drawCardBase(ctx, W, H) {
    var grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#fdfbf5');
    grad.addColorStop(1, '#f5efe0');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);
    ctx.strokeStyle = 'rgba(139,26,26,.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W-60, H-60);
    ctx.strokeStyle = 'rgba(139,26,26,.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(42, 42, W-84, H-84);
  }
  function _drawCardBrand(ctx, W, H) {
    ctx.strokeStyle = 'rgba(0,0,0,.1)';
    ctx.beginPath();
    ctx.moveTo(80, H-140); ctx.lineTo(W-80, H-140);
    ctx.stroke();
    ctx.fillStyle = '#a08b5c';
    ctx.font = '14px "PingFang SC",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('萝卜干聊围棋教育 · 每日棋事簿', W/2, H-90);
    ctx.fillStyle = '#8a7550';
    ctx.font = '12px "PingFang SC",sans-serif';
    ctx.fillText(_todayLabel(), W/2, H-68);
  }
  function _todayLabel() {
    var d = new Date();
    var pad = function(n) { return n < 10 ? '0'+n : ''+n; };
    return d.getFullYear() + '.' + pad(d.getMonth()+1) + '.' + pad(d.getDate());
  }
  function _saveCanvas(canvas, filename) {
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function() { URL.revokeObjectURL(url); }, 500);
      showToast('图片已生成');
      markToday();
    }, 'image/png');
  }

  // 萝卜精语录卡 · 保存为图片
  function luoboSaveImage() {
    var snap = readJSON(STORAGE_LUOBO_TODAY, null);
    if (!snap || snap.date !== todayKey() || !snap.text) {
      showToast('请先今日打卡');
      return;
    }
    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    _drawCardBase(ctx, W, H);

    // 顶部主题
    ctx.fillStyle = '#8b1a1a';
    ctx.font = 'bold 30px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('今 日 一 句', W/2, 96);
    ctx.strokeStyle = 'rgba(139,26,26,.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(240, 148); ctx.lineTo(510, 148);
    ctx.stroke();

    // 主语录
    ctx.fillStyle = '#2a2a2a';
    ctx.font = '28px "Songti SC","STSong",serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    var offsetY = wrapText(ctx, snap.text, 90, 200, W-180, 46, 'left');
    var quoteEnd = 200 + offsetY + 46;

    // 落款
    ctx.fillStyle = '#8a7550';
    ctx.font = '18px "Songti SC","STSong",serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('— 萝卜精' + (snap.icon ? ' ' + snap.icon : ''), W-90, quoteEnd + 8);

    // 每日一签盒
    var signY = Math.max(quoteEnd + 80, 620);
    ctx.fillStyle = 'rgba(160,139,92,.10)';
    roundRect(ctx, 80, signY, W-160, 180, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(160,139,92,.28)';
    ctx.lineWidth = 1;
    roundRect(ctx, 80, signY, W-160, 180, 12);
    ctx.stroke();

    ctx.fillStyle = '#a08b5c';
    ctx.font = '13px "PingFang SC",sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('每 日 一 签', 104, signY + 18);

    ctx.fillStyle = '#3a2a1a';
    ctx.font = '20px "Songti SC","STSong",serif';
    var signOff = wrapText(ctx, snap.signText, 104, signY + 46, W-208, 30, 'left');
    ctx.fillStyle = '#8a7550';
    ctx.font = '13px "PingFang SC",sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('— ' + snap.signSource, W-104, signY + 46 + signOff + 30);

    _drawCardBrand(ctx, W, H);
    _saveCanvas(canvas, '萝卜精语录_' + _todayLabel() + '.png');
  }

  // 卦签 · 保存为图片
  function luckSaveImage() {
    var stored = readJSON(STORAGE_LUCK_TODAY, null);
    if (!stored || stored.date !== todayKey() || !stored.id) {
      showToast('请先摇一签');
      return;
    }
    var sign = null;
    for (var i=0;i<LUCK_SIGNS.length;i++) {
      if (LUCK_SIGNS[i].id === stored.id) { sign = LUCK_SIGNS[i]; break; }
    }
    if (!sign) { showToast('签数据缺失'); return; }

    var W = 750, H = 1000;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    _drawCardBase(ctx, W, H);

    var color = LEVEL_COLORS[sign.level] || '#8b1a1a';

    // 顶部等级 badge
    ctx.fillStyle = color;
    var badgeW = 180, badgeH = 46;
    var badgeX = (W - badgeW) / 2, badgeY = 100;
    roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 23);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sign.level, W/2, badgeY + badgeH/2);

    // 签名
    ctx.fillStyle = color;
    ctx.font = 'bold 60px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(sign.name, W/2, 190);

    // 分割线（虚线两条）
    ctx.strokeStyle = 'rgba(139,26,26,.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(120, 290); ctx.lineTo(W-120, 290);
    ctx.stroke();

    // 四句签诗
    ctx.setLineDash([]);
    ctx.fillStyle = '#3a2a1a';
    ctx.font = '26px "Songti SC","STSong",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var lineY = 320;
    for (var k=0;k<sign.verse.length;k++) {
      ctx.fillText(sign.verse[k], W/2, lineY);
      lineY += 46;
    }

    ctx.strokeStyle = 'rgba(139,26,26,.28)';
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(120, lineY + 8); ctx.lineTo(W-120, lineY + 8);
    ctx.stroke();
    ctx.setLineDash([]);

    // 解签（advice）
    ctx.fillStyle = color;
    ctx.font = 'bold 18px "Songti SC","STSong",serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('解 · ', 90, lineY + 40);
    ctx.fillStyle = '#555';
    ctx.font = '18px "PingFang SC",sans-serif';
    wrapText(ctx, sign.advice, 130, lineY + 40, W-220, 30, 'left');

    _drawCardBrand(ctx, W, H);
    _saveCanvas(canvas, '今日棋运_' + sign.name + '_' + _todayLabel() + '.png');
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    var tabs = document.querySelectorAll('.dr-tab-btn');
    for (var i=0;i<tabs.length;i++) {
      tabs[i].addEventListener('click', function() {
        switchTab(this.getAttribute('data-tab'));
      });
    }
    // 定制向导选项
    var opts = document.querySelectorAll('#cfg-position-options .dr-config-opt, #cfg-tone-options .dr-config-opt');
    for (var j=0;j<opts.length;j++) {
      opts[j].addEventListener('click', function() {
        var parent = this.parentElement;
        var sibs = parent.querySelectorAll('.dr-config-opt');
        for (var k=0;k<sibs.length;k++) sibs[k].classList.remove('selected');
        this.classList.add('selected');
        updateConfigConfirmBtn();
      });
    }
    // ESC 关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        var panel = $('daily-ritual-panel');
        if (panel && panel.classList.contains('show')) closePanel();
      }
    });
  }

  // ============ 暴露全局 ============
  window.__luoboOpenDailyRitual = function(tab) { openPanel(tab); };
  window.__closeDailyRitual = closePanel;
  window.__luoboCheckin = luoboCheckin;
  window.__luckDraw = drawLuck;                  // v3.11 fix6：盲盒版，每日一次
  window.__luoboSaveImage = luoboSaveImage;      // v3.11 fix6：语录卡保存
  window.__luckSaveImage = luckSaveImage;        // v3.11 fix6：卦签保存
  window.__teacherCopyText = teacherCopyText;
  window.__teacherDownloadPNG = teacherDownloadPNG;
  window.__teacherNext = teacherNext;
  window.__teacherReconfig = teacherReconfig;
  window.__teacherConfigConfirm = teacherConfigConfirm;
  window.__teacherConfigCancel = teacherConfigCancel;
  // 兼容旧钩子（v3.10 -> v3.11 过渡）
  window.__luoboOpenLuoboSpirit = function() { openPanel('luobo'); };

  // ============ 初始化 ============
  // fix: 页面加载时同步更新打卡天数显示（不依赖弹窗打开）
  function initHeaderCount() {
    var hcnt = $('dr-header-count');
    if (hcnt) {
      var days = readJSON(STORAGE_DAYS, []);
      hcnt.textContent = days.length;
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { bindEvents(); initHeaderCount(); });
  } else {
    bindEvents(); initHeaderCount();
  }

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
/* v3.15 fix21 · 补全 3 位缺失 people 主传记（本因坊秀策 / 曹薰铉 / 朴廷桓）
   星图节点点击后 __luoboJumpToMaster 严格匹配需要这些 title 存在 */
(function(){
  if(!window.CULTURE_DATA && typeof CULTURE_DATA === 'undefined') return;
  var CD = (typeof CULTURE_DATA !== 'undefined') ? CULTURE_DATA : window.CULTURE_DATA;
  if(!CD || !CD.people || !CD.people.articles) return;
  var arts = CD.people.articles;
  var addlist = [{"title": "日 · 本因坊秀策：御城棋十九连胜，34 岁陨落的江户「棋圣」", "body": "\n<p>本因坊秀策（1829-1862），本名<strong>桑原虎次郎</strong>，出生于日本备后国（今广岛县福山市）一个渔村。他是江户末期最伟大的棋手，日本围棋史上公认的「棋圣」之一，也是今天全世界围棋爱好者最熟悉的名字——因为他，就是漫画《棋魂》里<strong>藤原佐为附身角色</strong>的原型。</p>\n\n<h4>神童入门：一世名人的关门弟子</h4>\n\n<p>虎次郎五岁开始接触围棋，六岁时已能击败当地成年高手。九岁那年，他被引荐到江户（今东京），拜入<strong>本因坊丈和</strong>（世袭本因坊第十二世·「江户三棋圣」之一）的门下——成为他的<strong>关门弟子</strong>。丈和亲自给他取了个名字：<strong>秀策</strong>。</p>\n\n<p>本因坊家是江户时代日本围棋四大家之首（本因坊、井上、安井、林），世袭掌管着日本围棋的最高权威。能被丈和亲收为徒，秀策的天赋可想而知。</p>\n\n<h4>秀策流：一手也不亏的开局</h4>\n\n<p>秀策成年之后，创立了震动棋坛的<strong>「秀策流」布局</strong>——一种以稳健占地为核心的开局思路。其中最著名的一手，是他标志性的<strong>「一・三・五」黑棋定式</strong>（三连星式的稳健取地）。这套布局在他生涯中执黑<strong>几乎没输过</strong>，因此被后世称为「不败的秀策流」。</p>\n\n<p>直到今天，「秀策流」依然是围棋启蒙教材里最经典的布局范本之一。学棋的孩子第一次系统地接触「布局思想」，往往就从秀策的棋谱开始。</p>\n\n<h4>御城棋十九连胜：日本围棋史上最耀眼的纪录</h4>\n\n<p>江户时代，日本围棋界最高级别的赛事是<strong>「御城棋」</strong>——由幕府将军亲自主持、四大家棋手在将军面前对局的年度盛事。一年一次，胜负关乎家族荣誉。</p>\n\n<p>秀策从 1849 年开始出战御城棋，直到 1861 年，累计参加<strong>19 局</strong>——<strong>19 战 19 胜，全胜！</strong>这是日本围棋史上御城棋的<strong>最长连胜纪录</strong>，也是至今无人打破的传奇。棋界评价：<strong>「秀策的十九连胜，等于把整个江户后期最强的日本棋手全部干净利落地击败了。」</strong></p>\n\n<h4>「耳赤妙手」：明治维新前最著名的一手</h4>\n\n<p>秀策一生留下过许多千古名局，但最出名的一手，是 1846 年他 17 岁那年与前辈棋手<strong>幻庵因硕</strong>（井上家家督）对局中下出的<strong>「耳赤之手」</strong>。</p>\n\n<p>据观棋记录，这一手下出后，幻庵因硕的<strong>耳朵瞬间涨红</strong>——因为他一眼就看出，这一手同时兼顾了攻防、占地、大局四种功能，是一手<strong>「无懈可击」的绝妙好棋</strong>。这局棋最终秀策获胜，「耳赤妙手」也成为日本围棋史上被讨论最多的一手棋。</p>\n\n<h4>34 岁陨落：一场瘟疫夺走了棋圣</h4>\n\n<p>秀策的生命定格在 34 岁那年。<strong>1862 年夏天，江户爆发霍乱大瘟疫</strong>，本因坊家的宅邸也未能幸免。当时秀策担任本因坊十四世的师父<strong>秀和</strong>已经病倒，秀策本人却坚持在家里照料染病的师兄弟——最终自己也感染霍乱，于同年 8 月 10 日去世。</p>\n\n<p>他英年早逝，但已经被内定为<strong>本因坊家的下一任家督（十四世本因坊）</strong>——如果他多活十年，日本围棋史很可能会被彻底改写。</p>\n\n<h4>《棋魂》与秀策：全世界孩子重新认识围棋</h4>\n\n<p>2000 年前后，日本漫画家<strong>堀田由美 × 小畑健</strong>创作的漫画《棋魂》（Hikaru no Go）风靡全球——主角进藤光的身上，附着着一位平安时代的围棋大师<strong>藤原佐为</strong>的灵魂。而佐为的历史原型，就是本因坊秀策——漫画里明确设定，佐为在江户时代曾附身于一位少年棋手，那少年就是秀策。</p>\n\n<p>《棋魂》让整整一代人（包括中国、日本、韩国、欧美的许多小孩）第一次接触围棋，据日韩围棋协会的公开统计，那几年学棋人口翻了几倍。<strong>秀策以「藤原佐为」的名字，第二次影响了世界。</strong></p>\n\n<h4>为什么值得讲给孩子</h4>\n\n<p>秀策的故事，特别适合讲给<strong>有点天赋、但性格温和不喜欢争胜</strong>的孩子——</p>\n\n<p><strong>第一，天赋不是拿来炫的，是拿来磨的。</strong>秀策九岁就已经被认为是「几百年一见的天才」，但他没有骄傲。他一辈子最多的时间都是在<strong>安静复盘</strong>——一手一手地琢磨，磨到「一手也不亏」的境界。孩子有天赋，是幸运；愿意花几万小时安静磨棋，才是本事。</p>\n\n<p><strong>第二，稳健也能一直赢。</strong>「秀策流」不是什么惊天动地的招法，它就是「一手不亏地占地」。听起来平淡，但秀策靠这套布局赢了大半辈子的棋。<strong>孩子学棋，不必羡慕别人下得多么花哨——把每一手都下得踏实，就已经赢在了长期赛道。</strong></p>\n\n<p><strong>第三，34 岁也可以留下不朽。</strong>秀策只活了 34 岁，却被后世尊为「棋圣」。<strong>人生长短不重要，重要的是你把每一件事做到什么程度。</strong>这句话我们做教育的，每每讲到秀策，都会跟孩子和家长郑重说一遍。</p>\n"}, {"title": "韩 · 曹薰铉：韩国「围棋皇帝」，1989 应氏杯让韩国世界冠军从 0 到 1", "body": "\n<p>曹薰铉（1953-），出生于韩国全罗南道<strong>木浦市</strong>。他是韩国围棋从「学日本」到「打日本」再到「统治世界」这三十年转折的核心人物，被韩国棋界尊称为<strong>「围棋皇帝」</strong>——这个称号在韩国至今只属于他一人。</p>\n\n<h4>9 岁赴日：濑越宪作最后一位弟子</h4>\n\n<p>曹薰铉 6 岁开始学棋，9 岁那年做了一个改变一生的决定：<strong>独自赴日本学棋</strong>。他被推荐进入日本棋院泰斗<strong>濑越宪作九段</strong>的门下——濑越是日本围棋界的传奇教练，一生只收过三位<strong>亲传弟子</strong>：桥本宇太郎、吴清源、以及最后一位——曹薰铉。</p>\n\n<p>在日本，濑越对曹薰铉说：「你有天赋，但更重要的是要有<strong>把整盘棋看透的眼睛</strong>。」这句话曹薰铉记了一辈子。他在日本住了整整<strong>13 年</strong>，从 9 岁到 22 岁，从少年到成年，学到了当时全世界最系统的围棋训练体系。</p>\n\n<h4>1972 年归国：改变韩国围棋的一次回国</h4>\n\n<p>1972 年，19 岁的曹薰铉<strong>回到韩国</strong>——当时的韩国围棋，与中国、日本相比，仍处于「学徒阶段」。曹薰铉带回来的是<strong>日本围棋 200 年沉淀的一整套训练方法论</strong>，这几乎是重启韩国围棋的一次系统级引进。</p>\n\n<p>回国后不久，曹薰铉就横扫韩国棋界，先后夺得国手战、名人战、王位战、覇王战、棋圣战……等几乎所有韩国国内主要头衔战。<strong>整个 1970 到 1980 年代的韩国棋坛，「曹薰铉时代」是唯一的关键词</strong>。他一人手握 6~9 个头衔的「大满贯时期」，长达 10 多年。</p>\n\n<h4>1989 年 · 首届应氏杯：让韩国世界冠军从 0 到 1</h4>\n\n<p>1988 年，台湾企业家<strong>应昌期</strong>先生出资创办<strong>「应氏杯世界职业围棋锦标赛」</strong>——冠军奖金 40 万美元，是当时世界围棋界规格最高、奖金最丰厚的顶级大赛。这也是围棋<strong>第一个真正意义上的「世界大赛」</strong>。</p>\n\n<p>1988-1989 年第一届应氏杯，全世界围棋界都以为「日本或中国选手」将夺冠。曹薰铉作为韩国唯一代表出战，一路杀进决赛。<strong>决赛对手是中国的聂卫平</strong>——那位当时刚刚在中日擂台赛上带领中国围棋崛起的「棋圣」。</p>\n\n<p>决赛在新加坡打响，五番棋赛制。开局<strong>聂卫平 2:1 领先</strong>，全世界都以为冠军已定。<strong>但曹薰铉在最后两局连扳两盘，最终 3:2 逆转夺冠——</strong>成为围棋世界大赛的<strong>第一位冠军</strong>，也让韩国围棋的世界冠军数字从 0 变成 1。</p>\n\n<p>据韩国棋界公开的记录，曹薰铉从新加坡回国那天，首尔金浦机场<strong>数万人自发到机场迎接</strong>，从机场到市中心的路上人山人海——这是韩国体育史上第一次为围棋棋手举行的国民级欢迎仪式。<strong>韩国政府随后授予曹薰铉「银冠体育勋章」</strong>——之前这个勋章只给奥运会金牌选手。</p>\n\n<h4>「燕子飞刀」的快棋战神</h4>\n\n<p>曹薰铉的棋风有个响亮的绰号——<strong>「燕子飞刀」</strong>。他的招法轻盈、快速、锋利，就像燕子在空中划过一道刀光。他尤其擅长<strong>快棋赛</strong>——在有限时间里瞬间做出最优判断。棋界评价：<strong>「曹薰铉打快棋时，对手连思考的时间都跟不上他的节奏。」</strong></p>\n\n<p>他一生获得过<strong>160 多个头衔冠军</strong>——这在世界围棋史上是极为罕见的数字。除了应氏杯外，他还多次拿下富士通杯、春兰杯、三星杯等世界大赛。</p>\n\n<h4>徒弟李昌镐：师父的礼物</h4>\n\n<p>曹薰铉一生最了不起的事，可能不是他自己夺了多少冠军——而是他<strong>只收过一位入室弟子：李昌镐</strong>。</p>\n\n<p>1986 年，11 岁的李昌镐被父亲带到曹薰铉家里，希望能拜师。曹薰铉看了他几盘棋后，做了个决定：<strong>让李昌镐搬进自己家里</strong>——住在师父家、吃师父家的饭、每天跟师父下棋。这一住就是 6 年。</p>\n\n<p>然后奇迹发生了：<strong>李昌镐在 16 岁时首次战胜师父曹薰铉，17 岁夺得世界冠军。</strong>徒弟成了自己一生最强的对手，也成了世界围棋新的霸主。曹薰铉常笑说：<strong>「我最大的错误，就是把李昌镐教得比我还好。」</strong>——但每次说完这句话，他的眼里都全是骄傲。</p>\n\n<h4>2016 · 76 岁仍在下棋</h4>\n\n<p>曹薰铉进入六七十岁之后，依然在韩国棋院一线出战。<strong>2016 年他 63 岁那年</strong>，他还闯入了 LG 杯世界大赛的四强——一个 60 多岁的老将挑战 20 岁的年轻高手，全世界棋迷都为之动容。</p>\n\n<p>他还是<strong>韩国国会议员</strong>（2016-2020 年任期），把围棋议题正式带入韩国国家治理的层面——推动学校围棋教育、体育文化立法。<strong>他不但改变了韩国围棋，还改变了韩国社会对围棋的认知。</strong></p>\n\n<h4>为什么值得讲给孩子</h4>\n\n<p>曹薰铉的故事，特别适合讲给<strong>「有点天赋、想走远路」的孩子</strong>——</p>\n\n<p><strong>第一，最好的教练是「让你把整盘棋看透的眼睛」。</strong>濑越宪作教给曹薰铉的不是招法，是「看棋的高度」。孩子学棋，能遇到一位这样的老师，比背 1000 个定式都重要。</p>\n\n<p><strong>第二，19 岁回国改变一个国家的围棋。</strong>曹薰铉带回韩国的，不是他自己拿了多少冠军，而是<strong>一整套系统的训练方法论</strong>。<strong>真正伟大的人，不只是自己厉害，更能把自己学到的东西完整地传下去。</strong>做家长、做老师，最难的都是这件事。</p>\n\n<p><strong>第三，最好的师父，会让徒弟超过自己。</strong>曹薰铉与李昌镐师徒，是围棋史上最动人的一段传承。<strong>孩子将来能走到多远，看老师、看家长、看陪伴他的人愿不愿意托举他到自己够不到的高度。</strong></p>\n"}, {"title": "韩 · 朴廷桓：韩国 90 后领军人，从「小李昌镐」到 AI 时代的自我重塑", "body": "\n<p>朴廷桓（1993-），出生于韩国<strong>釜山</strong>。他是韩国 90 后棋手的领军人物，长期占据<strong>韩国等级分第一</strong>的位置超过十年，是韩国 21 世纪 10 年代到 20 年代的绝对头号棋手。</p>\n\n<h4>7 岁定段：韩国棋院最年少入段之一</h4>\n\n<p>朴廷桓 5 岁学棋，7 岁那年在韩国棋院的定段赛中通过考核，<strong>正式成为职业初段</strong>——这个年龄是当时韩国棋院历史上最年少的入段者之一。他的天赋被韩国棋界称为「几十年一遇」。</p>\n\n<h4>「小李昌镐」的传承</h4>\n\n<p>朴廷桓成长的年代，正是<strong>李昌镐时代的尾声</strong>——李昌镐仍在世界棋坛叱咤风云，但已经开始进入职业生涯的下半段。朴廷桓的棋风被韩国棋界评价为<strong>「与李昌镐一脉相承」</strong>——冷静、厚重、精算深读，官子精准。因此他很小就被冠以<strong>「小李昌镐」</strong>的称号，一度被视为韩国棋界的接班人。</p>\n\n<p>但朴廷桓自己在采访中说过：<strong>「我不想只是「小李昌镐」——我想成为朴廷桓。」</strong>——这句话后来被证明是他棋艺一生最重要的自我定义。</p>\n\n<h4>2012 年 · 首个世界冠军：GS 加德士杯</h4>\n\n<p>2012 年，19 岁的朴廷桓夺得<strong>GS 加德士杯</strong>——他的第一个个人世界大赛冠军。此后他一路狂奔：</p>\n\n<ul>\n  <li><strong>2013 年 应氏杯</strong>——他 20 岁，夺得应氏杯冠军，成为最年轻的应氏杯冠军之一；</li>\n  <li><strong>2014 年 三星杯</strong>——蝉联三星杯冠军；</li>\n  <li><strong>2015 年 LG 杯</strong>——夺得 LG 杯冠军；</li>\n  <li><strong>2016 年 春兰杯</strong>——夺得春兰杯冠军；</li>\n  <li>此后又多次问鼎<strong>春兰杯、三星杯、LG 杯</strong>等世界大赛。</li>\n</ul>\n\n<p>他在 2020 年前后，累计世界大赛冠军数<strong>已经超过 10 个</strong>——在同代棋手中稳居前列。</p>\n\n<h4>AI 时代的自我重塑</h4>\n\n<p>2016 年 3 月，AlphaGo 横空出世，围棋界从此改变。当时的头部棋手，都要面对同一个问题：<strong>怎么与 AI 一起训练？</strong></p>\n\n<p>朴廷桓的选择极具代表性——他<strong>没有回避 AI，而是主动拥抱</strong>。他在采访中说：「AI 是围棋的老师，我要向它学习。」——2017 年起，他成为韩国棋界最早、最系统使用 AI 训练的顶尖棋手之一。他的棋风也从早期<strong>「小李昌镐」的厚重稳健</strong>，逐渐融合了<strong>AI 训练带来的锐利深读</strong>——形成了 AI 时代独特的<strong>「新朴廷桓风格」</strong>。</p>\n\n<p>2019 年，他登顶<strong>世界围棋等级分第一</strong>——这是韩国棋手在 AI 时代首次登上世界第一。此后多年里，他都是全世界排名前 5 的头部棋手之一。</p>\n\n<h4>与柯洁、申真谞的三方鼎立</h4>\n\n<p>2010 年代到 2020 年代的世界围棋头部，形成了三方鼎立的格局：</p>\n\n<ul>\n  <li><strong>柯洁</strong>（中国 · 1997 年生）——中国 90 末世代第一人；</li>\n  <li><strong>朴廷桓</strong>（韩国 · 1993 年生）——韩国 90 前中世代第一人；</li>\n  <li><strong>申真谞</strong>（韩国 · 2000 年生）——韩国 00 后新王，「申工智能」。</li>\n</ul>\n\n<p>三人年龄接近、身份对称，在无数世界大赛中反复对抗，成为这个时代最引人注目的棋盘对话。<strong>据韩国棋院统计，朴廷桓与柯洁的正式对局超过 40 次，与申真谞的正式对局超过 50 次</strong>——都是围棋史上最丰富的顶尖棋手对局档案之一。</p>\n\n<h4>2022 年 · 韩国国家队队长</h4>\n\n<p>2022 年起，朴廷桓开始担任<strong>韩国国家围棋队队长</strong>——负责韩国队在国际大赛中的组织与训练。这个位置在韩国棋界地位极高，此前从曹薰铉、李昌镐一路传下来。<strong>29 岁那年就担任国家队队长</strong>，朴廷桓成为韩国国家队历史上最年轻的队长之一。</p>\n\n<h4>为什么值得讲给孩子</h4>\n\n<p>朴廷桓的故事，特别适合讲给<strong>「有天赋、但被期待\"变成谁\"的孩子」</strong>——</p>\n\n<p><strong>第一，「小 XX」不是终点，是起点。</strong>朴廷桓一辈子最抵制的一件事，就是被叫「小李昌镐」——不是他不尊重李昌镐，而是他知道<strong>「模仿别人」永远走不出自己的路</strong>。<strong>孩子被大家期待「像谁一样」的时候，最重要的是心里那句：「我要成为我自己。」</strong></p>\n\n<p><strong>第二，AI 是新工具，不是敌人。</strong>2016 年 AI 冲击围棋界的时候，很多老一辈棋手抵触、逃避、否定。朴廷桓选择了<strong>「向 AI 学习」</strong>——他把 AI 当成一位免费的、永远不累的、可以陪自己复盘的老师。<strong>今天的孩子面对 AI 也是一样的：不要害怕，要学会怎么用它。</strong></p>\n\n<p><strong>第三，赢一场很难，长期在头部十年更难。</strong>朴廷桓夺过 10 多个世界冠军，但更了不起的是——他在 2013 年到 2023 年这十年里，<strong>一直都是韩国等级分第一</strong>。<strong>孩子学任何东西，短暂的爆发不难，能长期保持在头部，才是真本事。</strong></p>\n"}];
  var existing = {};
  for(var i=0;i<arts.length;i++){ existing[arts[i].title] = true; }
  for(var j=0;j<addlist.length;j++){
    if(!existing[addlist[j].title]) arts.push(addlist[j]);
  }
})();
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
/* ================= CG 命名空间（课堂小游戏 v1）================= */
(function(){
  'use strict';
  var CG = window.CG = window.CG || {};
  var LS = window.localStorage;

  // ------- 常量 -------
  var K_TEACHERS = 'luobogan_cg_teachers';
  var K_CURRENT  = 'luobogan_cg_current_teacher';
  var K_CURRENT_STU = 'luobogan_cg_current_student';
  function K_STU(tid){ return 'luobogan_cg_teacher_'+tid+'_students'; }
  function K_REC(tid){ return 'luobogan_cg_teacher_'+tid+'_records'; }

  // ------- 游戏定义 -------
  CG.GAMES = [
    {id:'schulte',   icon:'🎯',  name:'舒尔特方格',  desc:'5×5 数字按顺序点击，测视觉搜索速度。经典专注力工具。', ready:true},
    {id:'digitspan', icon:'🔢',  name:'数字广度',    desc:'依次闪现数字后按顺序输入，工作记忆的经典指标。',       ready:true},
    {id:'stroop',    icon:'🎨',  name:'Stroop 色词', desc:'字面色 vs 字义冲突下的快速判断，抑制控制训练。',       ready:true},
    {id:'seqmem',    icon:'💡',  name:'顺序记忆',    desc:'棋盘格依次亮起后请复现顺序，即将上线。',                ready:false},
    {id:'nback',     icon:'🌀',  name:'N-Back',      desc:'判断当前刺激与 N 步前是否相同，即将上线。',              ready:false},
    {id:'huarong',   icon:'🧩',  name:'数字华容道',  desc:'滑块拼图恢复顺序，空间规划训练，即将上线。',            ready:false},
    {id:'reaction',  icon:'⚡',  name:'颜色反应力',   desc:'看到指定颜色立即点击，反应速度训练，即将上线。',        ready:false},
    {id:'watersort', icon:'🧪',  name:'上下瓶色匹配', desc:'倒水式色彩分类，逻辑推理与全局观，即将上线。',          ready:false}
  ];

  // ------- 工具函数 -------
  function uid(prefix){ return (prefix||'')+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function safe(json, def){ try{ return JSON.parse(json); }catch(e){ return def; } }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function ts2str(t){
    var d = new Date(t);
    function p(n){ return String(n).padStart(2,'0'); }
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
  }
  function toast(msg){
    var t = document.getElementById('cg-toast');
    if(!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._to);
    t._to = setTimeout(function(){ t.classList.remove('show'); }, 2000);
  }
  CG._toast = toast;
  CG._uid = uid;

  // Modal
  CG.modalConfirm = function(title, msg, onOk){
    var m = document.getElementById('cg-modal');
    document.getElementById('cg-modal-title').textContent = title || '确认';
    document.getElementById('cg-modal-msg').textContent = msg || '';
    var okBtn = document.getElementById('cg-modal-ok');
    var newBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newBtn, okBtn);
    newBtn.addEventListener('click', function(){ CG.modalClose(); if(typeof onOk==='function') onOk(); });
    m.classList.add('show');
  };
  CG.modalClose = function(){ document.getElementById('cg-modal').classList.remove('show'); };

  // ------- 状态 -------
  CG.state = { teacherId:null, studentId:null };

  // ------- 教师层 -------
  CG.getTeachers = function(){ return safe(LS.getItem(K_TEACHERS), []); };
  CG.saveTeachers = function(list){ LS.setItem(K_TEACHERS, JSON.stringify(list)); };
  CG.getCurrentTeacherId = function(){ return LS.getItem(K_CURRENT) || null; };
  CG.getCurrentTeacher = function(){
    var tid = CG.getCurrentTeacherId(); if(!tid) return null;
    return CG.getTeachers().find(function(t){ return t.id===tid; }) || null;
  };
  CG.setupTeacher = function(){
    var name = document.getElementById('cg-setup-name').value.trim();
    if(!name){ toast('请填写老师姓名'); return; }
    var list = CG.getTeachers();
    var exists = list.find(function(t){ return t.name===name; });
    var t;
    if(exists){ t = exists; }
    else { t = {id: uid('T'), name: name, createdAt: Date.now()}; list.push(t); CG.saveTeachers(list); }
    LS.setItem(K_CURRENT, t.id);
    CG.state.teacherId = t.id;
    toast('欢迎，'+name+' 老师');
    CG.enterHome();
  };
  CG.addTeacher = function(){
    var name = prompt('输入新老师姓名或昵称：');
    if(!name) return;
    name = name.trim(); if(!name){ toast('姓名不能为空'); return; }
    var list = CG.getTeachers();
    if(list.find(function(t){ return t.name===name; })){ toast('该姓名已存在，可直接切换'); return; }
    var t = {id: uid('T'), name: name, createdAt: Date.now()};
    list.push(t); CG.saveTeachers(list);
    CG.renderSettings();
    toast('已新增：'+name);
  };
  CG.switchTeacher = function(){
    var tid = document.getElementById('cg-teacher-switch').value;
    if(!tid) return;
    LS.setItem(K_CURRENT, tid);
    LS.removeItem(K_CURRENT_STU);
    CG.state.teacherId = tid;
    CG.state.studentId = null;
    CG._syncLabel();
    CG.nav('home');
    toast('已切换');
  };
  CG.renameTeacher = function(){
    var name = document.getElementById('cg-teacher-rename').value.trim();
    if(!name) return;
    var tid = CG.getCurrentTeacherId(); if(!tid) return;
    var list = CG.getTeachers();
    var t = list.find(function(x){ return x.id===tid; });
    if(!t) return;
    t.name = name;
    CG.saveTeachers(list);
    CG._syncLabel();
    CG.renderSettings();
    toast('已保存');
  };
  CG.clearCurrent = function(){
    var t = CG.getCurrentTeacher(); if(!t) return;
    CG.modalConfirm('危险操作 · 请确认', '将永久删除 "'+t.name+'" 老师名下的全部学生档案与通关记录，此操作不可撤销，请先导出 JSON 备份。确定要清空吗？', function(){
      LS.removeItem(K_STU(t.id));
      LS.removeItem(K_REC(t.id));
      LS.removeItem(K_CURRENT_STU);
      CG.state.studentId = null;
      CG.renderAll();
      toast('已清空');
    });
  };

  // ------- 学生层 -------
  CG.getStudents = function(){
    var tid = CG.getCurrentTeacherId(); if(!tid) return [];
    return safe(LS.getItem(K_STU(tid)), []);
  };
  CG.saveStudents = function(list){
    var tid = CG.getCurrentTeacherId(); if(!tid) return;
    LS.setItem(K_STU(tid), JSON.stringify(list));
  };
  CG.setCurrentStudent = function(sid){
    if(sid){ LS.setItem(K_CURRENT_STU, sid); CG.state.studentId = sid; }
    else   { LS.removeItem(K_CURRENT_STU);    CG.state.studentId = null; }
  };
  CG.getCurrentStudentId = function(){ return LS.getItem(K_CURRENT_STU) || null; };
  CG.addStudent = function(){
    var name = document.getElementById('cg-add-name').value.trim();
    if(!name){ toast('姓名必填'); return; }
    var cls  = document.getElementById('cg-add-class').value.trim();
    var grade= document.getElementById('cg-add-grade').value.trim();
    var note = document.getElementById('cg-add-note').value.trim();
    var list = CG.getStudents();
    list.push({id:uid('S'), name:name, className:cls, gradeOrAge:grade, note:note, createdAt:Date.now()});
    CG.saveStudents(list);
    ['cg-add-name','cg-add-class','cg-add-grade','cg-add-note'].forEach(function(id){ document.getElementById(id).value=''; });
    CG.renderStudents();
    CG.renderHome();
    toast('已添加：'+name);
  };
  CG.editStudent = function(sid){
    var list = CG.getStudents();
    var s = list.find(function(x){ return x.id===sid; }); if(!s) return;
    var name = prompt('修改姓名：', s.name); if(name===null) return;
    name = name.trim(); if(!name){ toast('姓名不能为空'); return; }
    var cls = prompt('班级 / 机构（可留空）：', s.className||''); if(cls===null) return;
    var grade = prompt('年级 / 年龄（可留空）：', s.gradeOrAge||''); if(grade===null) return;
    var note = prompt('备注（可留空）：', s.note||''); if(note===null) return;
    s.name=name.trim(); s.className=cls.trim(); s.gradeOrAge=grade.trim(); s.note=note.trim();
    CG.saveStudents(list);
    CG.renderStudents(); CG.renderHome();
    toast('已保存');
  };
  CG.deleteStudent = function(sid){
    var s = CG.getStudents().find(function(x){ return x.id===sid; }); if(!s) return;
    CG.modalConfirm('删除学生', '将删除学生 "'+s.name+'" 及其全部通关记录，确定吗？', function(){
      CG.saveStudents(CG.getStudents().filter(function(x){ return x.id!==sid; }));
      CG.saveRecords(CG.getRecords().filter(function(r){ return r.studentId!==sid; }));
      if(CG.getCurrentStudentId()===sid){ CG.setCurrentStudent(null); }
      CG.renderAll();
      toast('已删除');
    });
  };

  // ------- 记录层 -------
  CG.getRecords = function(){
    var tid = CG.getCurrentTeacherId(); if(!tid) return [];
    return safe(LS.getItem(K_REC(tid)), []);
  };
  CG.saveRecords = function(list){
    var tid = CG.getCurrentTeacherId(); if(!tid) return;
    LS.setItem(K_REC(tid), JSON.stringify(list));
  };
  CG.saveRecord = function(rec){
    if(!rec.studentId){ return null; } // 未选学生不落盘
    rec.id = uid('R');
    rec.playedAt = rec.playedAt || Date.now();
    var list = CG.getRecords();
    list.push(rec);
    CG.saveRecords(list);
    return rec;
  };
  CG.deleteRecord = function(rid){
    CG.modalConfirm('删除记录', '确定删除这条记录吗？', function(){
      CG.saveRecords(CG.getRecords().filter(function(r){ return r.id!==rid; }));
      CG.renderRecords();
      toast('已删除');
    });
  };
  CG.bestScore = function(studentId, gameId){
    var list = CG.getRecords().filter(function(r){ return r.studentId===studentId && r.gameId===gameId; });
    if(!list.length) return null;
    // 舒尔特/反应/N-Back 用时越小越好，其它按 score 大越好
    var lowerBetter = {schulte:1, reaction:1, stroop:0};
    if(lowerBetter[gameId] && list.some(function(r){ return typeof r.durationSec==='number'; })){
      return list.reduce(function(a,b){ return (a.durationSec||9999) <= (b.durationSec||9999) ? a : b; });
    }
    return list.reduce(function(a,b){ return (a.score||0) >= (b.score||0) ? a : b; });
  };

  // ------- 导入 / 导出 -------
  CG.exportExcel = function(){
    var t = CG.getCurrentTeacher(); if(!t){ toast('请先设置老师'); return; }
    if(typeof XLSX==='undefined'){
      // P0-3: 按需加载 xlsx（首次点击时下载 250 KB mini 版本）
      toast('正在加载 Excel 组件…');
      window.__luoboLoadScript('/assets/vendor/xlsx.mini.min.js').then(function(){
        CG.exportExcel();
      }).catch(function(){
        toast('Excel 组件加载失败，请检查网络后重试');
      });
      return;
    }
    var students = CG.getStudents();
    var records = CG.getRecords();
    var stuMap = {}; students.forEach(function(s){ stuMap[s.id]=s; });
    var gameMap = {}; CG.GAMES.forEach(function(g){ gameMap[g.id]=g.name; });
    var wb = XLSX.utils.book_new();
    var sheet1 = students.map(function(s){
      return {
        '学生ID':s.id, '姓名':s.name, '班级/机构':s.className||'', '年级/年龄':s.gradeOrAge||'',
        '备注':s.note||'', '建档时间':ts2str(s.createdAt)
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet1.length?sheet1:[{提示:'暂无学生'}]), '学生档案');
    var sheet2 = records.map(function(r){
      var s = stuMap[r.studentId];
      return {
        '时间':ts2str(r.playedAt),
        '学生':s?s.name:'（已删除）',
        '班级':s?(s.className||''):'',
        '项目':gameMap[r.gameId]||r.gameId,
        '成绩(得分)':r.score||'',
        '用时(秒)':r.durationSec||'',
        '备注':r.meta?JSON.stringify(r.meta):''
      };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheet2.length?sheet2:[{提示:'暂无记录'}]), '通关记录');
    var d = new Date();
    var fname = '课堂小游戏_'+t.name+'_'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.xlsx';
    XLSX.writeFile(wb, fname);
    toast('已导出：'+fname);
  };
  CG.exportJSON = function(){
    var t = CG.getCurrentTeacher(); if(!t){ toast('请先设置老师'); return; }
    var data = {
      version: 1,
      exportedAt: Date.now(),
      teacher: t,
      students: CG.getStudents(),
      records: CG.getRecords()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var d = new Date();
    a.href = url;
    a.download = '课堂小游戏_'+t.name+'_'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'.json';
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 100);
    toast('已导出 JSON');
  };
  CG.importJSON = function(ev){
    var f = ev.target.files[0]; if(!f) return;
    var reader = new FileReader();
    reader.onload = function(e){
      try{
        var d = JSON.parse(e.target.result);
        if(!d.students || !d.records){ toast('文件格式不对'); return; }
        CG.modalConfirm('导入 JSON', '将合并到当前老师 "'+(CG.getCurrentTeacher()||{}).name+'" 名下（重名学生不新建）。确定继续吗？', function(){
          var stu = CG.getStudents();
          var rec = CG.getRecords();
          var stuIdMap = {};
          d.students.forEach(function(s){
            var same = stu.find(function(x){ return x.name===s.name && x.className===(s.className||''); });
            if(same){ stuIdMap[s.id] = same.id; }
            else{
              var ns = {id:uid('S'), name:s.name, className:s.className||'', gradeOrAge:s.gradeOrAge||'', note:s.note||'', createdAt:s.createdAt||Date.now()};
              stu.push(ns); stuIdMap[s.id] = ns.id;
            }
          });
          d.records.forEach(function(r){
            rec.push({id:uid('R'), studentId:stuIdMap[r.studentId], gameId:r.gameId, score:r.score, durationSec:r.durationSec, playedAt:r.playedAt||Date.now(), meta:r.meta||null});
          });
          CG.saveStudents(stu); CG.saveRecords(rec);
          CG.renderAll();
          toast('已导入');
        });
      }catch(err){ toast('文件解析失败'); }
    };
    reader.readAsText(f);
    ev.target.value = '';
  };

  // ------- 导航 & 渲染 -------
  CG.nav = function(page){
    document.querySelectorAll('#cg-overlay .cg-page').forEach(function(el){ el.classList.remove('active'); });
    document.querySelectorAll('#cg-overlay .cg-btn-nav').forEach(function(el){ el.classList.remove('active'); });
    var target = document.getElementById('cg-page-'+page);
    if(target) target.classList.add('active');
    var navBtn = document.querySelector('#cg-overlay .cg-btn-nav[data-nav="'+page+'"]');
    if(navBtn) navBtn.classList.add('active');
    if(page==='home')     CG.renderHome();
    if(page==='students') CG.renderStudents();
    if(page==='records')  CG.renderRecords();
    if(page==='settings') CG.renderSettings();
  };
  CG.enterHome = function(){
    // 显示 topbar 导航
    document.querySelectorAll('#cg-overlay .cg-btn-nav').forEach(function(el){ el.style.display=''; });
    CG._syncLabel();
    CG.nav('home');
  };
  CG._syncLabel = function(){
    var t = CG.getCurrentTeacher();
    var el = document.getElementById('cg-teacher-label');
    if(el) el.textContent = t ? ('· '+t.name+' 老师') : '';
  };

  CG.renderHome = function(){
    // 当前学生下拉
    var sel = document.getElementById('cg-current-student-select');
    var stu = CG.getStudents();
    var curSid = CG.getCurrentStudentId();
    sel.innerHTML = '<option value="">（未选 · 仅试玩不存记录）</option>' + stu.map(function(s){
      return '<option value="'+s.id+'" '+(s.id===curSid?'selected':'')+'>'+esc(s.name)+(s.className?' · '+esc(s.className):'')+'</option>';
    }).join('');
    CG.state.studentId = curSid;

    // 游戏卡片
    var grid = document.getElementById('cg-game-grid');
    grid.innerHTML = CG.GAMES.map(function(g){
      var best = curSid && g.ready ? CG.bestScore(curSid, g.id) : null;
      var bestLabel = '';
      if(best){
        if(g.id==='schulte' || g.id==='reaction') bestLabel = '最佳 '+ (best.durationSec||'--') +'s';
        else if(g.id==='stroop') bestLabel = '最佳 ' + (best.score||0) + '% / ' + (best.durationSec? best.durationSec+'s':'') ;
        else bestLabel = '最佳 '+(best.score||0);
      }
      return '<button type="button" class="cg-game-card '+(g.ready?'':'disabled')+'" onclick="'+(g.ready?"CG.startGame('"+g.id+"')":"CG._toast('即将上线，敬请期待')")+'">'
        + '<div class="cg-game-icon">'+g.icon+'</div>'
        + '<div class="cg-game-title">'+g.name+'</div>'
        + '<div class="cg-game-desc">'+g.desc+'</div>'
        + '<span class="cg-game-tag '+(g.ready?'ready':'soon')+'">'+(g.ready?'进入训练':'即将开放')+'</span>'
        + (bestLabel? '<span class="cg-game-tag best">'+bestLabel+'</span>' : '')
        + '</button>';
    }).join('');

    // 学生快速视图
    var qlist = document.getElementById('cg-home-student-list');
    if(!stu.length){
      qlist.innerHTML = '<li class="cg-student-empty">还没有学生 · 到"学生档案"添加</li>';
    }else{
      qlist.innerHTML = stu.slice(0,8).map(function(s){
        var recCnt = CG.getRecords().filter(function(r){ return r.studentId===s.id; }).length;
        return '<li class="cg-student-item">'
          + '<span class="cg-sname">'+esc(s.name)+'</span>'
          + '<span class="cg-smeta">'+(s.className?esc(s.className)+' · ':'')+(s.gradeOrAge?esc(s.gradeOrAge)+' · ':'')+' 记录 '+recCnt+' 条</span>'
          + '</li>';
      }).join('') + (stu.length>8 ? '<li class="cg-student-empty">…共 '+stu.length+' 名学生，到"学生档案"查看全部</li>' : '');
    }
  };

  CG.renderStudents = function(){
    var list = CG.getStudents();
    var ul = document.getElementById('cg-full-student-list');
    if(!list.length){
      ul.innerHTML = '<li class="cg-student-empty">还没有学生 · 填写下方表单添加</li>';
      return;
    }
    ul.innerHTML = list.map(function(s){
      var recCnt = CG.getRecords().filter(function(r){ return r.studentId===s.id; }).length;
      return '<li class="cg-student-item">'
        + '<span class="cg-sname">'+esc(s.name)+'</span>'
        + '<span class="cg-smeta">'+(s.className?esc(s.className)+' · ':'')+(s.gradeOrAge?esc(s.gradeOrAge)+' · ':'')+(s.note?'『'+esc(s.note)+'』· ':'')+'记录 '+recCnt+' 条 · 建档 '+ts2str(s.createdAt)+'</span>'
        + '<span class="cg-sactions">'
        +   '<button class="cg-btn-secondary" onclick="CG.editStudent(\''+s.id+'\')">编辑</button>'
        +   '<button class="cg-btn-danger" onclick="CG.deleteStudent(\''+s.id+'\')">删除</button>'
        + '</span>'
        + '</li>';
    }).join('');
  };

  CG.renderRecords = function(){
    var students = CG.getStudents();
    var stuMap = {}; students.forEach(function(s){ stuMap[s.id]=s; });
    var gameMap = {}; CG.GAMES.forEach(function(g){ gameMap[g.id]=g.name; });
    var records = CG.getRecords().slice().sort(function(a,b){ return b.playedAt - a.playedAt; });

    // 下拉
    var fs = document.getElementById('cg-rec-filter-student');
    var fg = document.getElementById('cg-rec-filter-game');
    var prevS = fs.value, prevG = fg.value;
    fs.innerHTML = '<option value="">全部学生</option>' + students.map(function(s){ return '<option value="'+s.id+'">'+esc(s.name)+'</option>'; }).join('');
    fg.innerHTML = '<option value="">全部项目</option>' + CG.GAMES.filter(function(g){ return g.ready; }).map(function(g){ return '<option value="'+g.id+'">'+g.name+'</option>'; }).join('');
    fs.value = prevS; fg.value = prevG;

    var filtered = records.filter(function(r){
      if(fs.value && r.studentId!==fs.value) return false;
      if(fg.value && r.gameId!==fg.value) return false;
      return true;
    });
    var tb = document.getElementById('cg-rec-tbody');
    if(!filtered.length){
      tb.innerHTML = '<tr><td colspan="7" class="cg-empty-tip">暂无记录 · 完成一次游戏即可自动保存到当前学生名下</td></tr>';
      return;
    }
    tb.innerHTML = filtered.map(function(r){
      var s = stuMap[r.studentId];
      var scoreText = '';
      if(r.gameId==='schulte'){ scoreText = (r.score||0)+' / 25'; }
      else if(r.gameId==='digitspan'){ scoreText = '最大 '+(r.score||0)+' 位'; }
      else if(r.gameId==='stroop'){ scoreText = (r.score||0)+'% ('+(r.meta?r.meta.right+'/'+r.meta.total:'')+')'; }
      else{ scoreText = r.score||0; }
      return '<tr>'
        + '<td>'+ts2str(r.playedAt)+'</td>'
        + '<td>'+(s?esc(s.name):'<em>已删除</em>')+'</td>'
        + '<td>'+(gameMap[r.gameId]||r.gameId)+'</td>'
        + '<td>'+scoreText+'</td>'
        + '<td>'+(r.durationSec?r.durationSec+' 秒':'—')+'</td>'
        + '<td>'+(r.meta&&r.meta.note?esc(r.meta.note):'')+'</td>'
        + '<td><button class="cg-btn-danger" onclick="CG.deleteRecord(\''+r.id+'\')">删</button></td>'
        + '</tr>';
    }).join('');
  };

  CG.renderSettings = function(){
    var teachers = CG.getTeachers();
    var cur = CG.getCurrentTeacherId();
    var sw = document.getElementById('cg-teacher-switch');
    sw.innerHTML = teachers.map(function(t){ return '<option value="'+t.id+'" '+(t.id===cur?'selected':'')+'>'+esc(t.name)+'</option>'; }).join('');
    var t = CG.getCurrentTeacher();
    document.getElementById('cg-teacher-rename').value = t? t.name : '';
  };

  CG.renderAll = function(){
    CG._syncLabel();
    CG.renderHome();
    CG.renderStudents();
    CG.renderRecords();
    CG.renderSettings();
  };

  // ------- 游戏引擎 · runner 界面 -------
  function pageHome(){ CG.nav('home'); }
  function renderRunner(title, meta, bodyHTML, footerHTML){
    var host = document.getElementById('cg-page-home');
    host.innerHTML = ''
      + '<div class="cg-runner">'
      +   '<div class="cg-runner-header">'
      +     '<h2>'+esc(title)+'</h2>'
      +     '<div class="cg-runner-meta">'+meta+'</div>'
      +   '</div>'
      +   '<div class="cg-runner-body" id="cg-runner-body">'+bodyHTML+'</div>'
      +   '<div class="cg-runner-footer">'+(footerHTML||'<span>试玩模式下成绩不保存 · 从主页当前学生选择器切换学生</span>')+'<button class="cg-btn-secondary" onclick="CG.exitGame()">← 返回主页</button></div>'
      + '</div>';
  }
  CG.exitGame = function(){
    // 恢复 home 页 DOM 结构（重新构建）
    _rebuildHome();
    CG.nav('home');
  };

  function _rebuildHome(){
    var host = document.getElementById('cg-page-home');
    host.innerHTML = ''
      + '<div class="cg-current-student">'
      +   '<label>当前学生：</label>'
      +   '<select id="cg-current-student-select" onchange="CG.setCurrentStudent(this.value); CG.renderHome();"></select>'
      +   '<span class="cg-hint">未选学生也可以试玩，但成绩不会保存到档案。</span>'
      + '</div>'
      + '<div class="cg-home-grid">'
      +   '<div class="cg-panel"><h3>🎮 训练项目</h3><p class="cg-panel-tip">点击卡片开始训练；每次完成后自动存入当前学生的通关记录。</p><div class="cg-game-grid" id="cg-game-grid"></div></div>'
      +   '<div class="cg-panel"><h3>👥 学生 · 快速视图</h3><p class="cg-panel-tip">在此快速查看学生名单，管理请到"学生档案"。</p><ul class="cg-student-list" id="cg-home-student-list"></ul>'
      +   '<div class="cg-footer-note"><b>数据监控用法：</b>让每位学生每周固定项目训练 2-3 次，用"通关记录"页导出 Excel 或 JSON，孩子的注意力、记忆、抑制力趋势就会自然浮现。<br><em>提示：结果为训练进步趋势参考，不用于筛查或诊断。</em></div>'
      +   '</div>'
      + '</div>';
  }
  CG._rebuildHome = _rebuildHome;

  CG.startGame = function(gid){
    // 保存学生选择在 startGame 前需要读取（重建 home 会清 select）
    var sid = CG.getCurrentStudentId();
    if(gid==='schulte')  return startSchulte(sid);
    if(gid==='digitspan')return startDigitspan(sid);
    if(gid==='stroop')   return startStroop(sid);
    toast('该项目即将上线');
  };

  // ============ 游戏 1：舒尔特方格精致版 ============
  function startSchulte(sid){
    var N = 5;
    var nums = []; for(var i=1;i<=N*N;i++) nums.push(i);
    // Fisher-Yates
    for(var i=nums.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=nums[i]; nums[i]=nums[j]; nums[j]=t; }
    var next = 1;
    var startTs = null, errors = 0;
    var timerId = null;
    var stu = sid ? CG.getStudents().find(function(x){return x.id===sid;}) : null;

    var bodyHTML =
        '<div class="cg-schulte-info">'
      +   '<span>目标 <b id="cg-sch-target">1</b> / '+N*N+'</span>'
      +   '<span>用时 <b id="cg-sch-time">0.0</b> 秒</span>'
      +   '<span>失误 <b id="cg-sch-err">0</b></span>'
      + '</div>'
      + '<div class="cg-schulte-target">请依次点击 <b>1 → '+(N*N)+'</b></div>'
      + '<div class="cg-schulte-board" id="cg-sch-board"></div>'
      + '<div style="text-align:center;margin-top:16px;"><button class="cg-btn-secondary" onclick="CG.startGame(\'schulte\')">重开一局</button></div>';
    renderRunner('🎯 舒尔特方格 · 5×5', stu?('学生 · '+esc(stu.name)):'试玩模式（不保存）', bodyHTML);
    var board = document.getElementById('cg-sch-board');
    board.innerHTML = nums.map(function(n){ return '<div class="cg-schulte-cell" data-n="'+n+'">'+n+'</div>'; }).join('');
    board.querySelectorAll('.cg-schulte-cell').forEach(function(cell){
      cell.addEventListener('click', function(){
        if(!startTs){ startTs = Date.now(); tick(); }
        var v = parseInt(cell.dataset.n,10);
        if(v===next){
          cell.classList.add('done');
          next++;
          document.getElementById('cg-sch-target').textContent = Math.min(next, N*N);
          if(next > N*N){ finish(); }
        }else{
          errors++;
          document.getElementById('cg-sch-err').textContent = errors;
          cell.classList.add('wrong');
          setTimeout(function(){ cell.classList.remove('wrong'); }, 300);
        }
      });
    });
    function tick(){
      var el = document.getElementById('cg-sch-time');
      if(!el) return;
      el.textContent = ((Date.now()-startTs)/1000).toFixed(1);
      timerId = requestAnimationFrame(tick);
    }
    function finish(){
      cancelAnimationFrame(timerId);
      var sec = ((Date.now()-startTs)/1000);
      var body = document.getElementById('cg-runner-body');
      var rating = sec<=20 ? '优秀（同龄前列）' : sec<=30 ? '良好' : sec<=45 ? '一般' : '继续加油';
      var saved = null;
      if(sid){
        saved = CG.saveRecord({studentId:sid, gameId:'schulte', score:N*N, durationSec:Math.round(sec*10)/10, meta:{errors:errors, N:N}});
      }
      var best = sid ? CG.bestScore(sid, 'schulte') : null;
      body.innerHTML = ''
        + '<div class="cg-result-card">'
        +   '<h3>完成 🎉</h3>'
        +   '<div class="cg-result-score">'+sec.toFixed(1)+'<small>秒</small></div>'
        +   '<div class="cg-result-detail">'
        +     '失误 <b>'+errors+'</b> 次 · 评级 <b>'+rating+'</b><br>'
        +     (sid ? ('本次已保存至 '+esc(stu?stu.name:'')+' 的记录 · 最佳 <b>'+(best?best.durationSec:sec.toFixed(1))+'</b> 秒') : '未选学生 · 本次不保存')
        +   '</div>'
        +   '<div class="cg-result-actions">'
        +     '<button class="cg-btn-primary" onclick="CG.startGame(\'schulte\')">再来一局</button>'
        +     '<button class="cg-btn-secondary" onclick="CG.exitGame()">返回主页</button>'
        +   '</div>'
        + '</div>';
    }
  }

  // ============ 游戏 2：数字广度 ============
  function startDigitspan(sid){
    var stu = sid ? CG.getStudents().find(function(x){return x.id===sid;}) : null;
    var level = 3;
    var maxLevel = 3;
    var currentDigits = null;
    var mode = 'ready'; // ready | show | input | done

    function bodyForReady(){
      return '<div class="cg-digit-stage">'
        + '<div class="cg-digit-level">当前长度 <b>'+level+'</b> 位</div>'
        + '<p style="color:#6b5b3d;font-size:14px;max-width:420px;margin:8px auto 20px;line-height:1.8;">规则：屏幕上会依次显示 <b>'+level+'</b> 个数字，每个显示 1 秒。数字消失后请按<b>相同顺序</b>输入，答对进阶，答错结束。</p>'
        + '<button class="cg-btn-primary" onclick="window.__cgDigitStart()">开始 →</button>'
        + '</div>';
    }
    renderRunner('🔢 数字广度', stu?('学生 · '+esc(stu.name)):'试玩模式（不保存）', bodyForReady());

    window.__cgDigitStart = function(){
      // 生成 level 位数字（首位不为 0）
      currentDigits = String(1+Math.floor(Math.random()*9));
      for(var i=1;i<level;i++){ currentDigits += String(Math.floor(Math.random()*10)); }
      var body = document.getElementById('cg-runner-body');
      body.innerHTML = '<div class="cg-digit-stage"><div class="cg-digit-level">观察下面的数字 · 请按顺序记住</div><div class="cg-digit-display" id="cg-digit-show"></div></div>';
      var showEl = document.getElementById('cg-digit-show');
      var i = 0;
      function next(){
        if(i>=currentDigits.length){
          showEl.textContent = '';
          setTimeout(showInput, 300);
          return;
        }
        showEl.textContent = currentDigits[i];
        i++;
        setTimeout(function(){ showEl.textContent=''; setTimeout(next, 220); }, 780);
      }
      next();
    };
    function showInput(){
      var body = document.getElementById('cg-runner-body');
      body.innerHTML = '<div class="cg-digit-stage">'
        + '<div class="cg-digit-level">请按顺序输入刚才的 <b>'+level+'</b> 位数字</div>'
        + '<div class="cg-digit-input-row">'
        +   '<input type="text" id="cg-digit-input" maxlength="'+level+'" inputmode="numeric" autocomplete="off">'
        +   '<button class="cg-btn-primary" onclick="window.__cgDigitCheck()">提交</button>'
        + '</div>'
        + '<div class="cg-digit-feedback" id="cg-digit-fb"></div>'
        + '</div>';
      var inp = document.getElementById('cg-digit-input');
      inp.focus();
      inp.addEventListener('keydown', function(e){ if(e.key==='Enter') window.__cgDigitCheck(); });
    }
    window.__cgDigitCheck = function(){
      var v = (document.getElementById('cg-digit-input').value||'').trim();
      var fb = document.getElementById('cg-digit-fb');
      if(v===currentDigits){
        maxLevel = level;
        fb.className = 'cg-digit-feedback ok'; fb.textContent = '答对！进入 '+(level+1)+' 位';
        level++;
        if(level>12){ finish(true); return; }
        setTimeout(function(){
          var body = document.getElementById('cg-runner-body');
          body.innerHTML = bodyForReady();
        }, 800);
      }else{
        fb.className = 'cg-digit-feedback err'; fb.textContent = '答错 · 正确答案：'+currentDigits;
        setTimeout(function(){ finish(false); }, 1500);
      }
    };
    function finish(perfect){
      var rating = maxLevel>=9 ? '优秀（成人前列）' : maxLevel>=7 ? '良好' : maxLevel>=5 ? '一般（学龄期常见）' : '继续加油';
      var saved = null;
      if(sid){ saved = CG.saveRecord({studentId:sid, gameId:'digitspan', score:maxLevel, meta:{perfect:!!perfect}}); }
      var best = sid ? CG.bestScore(sid, 'digitspan') : null;
      var stuName = stu?stu.name:'';
      var body = document.getElementById('cg-runner-body');
      body.innerHTML = '<div class="cg-result-card">'
        + '<h3>本轮结束</h3>'
        + '<div class="cg-result-score">'+maxLevel+'<small>位最大记忆长度</small></div>'
        + '<div class="cg-result-detail">评级 <b>'+rating+'</b><br>'
        + (sid ? ('本次已保存至 '+esc(stuName)+' 的记录 · 最佳 <b>'+(best?best.score:maxLevel)+'</b> 位') : '未选学生 · 本次不保存')
        + '</div>'
        + '<div class="cg-result-actions">'
        +   '<button class="cg-btn-primary" onclick="CG.startGame(\'digitspan\')">再来一次</button>'
        +   '<button class="cg-btn-secondary" onclick="CG.exitGame()">返回主页</button>'
        + '</div>'
        + '</div>';
    }
  }

  // ============ 游戏 3：Stroop 色词 ============
  function startStroop(sid){
    var stu = sid ? CG.getStudents().find(function(x){return x.id===sid;}) : null;
    var COLORS = [
      {k:'red',   label:'红', hex:'#c53030'},
      {k:'blue',  label:'蓝', hex:'#2b6cb0'},
      {k:'green', label:'绿', hex:'#2f855a'},
      {k:'yellow',label:'黄', hex:'#b7791f'}
    ];
    var total = 20;
    var idx = 0, right = 0;
    var rtList = [];
    var currentAns = null;
    var qStartTs = null;

    function nextQ(){
      idx++;
      if(idx>total){ finish(); return; }
      var wordColor = COLORS[Math.floor(Math.random()*COLORS.length)];
      var textColor;
      // 约 70% 冲突
      if(Math.random()<0.7){
        do{ textColor = COLORS[Math.floor(Math.random()*COLORS.length)]; }while(textColor.k===wordColor.k);
      }else{
        textColor = wordColor;
      }
      currentAns = textColor.k;
      var body = document.getElementById('cg-runner-body');
      body.innerHTML = '<div class="cg-stroop-stage">'
        + '<div class="cg-stroop-progress">第 <b>'+idx+'</b> / '+total+' 题 · 已答对 <b>'+right+'</b></div>'
        + '<div class="cg-stroop-tip">请点击"字面颜色"，不是字的意思！</div>'
        + '<div class="cg-stroop-word" style="color:'+textColor.hex+'">'+wordColor.label+'</div>'
        + '<div class="cg-stroop-choices">' + COLORS.map(function(c){
            return '<button class="cg-stroop-btn" onclick="window.__cgStroopPick(\''+c.k+'\')" style="border-color:'+c.hex+';color:'+c.hex+';">'+c.label+'</button>';
          }).join('') + '</div>'
        + '</div>';
      qStartTs = Date.now();
    }
    window.__cgStroopPick = function(k){
      var rt = Date.now() - qStartTs;
      rtList.push(rt);
      if(k===currentAns) right++;
      setTimeout(nextQ, 120);
    };

    function finish(){
      var accuracy = Math.round(right/total*100);
      var avgRt = Math.round(rtList.reduce(function(a,b){return a+b;},0)/rtList.length);
      var rating = (accuracy>=95 && avgRt<=900) ? '优秀' : (accuracy>=85 && avgRt<=1200) ? '良好' : '继续加油';
      var saved = null;
      var durSec = Math.round(rtList.reduce(function(a,b){return a+b;},0)/1000);
      if(sid){
        saved = CG.saveRecord({studentId:sid, gameId:'stroop', score:accuracy, durationSec:durSec, meta:{right:right, total:total, avgRtMs:avgRt}});
      }
      var stuName = stu?stu.name:'';
      var body = document.getElementById('cg-runner-body');
      body.innerHTML = '<div class="cg-result-card">'
        + '<h3>完成 🎨</h3>'
        + '<div class="cg-result-score">'+accuracy+'<small>%</small></div>'
        + '<div class="cg-result-detail">'
        +   '答对 <b>'+right+'</b> / '+total+' · 平均反应 <b>'+avgRt+'</b> ms · 评级 <b>'+rating+'</b><br>'
        +   (sid ? ('本次已保存至 '+esc(stuName)+' 的记录') : '未选学生 · 本次不保存')
        + '</div>'
        + '<div class="cg-result-actions">'
        +   '<button class="cg-btn-primary" onclick="CG.startGame(\'stroop\')">再来一次</button>'
        +   '<button class="cg-btn-secondary" onclick="CG.exitGame()">返回主页</button>'
        + '</div>'
        + '</div>';
    }

    renderRunner('🎨 Stroop 色词 · 抑制控制', stu?('学生 · '+esc(stu.name)):'试玩模式（不保存）', '<div class="cg-stroop-stage"><div class="cg-stroop-tip" style="font-size:14px;line-height:1.9;max-width:460px;margin:16px auto;color:#6b5b3d;">共 '+total+' 题，屏幕上会出现一个用某种颜色显示的<b>颜色词</b>。<br>请点击<b>字面颜色</b>，忽略字的含义。<br><em style="color:#a8362a">例如：红色的"蓝"字，应点"红"。</em></div><div style="text-align:center;margin-top:20px;"><button class="cg-btn-primary" onclick="window.__cgStroopStart()">开始 →</button></div></div>');
    window.__cgStroopStart = function(){ nextQ(); };
  }

  // ------- 入口 & 出口 -------
  window.openClassroomGames = function(){
    var overlay = document.getElementById('cg-overlay');
    overlay.classList.add('cg-open');
    document.body.style.overflow = 'hidden';
    // 判断是否已 setup
    var tid = CG.getCurrentTeacherId();
    if(!tid){
      document.querySelectorAll('#cg-overlay .cg-btn-nav').forEach(function(el){ el.style.display='none'; });
      CG.nav('setup');
    }else{
      CG.state.teacherId = tid;
      CG.state.studentId = CG.getCurrentStudentId();
      CG.enterHome();
    }
  };
  window.closeClassroomGames = function(){
    var overlay = document.getElementById('cg-overlay');
    overlay.classList.remove('cg-open');
    document.body.style.overflow = '';
  };

  // ESC 关闭
  document.addEventListener('keydown', function(e){
    if(e.key==='Escape'){
      var overlay = document.getElementById('cg-overlay');
      if(overlay && overlay.classList.contains('cg-open')){ closeClassroomGames(); }
    }
  });

})();

;
  // ===== 三期：思维训练室按需加载 =====
  // 脑室游戏代码已拆到 brain-games.js；当 #brain-training 被加上 .open（任意打开路径）时再拉取并自启动
  (function(){
    var sec = document.getElementById('brain-training');
    if(!sec) return;
    if(sec.classList.contains('open')){ window.__luoboLoadScript('/assets/js/brain-games.js'); return; }
    var mo = new MutationObserver(function(){
      if(sec.classList.contains('open')){ mo.disconnect(); window.__luoboLoadScript('/assets/js/brain-games.js'); }
    });
    mo.observe(sec, {attributes:true, attributeFilter:['class']});
  })();
