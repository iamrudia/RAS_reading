/* 북로드(Book ROAD) – 공통 데이터와 계산 (학생 페이지·교사 페이지·모아보기가 함께 씀)
   서버·데이터베이스 없음. 학급 설정은 링크(#c=…) 안에, 학생 기록은 학생 브라우저에만 저장된다. */
(function(g){
'use strict';
var R={VERSION:'1.2',NAME:'북로드',SUB:'한 권의 길을 걷는 독서기록장'};

/* 학급 설정 기본값 */
R.DEF={v:1,id:'',school:'',cls:'',title:'북로드',days:40,start:'',checks:[10,20,30],
  elib:'https://lib.goe.go.kr/elib/index.do',upload:'',uploadLabel:'제출 폴더',agent:'',agentLabel:'AI 독후활동 코치',mode:'free',acts:[],count:1};
R.full=function(c){var o={};for(var k in R.DEF)o[k]=R.DEF[k];if(c)for(var j in c)if(c[j]!=null)o[j]=c[j];return o};

/* ───────── 독후활동 ─────────
   f: [키, 종류, 이름, 안내, 수/보기, 열]  종류: text | area | img | qa | rows | chips | panels */
R.CATS={write:'✍ 쓰기 활동',think:'🧠 생각 정리 활동',show:'🎨 표현 활동'};
R.GN={both:'',fic:'소설',non:'비문학'};
R.ACTS=[
 {id:'friend',cat:'write',g:'both',ic:'💌',name:'친구에게 책 소개하기',desc:'읽지 않은 친구에게 말하듯 소개',f:[['to','text','누구에게?'],['body','area','소개하는 글','줄거리(핵심 내용), 느낌, 인상 깊은 부분을 모아 친구에게 말하듯 자연스럽게 써요.',10]]},
 {id:'recommend',cat:'write',g:'both',ic:'👍',name:'추천서 쓰기',desc:'이 책의 좋은 점을 알리기',f:[['why','area','이 책을 추천하는 이유'],['quote','area','가장 인상 깊은 구절'],['gain','area','이 책을 통해 얻을 수 있는 점'],['one','text','친구에게 추천의 한마디!']]},
 {id:'letterChar',cat:'write',g:'fic',ic:'✉️',name:'인물에게 편지 쓰기',desc:'가장 기억에 남는 인물에게',f:[['to','text','작품 속 누구에게?'],['body','area','편지','그 인물에게 하고 싶은 말, 묻고 싶은 것, 응원이나 충고를 써요.',10]]},
 {id:'letterAuthor',cat:'write',g:'both',ic:'📮',name:'작가에게 엽서 쓰기',desc:'느낀 점·궁금한 점을 작가에게',f:[['to','text','받는 사람 (작가 또는 출판사)'],['body','area','엽서 내용','느낀 점, 궁금한 점, 아쉬운 점 등 자유롭게 써요.',7]]},
 {id:'sequel',cat:'write',g:'fic',ic:'📖',name:'뒷이야기 쓰기',desc:'결말 이후를 상상해 이어 쓰기',f:[['from','text','어느 장면부터 이어 쓰나요?'],['body','area','이어 쓴 이야기','결말을 바꾸거나 정반대로 써도 좋아요. 인물의 성격은 원작과 어울리게!',14]]},
 {id:'review',cat:'write',g:'both',ic:'📰',name:'서평 쓰기',desc:'신문의 새 책 소개란처럼',f:[['head','text','서평 제목 (눈길을 끄는 한 줄)'],['body','area','서평','이 책을 읽지 않은 독자에게 책의 내용과 가치, 나의 평가를 소개해요.',12]]},
 {id:'essay',cat:'write',g:'both',ic:'📝',name:'독서감상문',desc:'자유 양식 감상문',f:[['head','text','제목'],['body','area','감상문','처음(책을 읽게 된 계기) – 가운데(내용과 생각) – 끝(배운 점, 다짐)의 짜임으로 써 보세요.',16]]},
 {id:'character',cat:'think',g:'fic',ic:'🔍',name:'인물 탐구하기',desc:'한 인물을 깊이 들여다보기',f:[['who','text','탐구할 인물'],['why','area','이 인물을 고른 이유'],['clue','area','성격을 알 수 있는 장면이나 대사'],['trait','area','인물의 성격과 특징'],['look','area','인물의 모습 (겉모습, 말투, 행동)'],['eval','area','인물에 대한 나의 평가'],['sum','area','종합하기']]},
 {id:'flower',cat:'think',g:'fic',ic:'🌸',name:'인물꽃 만들기',desc:'인물들의 성격을 한눈에',f:[['p','rows','등장인물 분석','인물마다 성격을 나타내는 말과 그 근거가 된 장면을 써요.',5,['인물','성격을 나타내는 말','근거가 된 장면']]]},
 {id:'mindmap',cat:'think',g:'both',ic:'🕸',name:'마인드맵',desc:'인물·주제 중심으로 생각 잇기',mm:true,f:[['center','text','가운데 낱말 (책 제목, 주인공, 주제 등)'],['b','rows','가지','가지마다 이어지는 생각을 쉼표(,)로 나누어 써요. 아래에 그림으로 그려져요.',5,['가지 이름','이어지는 생각 (쉼표로)']]]},
 {id:'qna',cat:'think',g:'both',ic:'💬',name:'질문과 대답 만들기',desc:'알게 된 내용으로 묻고 답하기',f:[['q','qa','질문과 대답 5개','책에서 알게 된 내용을 중심으로 질문하고 직접 답해요.',5]]},
 {id:'research',cat:'think',g:'both',ic:'🗂',name:'자료 찾아 정리하기',desc:'책에서 더 나아가 조사하기',f:[['new','area','새롭게 알게 된 사실'],['think','area','그 사실에 대한 나의 생각'],['more','area','더 알고 싶은 내용'],['why','area','알고 싶은 이유'],['found','area','새롭게 찾은 자료'],['src','text','자료의 출처 (책 이름, 누리집 주소 등)']]},
 {id:'apply',cat:'think',g:'non',ic:'🌱',name:'내 삶에 적용하기',desc:'책의 생각을 실천으로',f:[['claim','area','글쓴이가 가장 말하고 싶은 것'],['agree','area','내가 공감한 점 / 다르게 생각하는 점'],['plan','rows','실천 계획','책을 읽고 내 생활에서 해 볼 일을 정해요.',3,['실천할 일','언제·얼마나']],['after','area','해 보고 난 뒤 (선택)']]},
 {id:'debate',cat:'think',g:'both',ic:'⚖',name:'토론 준비하기',desc:'쟁점을 정해 내 입장 세우기',f:[['issue','text','토론 주제 (찬반이 나뉘는 질문)'],['side','text','나의 입장'],['r1','area','근거 1 (책 속 근거 포함)'],['r2','area','근거 2'],['counter','area','예상되는 반론과 나의 답변']]},
 {id:'comic',cat:'show',g:'both',ic:'🗯',name:'4컷 만화',desc:'인상 깊은 장면을 만화로',f:[['scene','area','가장 인상 깊은 장면과 그 이유'],['pan','panels','4컷 만화','종이에 그려 사진을 찍어 올리거나, 그림 앱으로 그려 올려요. 칸마다 장면 설명을 써요.',4]]},
 {id:'drawing',cat:'show',g:'both',ic:'🖼',name:'그림으로 표현하기',desc:'책의 느낌을 한 장의 그림으로',f:[['img','img','나의 그림'],['title','text','그림 제목'],['desc','area','그림 설명 (무엇을, 왜 이렇게 표현했나)']]},
 {id:'ad',cat:'show',g:'both',ic:'📣',name:'책 광고 만들기',desc:'이 책을 알리는 광고',f:[['target','text','누구에게 광고하나요? (대상 독자)'],['info','text','광고에 넣을 정보 (책 이름, 지은이, 출판사, 펴낸 해)'],['quote','area','마음에 드는 서평이나 작가의 말'],['copy','text','광고 문구 (카피)'],['img','img','광고 그림 (선택)'],['body','area','광고 글']]},
 {id:'quiz',cat:'show',g:'both',ic:'🧩',name:'퀴즈 만들기',desc:'친구들이 풀 수 있는 퀴즈',f:[['kind','chips','퀴즈 종류 (여러 개 골라도 돼요)','',['O·X 퀴즈','선택형','단답형','스무고개','십자말풀이','빈칸 채우기']],['q','qa','문제와 정답','',5]]},
 {id:'interview',cat:'show',g:'both',ic:'🎤',name:'가상 인터뷰',desc:'인물이나 작가를 인터뷰하기',f:[['who','text','인터뷰 대상 (작품 속 인물 또는 작가)'],['q','qa','인터뷰 질문과 대답','작품의 주제와 어울리는 질문 5개와, 그 사람이 했을 법한 대답을 써요.',5]]}
];
R.actById=function(id){for(var i=0;i<R.ACTS.length;i++)if(R.ACTS[i].id===id)return R.ACTS[i]};
R.WHY=['제목이 끌려서','표지가 마음에 들어서','친구·가족·선생님 추천','관심 있는 분야라서','진로와 관련 있어서','좋아하는 작가라서','영화·드라마로 알고 있어서','책 소개를 읽고'];
R.GH={
 summary:['처음–가운데–끝으로 나누어 중요한 사건을 3~5문장으로 써요.','인물, 사건, 갈등(문제)이 드러나게 5문장 안팎으로 써요.','갈등이 어떻게 생기고 풀리는지, 그 과정에서 드러나는 주제가 보이게 정리해요.'],
 key:['새롭게 알게 된 것 세 가지를 써요.','글쓴이의 주장과 그것을 뒷받침하는 근거를 나누어 써요.','글쓴이의 주장과 근거를 쓰고, 근거가 믿을 만한지도 짧게 덧붙여요.'],
 feel:['가장 기억에 남는 장면과 그때 든 마음을 솔직하게 써요.','내 생각과 그렇게 생각한 근거(책 속 장면이나 문장)를 함께 써요.','작가가 전하려는 생각에 대한 나의 평가와 근거, 그리고 내 삶과의 연결을 써요.'],
 best:['이 부분을 읽을 때 어떤 장면이 떠오르거나 어떤 기분이 들었나요?','이 부분이 책 전체에서 왜 중요한지, 나에게 왜 와닿았는지 써요.','이 부분이 책의 주제와 어떻게 이어지는지, 나의 생각을 어떻게 바꾸었는지 써요.']
};
/* 고등학교 1~3학년 길잡이 (학년 값 4~6) */
R.GH.summary.push('사건의 흐름과 인물의 변화를 짚고, 그 과정에서 드러나는 주제를 한 문장으로 덧붙여요.','서술 방식(시점·구성)이 이야기의 의미를 어떻게 만드는지까지 드러나게 정리해요.','작품의 시대·사회적 맥락을 함께 고려해 갈등과 주제를 압축적으로 정리해요.');
R.GH.key.push('글쓴이의 핵심 주장과 근거를 구분하고, 각 근거의 종류(사실·통계·사례·전문가 의견)를 밝혀요.','주장과 근거의 타당성·신뢰성을 따져 보고, 빠진 관점이 없는지 짚어요.','이 책의 주장을 같은 주제의 다른 글·자료와 견주어 공통점과 차이점을 정리해요.');
R.GH.feel.push('작품(책)이 던지는 질문에 대한 나의 관점을 근거와 함께 써요.','동의하는 점과 비판할 점을 균형 있게 쓰고, 내 생각이 어떻게 바뀌었는지 밝혀요.','책의 문제의식을 나의 진로·사회 문제와 연결해 깊이 있는 나의 견해로 정리해요.');
R.GH.best.push('이 부분의 표현이나 논리가 왜 인상적인지 분석해 써요.','이 부분이 작품 전체의 주제나 글쓴이의 의도와 어떻게 연결되는지 써요.','이 부분을 다른 작품·사회 현상과 연결해 나만의 해석을 써요.');
R.gradeLabel=function(g){g=+g||0;return g>=4?'고'+(g-3):g>=1?'중'+g:''};
R.RUB=[
 ['꾸준히 읽기','계획을 세워 기간 동안 꾸준히 읽고 일지를 자주 기록했다','대체로 계획대로 읽고 일지를 기록했다','몰아서 읽거나 기록이 적었다'],
 ['내용 이해','줄거리(핵심 내용)를 정확하고 짜임새 있게 정리했다','줄거리(핵심 내용)를 대체로 정리했다','내용 정리가 부족했다'],
 ['생각과 근거','내 생각을 책 속 근거와 함께 분명하게 썼다','내 생각을 썼으나 근거가 부족했다','느낌을 짧게만 썼다'],
 ['표현과 나눔','독후활동을 개성 있게 완성하고, 함께 나눌 좋은 질문을 만들었다','독후활동을 완성하고 질문을 만들었다','독후활동이나 질문이 미완성이다']
];

/* ───────── 도움 함수 ───────── */
function filled(v){return v!=null&&String(v).trim()!==''}
R.filled=filled;
R.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
function pad(n){return ('0'+n).slice(-2)}
R.iso=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
R.pd=function(s){var a=String(s).split('-');return new Date(+a[0],+a[1]-1,+a[2])};
R.addD=function(s,n){var d=R.pd(s);d.setDate(d.getDate()+n);return R.iso(d)};
R.diff=function(a,b){return Math.round((R.pd(b)-R.pd(a))/86400000)};
R.md=function(s){var d=R.pd(s);return (d.getMonth()+1)+'/'+d.getDate()};
R.today=function(){return R.iso(new Date())};
/* 날짜: 숫자 8자리(yyyymmdd)로 입력 → yyyy-mm-dd */
R.digits8=function(v){return String(v==null?'':v).replace(/\D/g,'').slice(0,8)};
R.fmtDate=function(v){var d=R.digits8(v);return d.slice(0,4)+(d.length>4?'-'+d.slice(4,6):'')+(d.length>6?'-'+d.slice(6):'')};
R.parseDate=function(v){var d=R.digits8(v);if(d.length!==8)return '';var y=+d.slice(0,4),m=+d.slice(4,6),dd=+d.slice(6),t=new Date(y,m-1,dd);
  if(y<2000||y>2100||t.getMonth()!==m-1||t.getDate()!==dd)return '';return R.iso(t)};
/* 글자 입력칸을 날짜 칸으로: 숫자만 받고 자동으로 - 를 넣음, 📅 버튼으로 달력 선택 */
R.dateField=function(el,onChange){
  el.setAttribute('inputmode','numeric');el.setAttribute('maxlength','10');el.setAttribute('autocomplete','off');if(!el.placeholder)el.placeholder='예: '+R.digits8(R.today());
  var wrap=document.createElement('span');wrap.className='dtwrap';el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);
  var b=document.createElement('button');b.type='button';b.className='dtbtn';b.title='달력에서 고르기';b.setAttribute('aria-label','달력에서 고르기');b.textContent='📅';
  var p=document.createElement('input');p.type='date';p.className='dtpick';p.tabIndex=-1;p.setAttribute('aria-hidden','true');p.min='2000-01-01';p.max='2100-12-31';
  wrap.appendChild(b);wrap.appendChild(p);
  function upd(){var iso=R.parseDate(el.value),n=R.digits8(el.value).length;el.classList.toggle('bad',n===8&&!iso);if(onChange)onChange(iso,el.value)}
  el.addEventListener('input',function(){var f=R.fmtDate(el.value);if(f!==el.value)el.value=f;upd()});
  el.addEventListener('blur',function(){var iso=R.parseDate(el.value);if(iso)el.value=iso});
  b.addEventListener('click',function(){p.value=R.parseDate(el.value)||R.today();try{p.showPicker()}catch(e){p.focus();p.click()}});
  p.addEventListener('change',function(){if(!p.value)return;el.value=p.value;upd()});
};
R.uid=function(n){var c='abcdefghijkmnpqrstuvwxyz23456789',s='';for(var i=0;i<(n||6);i++)s+=c[Math.floor(Math.random()*c.length)];return s};

/* ───────── 설정 ↔ 링크 ───────── */
R.b64e=function(str){return btoa(unescape(encodeURIComponent(str))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
R.b64d=function(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return decodeURIComponent(escape(atob(s)))};
R.hash=function(str){var h=5381;str='r40|'+str;for(var i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return (h>>>0).toString(36)};
R.encodeCfg=function(c){var j=JSON.stringify(c);return R.b64e(j)+'.'+R.hash(j)};
R.decodeCfg=function(s){try{var p=String(s).split('.'),j=R.b64d(p[0]),c=JSON.parse(j);if(!c||typeof c!=='object')return null;return {cfg:c,ok:p[1]===R.hash(j)}}catch(e){return null}};
R.cfgFromUrl=function(u){var m=/[#&?]c=([A-Za-z0-9_\-.]+)/.exec(u||'');return m?R.decodeCfg(m[1]):null};

/* ───────── 진행 상태 (S = 학생 기록, c = 학급 설정) ───────── */
function g_(S,p){return p.split('.').reduce(function(o,k){return o==null?undefined:o[k]},S)}
function arr(S,p){var a=g_(S,p);return Array.isArray(a)?a:[]}
R.get=g_;R.arr=arr;
R.genre=function(S){return g_(S,'book.genre')||''};
R.startDate=function(S,c){var s=g_(S,'book.start');if(s)return s;if(c.start)return c.start;var l=arr(S,'logs').map(function(x){return x.date}).sort();return l[0]||R.today()};
R.days=function(c){return Math.max(1,+c.days||40)};
R.mode=function(c){var m=c.mode||'free';if(m!=='free'&&!(c.acts||[]).length)m='free';return m};
R.fitGenre=function(a,S){var g=R.genre(S);return !g||a.g==='both'||a.g===g};
R.actAvail=function(S,c){var m=R.mode(c);return R.ACTS.filter(function(a){return R.fitGenre(a,S)&&(m==='free'||c.acts.indexOf(a.id)>=0)})};
R.actChosen=function(S,c){var av=R.actAvail(S,c);if(R.mode(c)==='fixed')return av;var ch=arr(S,'act.chosen');return av.filter(function(a){return ch.indexOf(a.id)>=0})};
R.actNeed=function(S,c){var n=R.actAvail(S,c).length;return R.mode(c)==='fixed'?n:Math.min(Math.max(1,+c.count||1),n)};
R.fkeys=function(f){var k=f[0],t=f[1],n=f[4],o=[],i;
  if(t==='qa'){for(i=1;i<=n;i++)o.push(k+i+'q',k+i+'a');return o}
  if(t==='rows'){for(i=1;i<=n;i++)o.push(k+i+'_0');return o}
  if(t==='panels'){for(i=1;i<=n;i++)o.push(k+i+'img');return o}
  return [k]};
R.aval=function(S,a,k){var d=g_(S,'act.data.'+a.id);return d?d[k]:undefined};
R.actState=function(S,a){var ks=[];a.f.forEach(function(f){ks=ks.concat(R.fkeys(f))});
  var n=ks.filter(function(k){var v=R.aval(S,a,k);return Array.isArray(v)?v.length:filled(v)}).length;
  return n===0?0:n>=Math.ceil(ks.length*0.6)?2:1};
R.postKeys=function(S){return (R.genre(S)==='non'?['post.theme','post.key1','post.key2','post.key3']:['post.summary']).concat(['post.feel','post.best','post.bestWhy','post.share'])};
R.st={
 pre:function(S){var n=['pre.why','pre.predict','pre.wonder','pre.daily'].filter(function(k){return filled(g_(S,k))}).length+(arr(S,'pre.chips').length?1:0);return n>=4?2:n?1:0},
 during:function(S){var n=arr(S,'logs').length;return n>=10?2:n?1:0},
 post:function(S){var ks=R.postKeys(S),n=ks.filter(function(k){return filled(g_(S,k))}).length;return n===ks.length?2:n?1:0},
 act:function(S,c){var ch=R.actChosen(S,c);if(!ch.length)return 0;var d=ch.filter(function(a){return R.actState(S,a)===2}).length;return d>=R.actNeed(S,c)?2:1},
 fin:function(S){var star=g_(S,'fin.star'),one=filled(g_(S,'fin.oneline')),self=g_(S,'self')||{};return star&&one&&Object.keys(self).length===R.RUB.length?2:(star||one)?1:0}
};
R.summary=function(S,c){var logs=arr(S,'logs'),s=R.startDate(S,c),D=R.days(c),dates={};
  logs.forEach(function(l){var k=R.diff(s,l.date);if(k>=0&&k<D)dates[l.date]=1});
  var pct=Math.min(100,Math.max.apply(null,[0].concat(logs.map(function(l){return +l.pct||0}))));
  var ch=R.actChosen(S,c);
  return {start:s,logs:logs.length,logDays:Object.keys(dates).length,pct:pct,quotes:arr(S,'quotes').length,qs:arr(S,'qs').length,
    actDone:ch.filter(function(a){return R.actState(S,a)===2}).length,actNeed:R.actNeed(S,c),actNames:ch.map(function(a){return a.name}),
    pre:R.st.pre(S,c),during:R.st.during(S,c),post:R.st.post(S,c),act:R.st.act(S,c),fin:R.st.fin(S,c),star:+(g_(S,'fin.star')||0)}};

/* ───────── AI 독후활동 코치 ─────────
   북로드는 AI를 직접 부르지 않는다. 선생님이 만든 AI 에이전트 링크(cfg.agent)를 열고,
   학생이 북로드가 만든 요청문을 복사해 붙여 넣는다. 이름 같은 개인정보는 요청문에 넣지 않는다. */
R.AGENT_PROMPT="너는 '북로드 독후활동 코치'야. 중·고등학생이 책을 다 읽은 뒤, 자기에게 맞는 독후활동을 고르도록 돕는다.\n\n[지켜야 할 규칙]\n1. 독후활동 결과물(감상문, 편지, 서평, 만화 대본 등)을 대신 써 주지 않는다. 시작을 돕는 질문과 짜임(틀)까지만 준다.\n2. 책 내용을 아는 척하지 않는다. 줄거리·인물·결말은 학생이 알려 준 정보만 사용하고, 모르는 부분은 \"책에서 확인해 보세요\"라고 말한다.\n3. 학생의 이름·학교·연락처 같은 개인정보를 묻지 않는다.\n4. 학생이 보낸 '선생님이 정한 활동 목록'이 있으면 그 안에서만 추천한다. 없으면 아래 19가지 중에서 추천한다.\n5. 학년에 맞춘다. 중학생은 쉬운 말과 구체적인 예로, 고등학생은 관점·근거·사회적 맥락까지 생각하게 한다.\n6. 친근한 존댓말로, 한 번에 너무 길지 않게 답한다.\n\n[북로드 독후활동 19가지]\n쓰기: 친구에게 책 소개하기, 추천서 쓰기, 인물에게 편지 쓰기(소설), 작가에게 엽서 쓰기, 뒷이야기 쓰기(소설), 서평 쓰기, 독서감상문\n생각 정리: 인물 탐구하기(소설), 인물꽃 만들기(소설), 마인드맵, 질문과 대답 만들기, 자료 찾아 정리하기, 내 삶에 적용하기(비문학), 토론 준비하기\n표현: 4컷 만화, 그림으로 표현하기, 책 광고 만들기, 퀴즈 만들기, 가상 인터뷰\n(소설) 표시 활동은 소설에만, (비문학) 표시 활동은 비문학에만 추천한다.\n\n[대화 순서]\n1단계: 학생 정보를 확인한다. 꼭 필요한 정보가 빠졌으면 질문을 2개까지만 한다.\n2단계: 독후활동 3가지를 아래 형식으로 추천한다.\n  ① 활동 이름 — 이 학생에게 맞는 이유(학생이 쓴 느낌·구절·좋아하는 방식과 연결해 1~2문장)\n     · 첫걸음 질문: 활동을 시작할 때 스스로 답해 볼 질문 1개\n  (②, ③도 같은 형식)\n  마지막 줄: \"추천은 참고일 뿐이에요. 따를지, 바꿀지 스스로 정하고 그 이유를 북로드에 적어 보세요.\"\n3단계: 학생이 하나를 고르면, 그 활동의 짜임(3~4단계)과 생각을 여는 질문 3개를 준다. 문장을 대신 완성해 주지 않는다.\n학생이 대신 써 달라고 하면 정중히 거절하고, 대신 질문으로 도와준다.";
R.STYLES=['그리기','글쓰기','말하기·토론','정리하기','상상하기','조사하기','만들기·꾸미기'];
R.coachPrompt=function(S,c){var p=S.profile||{},b=S.book||{},po=S.post||{},g=R.genre(S),st=R.arr(S,'coach.styles');
  var feel=String(po.feel||'').replace(/\s+/g,' ').trim();if(feel.length>220)feel=feel.slice(0,220)+'…';
  var q=String(po.best||((R.arr(S,'quotes')[0]||{}).text)||'').replace(/\s+/g,' ').trim();if(q.length>120)q=q.slice(0,120)+'…';
  var m=R.mode(c),av=R.actAvail(S,c).map(function(a){return a.name}),need=R.actNeed(S,c);
  return ['[북로드 독후활동 추천 요청]',
   '- 학년: '+(R.gradeLabel(p.grade)||'(미입력)')+' / 책의 갈래: '+(g==='fic'?'소설':g==='non'?'비문학':'(미입력)'),
   '- 책: 「'+(b.title||'제목 미입력')+'」'+(b.author?' ('+b.author+')':''),
   '- 읽은 후 나의 느낌: '+(feel||'(아직 쓰지 않음)'),
   '- 기억에 남는 구절: '+(q||'(없음)'),
   '- 내가 좋아하는 표현 방식: '+(st.length?st.join(', '):'(고르지 않음)'),
   '- 선생님이 정한 활동 목록: '+(m==='free'?'없음 (19가지 중에서 추천)':av.join(', ')+(m==='fixed'?' (모두 해야 함 — 어떤 순서·방법으로 하면 좋을지 알려 주세요)':' (이 중에서 '+need+'개 이상)')),
   m==='fixed'?'위 정보로 내가 해야 할 활동을 나에게 맞게 시작하는 방법을 알려 주세요.':'위 정보로 나에게 맞는 독후활동 3가지를 추천해 주세요.'].join('\n')};

g.R40=R;
})(window);
