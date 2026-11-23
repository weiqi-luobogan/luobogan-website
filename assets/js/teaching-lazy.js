// teaching-lazy.js · 五期拆出：教学理念板块渲染器（原 site.js 1246-1304）
// 依赖：window.TEACHING_DATA（由 teaching_data.js 提供）
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
