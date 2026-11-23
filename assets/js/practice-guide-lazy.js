// practice-guide-lazy.js · 六期拆出：练棋建议 v1 完整模块（原 site.js 1248-1753）
// 含记忆周期计算器 + 6:3:1 训练比例计算器 + CSV 导出
// 依赖：DOM 元素 #practice-guide, #mc-result, #r631-result 等（静态 HTML 已存在）
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
