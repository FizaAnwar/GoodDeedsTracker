(function(){
  var KEY='lgt-deeds', deeds=[], lastId=null;

  // Load saved deeds from the browser
  try{deeds=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){deeds=[]}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(deeds))}catch(e){}}

  var $=function(i){return document.getElementById(i)};
  var now=new Date(), pad=function(n){return n<10?'0'+n:n};
  function dk(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
  var today=dk(now);

  // Header date + stat card labels
  var long=now.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  $('d1').textContent=long;
  $('d2').textContent=now.toLocaleDateString('en-US',{weekday:'long'});
  $('lM').textContent=now.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  $('lY').textContent='Year '+now.getFullYear();

  var heart='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>';

  // Escape user text so it can't inject HTML
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

  function row(d){
    return '<li'+(d.id===lastId?' class="new"':'')+'>'+heart+'<span class="t">'+esc(d.text)+'</span><time>'+
      new Date(d.ts).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})+'</time>'+
      '<button class="del" data-id="'+d.id+'" aria-label="Delete deed">×</button></li>';
  }

  // Redraw everything from the deeds array
  function render(){
    var t=deeds.filter(function(d){return d.day===today}).sort(function(a,b){return b.ts-a.ts});
    var ym=today.slice(0,7), y=today.slice(0,4);

    $('sD').textContent=t.length;
    $('sM').textContent=deeds.filter(function(d){return d.day.slice(0,7)===ym}).length;
    $('sY').textContent=deeds.filter(function(d){return d.day.slice(0,4)===y}).length;
    $('sA').textContent=deeds.length;
    $('cnt').textContent=t.length+(t.length===1?' deed':' deeds');

    var html=t.length?t.map(row).join(''):'<li class="empty">Nothing yet today. Add your first little good thing above.</li>';
    $('ul1').innerHTML=html; $('ul2').innerHTML=html;

    // Daily goal (5 deeds)
    var g=Math.min(t.length,5);
    $('gN').textContent=t.length;
    $('gB').style.width=(g/5*100)+'%';
    $('gT').textContent=t.length===0?'Start with one small kindness.':t.length<5?'Beautiful! Keep spreading kindness.':'Goal reached. What a lovely day.';

    // History grouped by date
    var all=deeds.slice().sort(function(a,b){return b.ts-a.ts}), groups={}, order=[];
    all.forEach(function(d){if(!groups[d.day]){groups[d.day]=[];order.push(d.day)}groups[d.day].push(d)});
    $('hl').innerHTML=order.length?order.map(function(k){
      var p=k.split('-');
      var label=new Date(p[0],p[1]-1,p[2]).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      return '<div class="day">'+label+' ('+groups[k].length+')</div><ul>'+groups[k].map(row).join('')+'</ul>';
    }).join(''):'<p class="empty">Your history will appear here once you add a deed.</p>';

    lastId=null;
  }

  // Add a deed
  function add(inp){
    var v=inp.value.trim(); if(!v){inp.focus();return}
    var id=String(Date.now());
    deeds.push({id:id,text:v,ts:Date.now(),day:dk(new Date())});
    lastId=id; inp.value=''; save(); render(); inp.focus();
  }
  $('b1').onclick=function(){add($('in1'))};
  $('b2').onclick=function(){add($('in2'))};
  [$('in1'),$('in2')].forEach(function(i){
    i.addEventListener('keydown',function(e){if(e.key==='Enter')add(i)});
  });

  // Delete a deed
  document.addEventListener('click',function(e){
    var b=e.target.closest('.del'); if(!b)return;
    deeds=deeds.filter(function(d){return d.id!==b.dataset.id}); save(); render();
  });

  // Menu switching
  var titles={dash:'Good deeds dashboard',daily:'Daily deeds',hist:'History'};
  document.querySelectorAll('nav button').forEach(function(b){
    b.onclick=function(){
      document.querySelectorAll('nav button').forEach(function(x){x.classList.toggle('on',x===b)});
      document.querySelectorAll('.view').forEach(function(v){v.classList.toggle('on',v.id===b.dataset.v)});
      $('title').innerHTML=titles[b.dataset.v]+'<i>.</i>';
    };
  });

  render();
})();