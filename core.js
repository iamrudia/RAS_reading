/* 북로드(Book ROAD) – 공통 데이터와 계산 (학생 페이지·교사 페이지·모아보기가 함께 씀)
   서버·데이터베이스 없음. 학급 설정은 링크(#c=…) 안에, 학생 기록은 학생 브라우저에만 저장된다. */
(function(g){
'use strict';
var R={VERSION:'1.9',NAME:'북로드',SUB:'책과 함께 걷는 지혜의 숲길'};

/* 학급 설정 기본값 */
R.DEF={v:1,id:'',school:'',cls:'',title:'북로드',days:40,start:'',end:'',checks:[10,20,30],
  elib:'https://lib.goe.go.kr/elib/index.do',upload:'',uploadLabel:'제출 폴더',mode:'free',acts:[],count:1,multi:true,actFor:'one'};
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
 {id:'card',cat:'show',g:'both',ic:'🃏',name:'30초 책 소개 카드',desc:'책 장터에 놓을 표지 카드',f:[['sum','area','한 문장으로 말하면','소설: 누가 / 무엇을 원했는데 / 그러나 (문제) / 그래서 / 결국 …  비문학: 이 책은 ___을 말한다. 그 근거는 ___. 나는 ___라고 생각한다.',3],['who','text','이런 친구에게 추천해요','예: 진로 때문에 고민하는 친구, 반전 있는 이야기를 좋아하는 친구'],['q','text','함께 나눌 질문','비워 두면 ③ 읽은 후의 ‘함께 나눌 질문’이 들어가요'],['key','text','이 책을 세 단어로 (선택)','쉼표로 나누어 써요. 예: 우정, 용기, 반전']]},
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
R.dateField=function(el,onChange,opt){
  el.setAttribute('inputmode','numeric');el.setAttribute('maxlength','10');el.setAttribute('autocomplete','off');if(!el.placeholder)el.placeholder='예: '+R.digits8(R.today());
  var wrap=document.createElement('span');wrap.className='dtwrap';el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);
  var b=document.createElement('button');b.type='button';b.className='dtbtn';b.title='달력에서 고르기';b.setAttribute('aria-label','달력에서 고르기');b.textContent='📅';
  var p=document.createElement('input');p.type='date';p.className='dtpick';p.tabIndex=-1;p.setAttribute('aria-hidden','true');p.min='2000-01-01';p.max='2100-12-31';
  wrap.appendChild(b);wrap.appendChild(p);
  function upd(){var iso=R.parseDate(el.value),n=R.digits8(el.value).length;el.classList.toggle('bad',n===8&&!iso);if(onChange)onChange(iso,el.value)}
  el.addEventListener('input',function(){var f=R.fmtDate(el.value);if(f!==el.value)el.value=f;upd()});
  el.addEventListener('blur',function(){var iso=R.parseDate(el.value);if(iso)el.value=iso});
  b.addEventListener('click',function(){var mn=opt&&opt.min;p.min=(typeof mn==='function'?mn():mn)||'2000-01-01';p.value=R.parseDate(el.value)||(p.min>R.today()?p.min:R.today());try{p.showPicker()}catch(e){p.focus();p.click()}});
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
/* 쪽수: 지금까지 읽은 마지막 쪽 */
R.lastPage=function(S){return Math.max.apply(null,[0].concat(arr(S,'logs').map(function(l){return +l.to||0})))};
R.pageText=function(l){return (+l.to?(+l.from&&+l.from!==+l.to?l.from+'~':'')+l.to+'쪽':'')+(l.pos?(+l.to?' · ':'')+l.pos:'')};
/* 여러 권 읽기: 다 읽은 책은 S.shelf(내 책장)에 한 권씩 쌓인다. 도장판(기간)은 하나로 이어진다. */
R.BOOK_KEYS=['book','pre','logs','quotes','qs','post','act','coach','fin','self'];
R.shelf=function(S){return arr(S,'shelf')};
R.allLogs=function(S){var a=[];R.shelf(S).forEach(function(b){a=a.concat(arr(b,'logs'))});return a.concat(arr(S,'logs'))};
R.bookDone=function(B){var t=+g_(B,'book.pages')||0;return !!t&&R.lastPage(B)>=t};
R.started=function(B){return filled(g_(B,'book.title'))||arr(B,'logs').length>0};
R.canNext=function(S,c){return c.multi!==false&&R.bookDone(S)&&R.st.post(S)===2};
R.actRep=function(S,c){if(c.actFor==='each')return null;var sh=R.shelf(S);for(var i=0;i<sh.length;i++)if(R.st.actOwn(sh[i],c)===2)return sh[i];return null};
R.days=function(c){return Math.max(1,+c.days||40)};
/* 기간: 시작일 ~ 끝나는 날(학생 > 선생님 > 시작일+기본 일수) */
R.endDate=function(S,c){var s=R.startDate(S,c),e=g_(S,'book.end')||c.end;if(!e||e<s)e=R.addD(s,R.days(c)-1);return e};
R.span=function(S,c){return R.diff(R.startDate(S,c),R.endDate(S,c))+1};
R.fmtD=function(iso){var d=R.pd(iso);return d.getFullYear()+'.'+(d.getMonth()+1)+'.'+d.getDate()};
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
 actOwn:function(S,c){var ch=R.actChosen(S,c);if(!ch.length)return 0;var d=ch.filter(function(a){return R.actState(S,a)===2}).length;return d>=R.actNeed(S,c)?2:1},
 act:function(S,c){var v=R.st.actOwn(S,c);return v===2||!R.actRep(S,c)?v:2},
 fin:function(S){var star=g_(S,'fin.star'),one=filled(g_(S,'fin.oneline')),self=g_(S,'self')||{};return star&&one&&Object.keys(self).length===R.RUB.length?2:(star||one)?1:0}
};
R.summary=function(S,c){var logs=arr(S,'logs'),s=R.startDate(S,c),D=R.span(S,c),dates={};
  R.allLogs(S).forEach(function(l){var k=R.diff(s,l.date);if(k>=0&&k<D)dates[l.date]=1});
  var tot=+g_(S,'book.pages')||0;
  var pct=Math.min(100,Math.max.apply(null,[0].concat(logs.map(function(l){return (tot&&+l.to)?Math.round(+l.to/tot*100):(+l.pct||0)}))));
  var ch=R.actChosen(S,c),sh=R.shelf(S),rep=R.actRep(S,c);
  var books=sh.length+(R.started(S)?1:0),done=sh.length+(R.bookDone(S)?1:0),pagesAll=sh.reduce(function(t,b){return t+R.lastPage(b)},0)+R.lastPage(S);
  var titles=sh.map(function(b){return g_(b,'book.title')||'제목 없음'}).concat(R.started(S)?[g_(S,'book.title')||'제목 없음']:[]);
  return {books:books,done:done,pagesAll:pagesAll,titles:titles,actRep:rep?(g_(rep,'book.title')||'제목 없음'):'',start:s,end:R.endDate(S,c),span:D,logs:logs.length,logDays:Object.keys(dates).length,pct:pct,quotes:arr(S,'quotes').length,qs:arr(S,'qs').length,
    actDone:ch.filter(function(a){return R.actState(S,a)===2}).length,actNeed:R.actNeed(S,c),actNames:ch.map(function(a){return a.name}),
    pre:R.st.pre(S,c),during:R.st.during(S,c),post:R.st.post(S,c),act:R.st.act(S,c),fin:R.st.fin(S,c),star:+(g_(S,'fin.star')||0)}};


/* ───────── 30초 책 소개 카드 (책 장터용) ─────────
   학생 화면(한 장 인쇄)과 모아보기(반 전체, A4에 4장)가 함께 쓴다. */
R.cardBook=function(S){if(R.started(S))return S;var sh=R.shelf(S);if(!sh.length)return S;var B={};for(var k in S)if(R.BOOK_KEYS.indexOf(k)<0)B[k]=S[k];var L=sh[sh.length-1];R.BOOK_KEYS.forEach(function(k){if(L[k]!==undefined)B[k]=L[k]});return B};
R.CARD_CSS="@page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:'Pretendard','Noto Sans KR','Malgun Gothic',sans-serif;color:#1f1c2e;-webkit-print-color-adjust:exact;print-color-adjust:exact}"+
 ".cards{display:grid;grid-template-columns:1fr 1fr;gap:6mm}.one .cards{grid-template-columns:1fr;max-width:105mm;margin:8mm auto}"+
 ".bc{height:132mm;border:2px solid #3b34a8;border-radius:5mm;overflow:hidden;display:flex;flex-direction:column;break-inside:avoid;background:#fffdf9}"+
 ".bc .top{display:flex;gap:4mm;padding:5mm 5mm 3mm;background:linear-gradient(135deg,#2b2588,#4a41c4);color:#fff}"+
 ".bc .cv{width:30mm;height:42mm;flex:none;border-radius:2mm;background:#fff center/cover no-repeat;box-shadow:0 1mm 2mm rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;text-align:center;font-size:9pt;color:#3b34a8;padding:2mm;font-weight:700}"+
 ".bc .ti{min-width:0;display:flex;flex-direction:column;gap:1mm}.bc .eb{font-size:7pt;letter-spacing:.12em;color:#ffd58a;font-weight:700}"+
 ".bc h2{margin:0;font-family:'Noto Serif KR',serif;font-size:14pt;line-height:1.3}.bc .au{font-size:9pt;opacity:.85}.bc .st{color:#ffd58a;font-size:11pt;letter-spacing:1px}.bc .gn{font-size:8pt;opacity:.8}"+
 ".bc .bd{padding:3.5mm 5mm 2mm;display:flex;flex-direction:column;gap:2.4mm;flex:1;min-height:0}.bc .k{font-size:7.5pt;font-weight:700;color:#3b34a8;letter-spacing:.04em}"+
 ".bc .v{font-size:9.5pt;line-height:1.45;margin-top:.5mm;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4}.bc .q .v{font-family:'Noto Serif KR',serif;font-size:10.5pt;-webkit-line-clamp:3}"+
 ".bc .kw{display:flex;gap:1.5mm;flex-wrap:wrap}.bc .kw span{background:#ebe9fa;color:#2b2588;border-radius:9mm;padding:.6mm 2.6mm;font-size:8.5pt;font-weight:700}"+
 ".bc .ft{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;border-top:1px dashed #cfc8ef;padding:2mm 5mm 3mm;font-size:8pt;color:#6a6578}.bc .like{border:1.5px dashed #c27c1a;color:#c27c1a;border-radius:2mm;padding:1mm 2.5mm;font-weight:700}"+
 ".blank{color:#b0aac0}@media screen{body{background:#f6f3ec;padding:6mm}}";
R.cardHTML=function(S,c){var B=R.cardBook(S),e=R.esc,b=B.book||{},p=B.profile||{},d=g_(B,'act.data.card')||{},g=R.genre(B),star=+(g_(B,'fin.star')||0);
  var q=d.q||g_(B,'post.share')||'',kw=String(d.key||'').split(/[,，·\s]+/).filter(Boolean).slice(0,4);
  function blk(cls,k,v){return '<div class="'+cls+'"><div class="k">'+k+'</div><div class="v">'+(R.filled(v)?e(v).replace(/\n/g,'<br>'):'<span class="blank">(아직 쓰지 않았어요)</span>')+'</div></div>'}
  return '<div class="bc"><div class="top"><div class="cv"'+(b.cover?' style="background-image:url('+b.cover+')"':'')+'>'+(b.cover?'':e(b.title||'표지'))+'</div>'+
   '<div class="ti"><span class="eb">📚 BOOK ROAD · 30초 책 소개</span><h2>'+e(b.title||'제목 없음')+'</h2><span class="au">'+e(b.author||'')+(b.pub?' · '+e(b.pub):'')+'</span>'+
   (star?'<span class="st">'+'★★★★★'.slice(0,star)+'<span style="opacity:.35">'+'★★★★★'.slice(0,5-star)+'</span></span>':'')+'<span class="gn">'+(g==='fic'?'소설·이야기':g==='non'?'비문학':'')+(b.pages?' · '+e(b.pages)+'쪽':'')+'</span></div></div>'+
   '<div class="bd">'+blk('s','한 문장으로 말하면',d.sum)+blk('w','이런 친구에게 추천해요',d.who)+blk('q','함께 나눌 질문',q?'Q. '+q:'')+
   (kw.length?'<div><div class="k">이 책을 세 단어로</div><div class="kw" style="margin-top:1mm">'+kw.map(function(w){return '<span>#'+e(w)+'</span>'}).join('')+'</div></div>':'')+'</div>'+
   '<div class="ft"><span>추천한 사람: '+e([R.gradeLabel(p.grade),p.cls&&p.cls+'반',p.name].filter(Boolean).join(' ')||'')+'</span><span class="like">읽고 싶어요 ☐</span></div></div>'};
R.cardDoc=function(inner,one){return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>북로드 책 소개 카드</title><style>'+R.CARD_CSS+'</style></head><body class="'+(one?'one':'')+'"><div class="cards">'+inner+'</div><script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>'};

/* 책 명언 50 — 순서를 섞어 날마다 하나씩 (같은 날에는 누구에게나 같은 명언) */
R.QUOTES=[["하루라도 책을 읽지 않으면 입 안에 가시가 돋는다.", "안중근", "뤼순 감옥 유묵"], ["사내라면 모름지기 다섯 수레의 책을 읽어야 한다.", "두보", ""], ["책을 백 번 읽으면 뜻이 저절로 드러난다.", "『삼국지』 위지 동우전", ""], ["책 속에 저절로 황금 집이 있다.", "송 진종", "「권학문」"], ["책을 읽을 때는 마음·눈·입, 세 가지가 함께 가야 한다.", "주희", "독서삼도"], ["독서야말로 사람이 할 수 있는 가장 깨끗한 일이다.", "정약용", "두 아들에게 보낸 편지"], ["사흘 동안 책을 읽지 않으면 말에 맛이 없고 얼굴이 밉살스러워진다.", "황정견", ""], ["사람은 책을 만들고, 책은 사람을 만든다.", "신용호", "교보문고 창립자"], ["책 없는 방은 영혼 없는 몸과 같다.", "키케로", "전해짐"], ["독서는 사람을 풍요롭게 하고, 토론은 재빠르게 하며, 글쓰기는 정확하게 한다.", "프랜시스 베이컨", "「학문에 대하여」"], ["어떤 책은 맛만 보고, 어떤 책은 삼키고, 몇몇 책은 씹어서 소화해야 한다.", "프랜시스 베이컨", "「학문에 대하여」"], ["좋은 책을 읽는 것은 지난 시대의 가장 훌륭한 사람들과 대화하는 것이다.", "르네 데카르트", "『방법서설』"], ["독서와 정신의 관계는 운동과 몸의 관계와 같다.", "조지프 애디슨", ""], ["좋은 책은 위대한 정신의 소중한 생명의 피다.", "존 밀턴", "『아레오파기티카』"], ["돈이 조금 생기면 책을 산다. 남는 돈이 있으면 음식과 옷을 산다.", "에라스뮈스", ""], ["나는 책 없이는 살 수 없다.", "토머스 제퍼슨", "존 애덤스에게 보낸 편지"], ["책은 세상의 소중한 재산이며, 세대와 나라가 물려받을 유산이다.", "헨리 데이비드 소로", "『월든』"], ["한 권의 책을 읽은 날부터 삶의 새 시대를 맞은 사람이 얼마나 많은가.", "헨리 데이비드 소로", "『월든』"], ["살기 위해 읽어라.", "귀스타브 플로베르", "편지"], ["책은 시간이라는 큰 바다에 세운 등대다.", "에드윈 퍼시 휘플", ""], ["책은 가장 조용하고 변함없는 친구다.", "찰스 W. 엘리엇", ""], ["읽는 법을 배우면 영원히 자유로워진다.", "프레더릭 더글러스", "전해짐"], ["책은 우리 안의 얼어붙은 바다를 깨는 도끼여야 한다.", "프란츠 카프카", "오스카 폴락에게 보낸 편지"], ["나는 늘 천국이 도서관 같은 곳일 거라고 생각했다.", "호르헤 루이스 보르헤스", ""], ["책은 들고 다닐 수 있는 특별한 마법이다.", "스티븐 킹", "『유혹하는 글쓰기』"], ["책을 읽는 사람은 죽기 전에 천 번의 삶을 산다. 읽지 않는 사람은 단 한 번만 산다.", "조지 R. R. 마틴", "『드래곤과의 춤』"], ["책은 거울이다. 이미 내 안에 있는 것만 그 속에서 보인다.", "카를로스 루이스 사폰", "『바람의 그림자』"], ["모두가 읽는 책만 읽으면, 모두가 하는 생각만 하게 된다.", "무라카미 하루키", "『노르웨이의 숲』"], ["고전이란 모두가 칭찬하지만 아무도 읽지 않는 책이다.", "마크 트웨인", "『적도를 따라서』"], ["우리는 혼자가 아니라는 것을 알기 위해 읽는다.", "윌리엄 니컬슨", "『섀도우랜드』"], ["내 마음에 들 만큼 큰 찻잔도, 긴 책도 세상에는 없다.", "C. S. 루이스", ""], ["열 살에 읽을 가치가 없는 책은 쉰 살에도 읽을 가치가 없다.", "C. S. 루이스", ""], ["말하기 전에 생각하라. 생각하기 전에 읽어라.", "프랜 레보위츠", ""], ["우리를 먼 곳으로 데려가는 데 책만 한 배는 없다.", "에밀리 디킨슨", ""], ["책은 비행기이고, 기차이고, 길이다.", "애나 퀸들런", "『독서가 어떻게 나의 인생을 바꾸었나』"], ["책은 발을 움직이지 않고도 여행하게 해 준다.", "줌파 라히리", "『이름 뒤에 숨은 사랑』"], ["독서는 대화다. 모든 책은 말을 하지만, 좋은 책은 귀도 기울인다.", "마크 해던", ""], ["책은 손에 쥘 수 있는 꿈이다.", "닐 게이먼", ""], ["읽어야 할 때가 아니라 읽고 싶어서 읽는 것이 훗날의 나를 만든다.", "오스카 와일드", "전해짐"], ["책을 불태우는 것보다 더 나쁜 범죄가 있다. 책을 읽지 않는 것이다.", "이오시프 브로드스키", ""], ["그녀에게 세상은 읽기만 하면 되는 것이었다.", "베티 스미스", "『나를 찾아가는 길』"], ["읽고 싶은 책이 아직 쓰이지 않았다면, 네가 써야 한다.", "토니 모리슨", ""], ["많이 읽을수록 더 많이 알게 되고, 많이 배울수록 더 많은 곳에 가게 된다.", "닥터 수스", "『눈 감고도 읽을 수 있어!』"], ["한 명의 어린이, 한 명의 교사, 한 권의 책, 한 자루의 펜이 세상을 바꿀 수 있다.", "말랄라 유사프자이", "2013년 유엔 연설"], ["책은 나에게 개인적 자유로 가는 통행증이었다.", "오프라 윈프리", ""], ["문학은 나의 유토피아다.", "헬렌 켈러", ""], ["읽고, 읽고, 또 읽어라. 무엇이든 읽어라.", "윌리엄 포크너", ""], ["도서관은 돈 없는 시절을 버티게 해 주지만, 돈은 도서관 없는 시절을 버티게 해 주지 못한다.", "앤 허버트", ""], ["오늘 책을 읽는 사람이 내일의 리더가 된다.", "마거릿 풀러", "전해짐"], ["책 속에는 보물섬 해적들의 보물보다 더 많은 보물이 있다.", "월트 디즈니", "전해짐"]];
R.QORDER=(function(){var n=R.QUOTES.length,o=[],s=20261107,i,j,t;for(i=0;i<n;i++)o.push(i);
  for(i=n-1;i>0;i--){s=(s*1103515245+12345)&0x7fffffff;j=s%(i+1);t=o[i];o[i]=o[j];o[j]=t}return o})();
R.quoteOfDay=function(iso){var d=R.pd(iso||R.today()),k=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000);return ((k%R.QUOTES.length)+R.QUOTES.length)%R.QUOTES.length};

g.R40=R;
})(window);
