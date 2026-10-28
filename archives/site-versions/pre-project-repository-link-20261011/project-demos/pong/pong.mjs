/* Classic deferred script, deliberately without imports: this also runs inside
   the preview's opaque-origin iframe (sandbox="allow-scripts"). */
(() => {
  'use strict';
  const copy = {
    fr: {
      title:'Pong · Démo d’essai',
      description:'Un exemple jouable pour essayer cette présentation, distinct du projet des auteurs.',
      player:'Vous',computer:'Ordinateur',score:'Score',
      field:'Terrain de Pong. Vous jouez avec la raquette de gauche.',
      instructions:'Déplacez la raquette avec la souris, le doigt ou ↑ ↓ / W S. Échap met en pause. Tab permet de quitter le terrain.',
      ready:'Prêt à jouer',playing:'Partie en cours',paused:'En pause',start:'Démarrer',resume:'Reprendre',pause:'Pause',reset:'Recommencer',
      won:'Vous avez gagné !',lost:'L’ordinateur a gagné.',again:'Rejouer',goal:'Premier à 5 points.'
    },
    en: {
      title:'Pong · Playable demo',
      description:'A playable example of this presentation, separate from the authors’ project.',
      player:'You',computer:'Computer',score:'Score',
      field:'Pong court. You control the left paddle.',
      instructions:'Move with your mouse, touch, or ↑ ↓ / W S. Escape pauses the game. Tab leaves the court.',
      ready:'Ready to play',playing:'Game in progress',paused:'Paused',start:'Start',resume:'Resume',pause:'Pause',reset:'Restart',
      won:'You won!',lost:'The computer won.',again:'Play again',goal:'First to 5 points.'
    },
    ar: {
      title:'بونغ · تجربة قابلة للعب',
      description:'مثال قابل للعب لتجربة طريقة العرض، منفصل عن مشروع المؤلفين.',
      player:'أنت',computer:'الحاسوب',score:'النتيجة',
      field:'ملعب بونغ. تتحكم بالمضرب الأيسر.',
      instructions:'حرّك المضرب بالفأرة أو اللمس أو ↑ ↓ / W S. يوقف Escape اللعب مؤقتًا. ينقلك Tab خارج الملعب.',
      ready:'جاهز للعب',playing:'المباراة جارية',paused:'متوقف مؤقتًا',start:'ابدأ',resume:'متابعة',pause:'إيقاف مؤقت',reset:'إعادة البدء',
      won:'لقد فزت!',lost:'فاز الحاسوب.',again:'العب مجددًا',goal:'يفوز أول من يسجل 5 نقاط.'
    }
  };
  const params = new URLSearchParams(location.search);
  const lang = Object.hasOwn(copy,params.get('lang')) ? params.get('lang') : 'fr';
  const t = copy[lang];
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  root.dataset.embedded = String(params.get('embedded') === '1');
  document.title = t.title;
  let preference = params.get('theme');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const applyTheme = () => {
    root.dataset.theme = preference === 'dark' || (preference !== 'light' && systemTheme.matches) ? 'dark' : 'light';
    draw();
  };
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const toggle = document.getElementById('toggle');
  const reset = document.getElementById('reset');
  const status = document.getElementById('state');
  const score = document.getElementById('score');
  document.getElementById('title').textContent = t.title;
  document.getElementById('description').textContent = t.description;
  document.getElementById('player-label').textContent = t.player;
  document.getElementById('computer-label').textContent = t.computer;
  document.querySelector('.scoreboard').setAttribute('aria-label',t.score);
  document.getElementById('instructions').textContent = `${t.instructions} ${t.goal}`;
  canvas.setAttribute('aria-label',t.field);
  canvas.textContent = t.field;
  reset.textContent = t.reset;

  const W = 800, H = 440, PADDLE_H = 92, PADDLE_W = 12, BALL_R = 8;
  const state = {running:false,started:false,finished:false,frame:0,last:0,playerY:H/2,computerY:H/2,playerScore:0,computerScore:0,ball:{x:W/2,y:H/2,vx:300,vy:110},serveDelay:0};
  const keys = new Set();
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  let pointer = null;

  function draw(){
    if(!ctx)return;
    const styles = getComputedStyle(root);
    const color = name => styles.getPropertyValue(name).trim();
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle = color('--net');
    ctx.setLineDash([8,12]);ctx.lineWidth = 2;
    ctx.beginPath();ctx.moveTo(W/2,16);ctx.lineTo(W/2,H-16);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle = color('--accent');ctx.fillRect(28,state.playerY-PADDLE_H/2,PADDLE_W,PADDLE_H);
    ctx.fillStyle = color('--opponent');ctx.fillRect(W-28-PADDLE_W,state.computerY-PADDLE_H/2,PADDLE_W,PADDLE_H);
    ctx.fillStyle = color('--ink');ctx.beginPath();ctx.arc(state.ball.x,state.ball.y,BALL_R,0,Math.PI*2);ctx.fill();
  }
  function resize(){
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.max(1,Math.round(bounds.width*ratio));
    canvas.height = Math.max(1,Math.round(bounds.height*ratio));
    draw();
  }
  function updateUI(message){
    toggle.textContent = state.running ? t.pause : state.finished ? t.again : state.started ? t.resume : t.start;
    status.textContent = message || (state.running ? t.playing : state.started ? t.paused : t.ready);
    status.dataset.hidden = String(state.running);
    canvas.dataset.running = String(state.running);
    score.textContent = `${state.playerScore} — ${state.computerScore}`;
  }
  function clearControls(){
    keys.clear();
    if(pointer !== null && canvas.hasPointerCapture?.(pointer))canvas.releasePointerCapture(pointer);
    pointer = null;
  }
  function pause(){
    if(!state.running)return;
    state.running = false;
    cancelAnimationFrame(state.frame);
    state.frame = 0;state.last = 0;
    clearControls();updateUI();draw();
  }
  function serve(direction=1){
    state.ball = {x:W/2,y:H/2,vx:direction*300,vy:(Math.random()>.5 ? 1 : -1)*110};
    state.serveDelay = .65;
  }
  function restart(){
    pause();
    state.started = false;state.finished = false;
    state.playerScore = 0;state.computerScore = 0;
    state.playerY = H/2;state.computerY = H/2;
    serve();updateUI();draw();
  }
  function start(){
    if(state.running || document.hidden)return;
    if(state.finished)restart();
    state.started = true;state.running = true;state.last = 0;
    clearControls();updateUI();
    canvas.focus({preventScroll:true});
    state.frame = requestAnimationFrame(tick);
  }
  function addPoint(player){
    if(player)state.playerScore++;else state.computerScore++;
    if(state.playerScore>=5 || state.computerScore>=5){
      pause();state.finished = true;updateUI(player ? t.won : t.lost);
      return;
    }
    serve(player ? -1 : 1);updateUI();
  }
  function bounce(paddleY,direction){
    const offset = clamp((state.ball.y-paddleY)/(PADDLE_H/2),-1,1);
    const speed = Math.min(560,Math.hypot(state.ball.vx,state.ball.vy)*1.045);
    const angle = offset*Math.PI*.3;
    state.ball.vx = direction*speed*Math.cos(angle);
    state.ball.vy = speed*Math.sin(angle);
  }
  function step(dt){
    if(keys.has('ArrowUp') || keys.has('w'))state.playerY-=420*dt;
    if(keys.has('ArrowDown') || keys.has('s'))state.playerY+=420*dt;
    state.playerY=clamp(state.playerY,PADDLE_H/2,H-PADDLE_H/2);
    const target=state.ball.vx>0 ? state.ball.y : H/2;
    state.computerY+=clamp(target-state.computerY,-205*dt,205*dt);
    state.computerY=clamp(state.computerY,PADDLE_H/2,H-PADDLE_H/2);
    if(state.serveDelay>0){state.serveDelay=Math.max(0,state.serveDelay-dt);return;}
    const ball=state.ball,previousX=ball.x;
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    if(ball.y<BALL_R){ball.y=BALL_R;ball.vy=Math.abs(ball.vy);}
    if(ball.y>H-BALL_R){ball.y=H-BALL_R;ball.vy=-Math.abs(ball.vy);}
    const left=28+PADDLE_W+BALL_R,right=W-28-PADDLE_W-BALL_R;
    if(ball.vx<0 && previousX>=left && ball.x<=left && Math.abs(ball.y-state.playerY)<=PADDLE_H/2+BALL_R){
      ball.x=left;bounce(state.playerY,1);
    }
    if(ball.vx>0 && previousX<=right && ball.x>=right && Math.abs(ball.y-state.computerY)<=PADDLE_H/2+BALL_R){
      ball.x=right;bounce(state.computerY,-1);
    }
    if(ball.x<-BALL_R)addPoint(false);
    else if(ball.x>W+BALL_R)addPoint(true);
  }
  function tick(time){
    if(!state.running)return;
    const dt=state.last ? Math.min((time-state.last)/1000,.032) : 0;
    state.last=time;step(dt);draw();
    if(state.running)state.frame=requestAnimationFrame(tick);
  }

  // A pointer press moves focus away from the court before the click fires.
  // Keep its intended action so the automatic blur pause cannot restart it.
  let pointerToggleAction = null;
  toggle.addEventListener('pointerdown',()=>{pointerToggleAction=state.running ? 'pause' : 'start';});
  toggle.addEventListener('keydown',()=>{pointerToggleAction=null;});
  window.addEventListener('pointerup',()=>{setTimeout(()=>{pointerToggleAction=null;},0);});
  window.addEventListener('pointercancel',()=>{pointerToggleAction=null;});
  toggle.addEventListener('click',()=>{
    const action=pointerToggleAction || (state.running ? 'pause' : 'start');
    pointerToggleAction=null;
    if(action==='pause')pause();else start();
  });
  reset.addEventListener('click',restart);
  canvas.addEventListener('keydown',event=>{
    if(!state.running || document.activeElement!==canvas || event.ctrlKey || event.altKey || event.metaKey)return;
    if(event.key==='Escape'){pause();return;}
    const key=event.key.length===1 ? event.key.toLowerCase() : event.key;
    if(['ArrowUp','ArrowDown','w','s'].includes(key)){event.preventDefault();keys.add(key);}
  });
  canvas.addEventListener('keyup',event=>keys.delete(event.key.length===1 ? event.key.toLowerCase() : event.key));
  canvas.addEventListener('blur',pause);
  function movePointer(event){
    if(!state.running || (event.pointerType!=='mouse' && pointer!==event.pointerId))return;
    const bounds=canvas.getBoundingClientRect();
    if(bounds.height>0){state.playerY=clamp((event.clientY-bounds.top)*H/bounds.height,PADDLE_H/2,H-PADDLE_H/2);draw();}
  }
  canvas.addEventListener('pointerdown',event=>{
    if(!state.running || !event.isPrimary || (event.pointerType==='mouse' && event.button!==0))return;
    pointer=event.pointerId;canvas.focus({preventScroll:true});canvas.setPointerCapture?.(pointer);movePointer(event);
  });
  canvas.addEventListener('pointermove',movePointer);
  canvas.addEventListener('pointerup',()=>{clearControls();});
  canvas.addEventListener('pointercancel',()=>{clearControls();});
  window.addEventListener('blur',pause);
  window.addEventListener('pagehide',pause);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('message',event=>{
    if(window.parent===window || event.source!==window.parent || event.data?.type!=='horizon-demo-theme')return;
    if(event.data.theme!=='light' && event.data.theme!=='dark')return;
    preference=event.data.theme;applyTheme();
  });
  systemTheme.addEventListener?.('change',()=>{if(preference!=='light'&&preference!=='dark')applyTheme();});
  if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize',resize);
  applyTheme();resize();updateUI();
})();
