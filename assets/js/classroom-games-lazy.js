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
