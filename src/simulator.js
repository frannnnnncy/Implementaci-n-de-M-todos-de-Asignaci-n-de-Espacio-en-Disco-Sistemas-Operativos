
'use strict';

/* ═══════════════════════════════════════════════════════════════
   PALETTE
═══════════════════════════════════════════════════════════════ */
const PALETTE=[
  '#00e5a0','#7b7eff','#ffb732','#c47bff','#ff4d6a','#00d4f5',
  '#4d9fff','#ff5ba8','#a8ff3d','#3dffcc','#ffdd3d','#3da8ff',
  '#ff7b3d','#3dfff7','#ccff3d','#ff3dcc','#3d88ff','#ff3d66'
];
function pcolor(i){return PALETTE[i%PALETTE.length]}

/* ═══════════════════════════════════════════════════════════════
   WELCOME / NAVIGATION
═══════════════════════════════════════════════════════════════ */
function launchSim(type,card){
  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('app-header').style.display='flex';
  document.getElementById('module-nav').style.display='flex';
  document.getElementById('app-body').style.display='flex';

  // Activate correct tab
  const tabMap={
    'memory':'modtab-memory',
    'cpu-exp':'modtab-cpu-exp',
    'cpu-noexp':'modtab-cpu-noexp',
    'compare':'modtab-compare',
    'disk':'modtab-disk'
  };
  const simMap={
    'memory':'MEMORIA',
    'cpu-exp':'CPU EXPULSIVA',
    'cpu-noexp':'CPU NO EXPULSIVA',
    'compare':'COMPARACIÓN',
    'disk':'ASIGNACIÓN DE DISCO'
  };
  const typeMap={
    'memory':'mem',
    'cpu-exp':'cpu-exp',
    'cpu-noexp':'cpu-noexp',
    'compare':'compare',
    'disk':'disk'
  };
  const btn=document.getElementById(tabMap[type]);
  switchModule(type,btn,simMap[type],typeMap[type]);
}

function goHome(){
  document.getElementById('welcome-screen').classList.remove('hidden');
  document.getElementById('app-header').style.display='none';
  document.getElementById('module-nav').style.display='none';
  document.getElementById('app-body').style.display='none';
}

/* ═══════════════════════════════════════════════════════════════
   MODULE SWITCHING
═══════════════════════════════════════════════════════════════ */
function switchModule(id,btn,simname,modtype){
  document.querySelectorAll('.module-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.mod-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('mod-'+id).classList.add('active');
  if(btn) btn.classList.add('active');
  if(id==='compare') compare.refresh();
  const badge=document.getElementById('hdr-simtype-badge');
  if(badge){badge.textContent=simname||'MEMORIA';badge.className='simtype-badge '+(modtype||'mem')}
}

/* ═══════════════════════════════════════════════════════════════
   STORED RESULTS
═══════════════════════════════════════════════════════════════ */
const storedResults={};

/* ═══════════════════════════════════════════════════════════════
   GLOBAL HEADER UPDATE
═══════════════════════════════════════════════════════════════ */
function updateGlobalHeader(opts){
  if(opts.simname!==undefined){const e=document.getElementById('hm-simname');if(e)e.textContent=opts.simname}
  if(opts.tr!==undefined){const e=document.getElementById('hm-tr');if(e)e.textContent=opts.tr}
  if(opts.te!==undefined){const e=document.getElementById('hm-te');if(e)e.textContent=opts.te}
  if(opts.procs!==undefined){const e=document.getElementById('hm-procs');if(e)e.textContent=opts.procs}
  if(opts.ram!==undefined){
    const ep=document.getElementById('hm-ram-pct');if(ep)ep.textContent=opts.ram;
    const eb=document.getElementById('hm-ram-bar');if(eb)eb.style.width=(parseFloat(opts.ram)||0)+'%';
    // color by usage
    if(eb){
      const v=parseFloat(opts.ram)||0;
      eb.style.background=v>85?'var(--red)':v>60?'var(--amber)':'var(--green)';
    }
  }
  if(opts.cpu!==undefined){
    const ep=document.getElementById('hm-cpu-pct');if(ep)ep.textContent=opts.cpu;
    const eb=document.getElementById('hm-cpu-bar');if(eb){eb.style.width=(parseFloat(opts.cpu)||0)+'%';eb.style.background='var(--blue)'}
  }
  if(opts.efrag!==undefined){const e=document.getElementById('hm-efrag');if(e)e.textContent=opts.efrag}
}

/* ═══════════════════════════════════════════════════════════════
   TOOLTIP
═══════════════════════════════════════════════════════════════ */
const tip=document.getElementById('tooltip');
function showTip(e,text){tip.style.display='block';tip.innerHTML=text;tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'}
function hideTip(){tip.style.display='none'}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULER STATE VISUALIZER
═══════════════════════════════════════════════════════════════ */
function buildSchedulerStates(prefix, procs, result){
  const el=document.getElementById(prefix+'-sch-states');
  if(!el) return;

  // Determine state of each process at the end
  // new -> ready -> running -> (waiting) -> done
  const states=procs.map((p,i)=>{
    const f=result.finish[i];
    const tl=p.arrival;
    return {id:p.id, state:'done', color:pcolor(i)};
  });

  // Build state lanes
  const lanes=[
    {key:'new', label:'Nuevo', icon:'🆕', cls:'state-new'},
    {key:'ready', label:'Listo', icon:'✅', cls:'state-ready'},
    {key:'running', label:'Ejecutando', icon:'▶', cls:'state-running'},
    {key:'waiting', label:'Bloqueado', icon:'⏳', cls:'state-waiting'},
    {key:'done', label:'Terminado', icon:'✓', cls:'state-done'},
  ];

  // For display purposes, sort procs into final states
  let html='<div style="overflow-x:auto"><div style="display:flex;gap:4px;align-items:flex-start;min-width:400px">';
  lanes.forEach((lane,li)=>{
    const procsInLane=lane.key==='done'?procs:[];
    html+=`<div style="display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:70px">
      <div class="sch-lane-title">${lane.icon} ${lane.label}</div>
      <div class="sch-lane-box ${lane.cls}" style="width:100%;min-height:40px">`;
    if(lane.key==='done'){
      procs.forEach((p,i)=>{
        html+=`<div class="sch-proc-chip state-done" style="background:${pcolor(i)}22;border:1px solid ${pcolor(i)};color:${pcolor(i)};margin:2px">${p.id}</div>`;
      });
    }
    html+=`</div></div>`;
    if(li<lanes.length-1) html+=`<div class="sch-arrow">→</div>`;
  });
  html+='</div></div>';

  // State timeline table (which tick each proc was in each state)
  html+=`<div style="margin-top:.75rem">
    <div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:.4rem;font-family:'JetBrains Mono',monospace">Secuencia de ejecución</div>
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:'JetBrains Mono',monospace">
        <thead><tr style="background:var(--surface3)">
          <th style="padding:4px 7px;text-align:left;color:var(--text3);font-size:10px;border-bottom:1px solid var(--border)">Proc</th>
          <th style="padding:4px 7px;text-align:center;color:var(--text3);font-size:10px;border-bottom:1px solid var(--border)">Llegada</th>
          <th style="padding:4px 7px;text-align:center;color:var(--text3);font-size:10px;border-bottom:1px solid var(--border)">Ráfaga</th>
          <th style="padding:4px 7px;text-align:center;color:var(--text3);font-size:10px;border-bottom:1px solid var(--border)">Fin</th>
          <th style="padding:4px 7px;text-align:center;color:var(--amber);font-size:10px;border-bottom:1px solid var(--border)">Estado</th>
        </tr></thead>
        <tbody>`;
  procs.forEach((p,i)=>{
    html+=`<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:4px 7px"><span style="color:${pcolor(i)};font-weight:700">${p.id}</span></td>
      <td style="padding:4px 7px;text-align:center">${p.arrival}</td>
      <td style="padding:4px 7px;text-align:center">${p.burst}</td>
      <td style="padding:4px 7px;text-align:center">${result.finish[i]}</td>
      <td style="padding:4px 7px;text-align:center"><span class="sbadge green">✓ FIN</span></td>
    </tr>`;
  });
  html+=`</tbody></table></div></div>`;

  el.innerHTML=html;
}

function buildStatesTimeline(prefix, procs, result){
  const el=document.getElementById(prefix+'-states-timeline');
  if(!el) return;
  // Show a visual tick-by-tick state for each process
  const maxT=result.total||20;
  const ticks=Math.min(maxT,80);

  let html=`<div style="font-size:12px;font-weight:700;color:var(--text2);margin-bottom:.6rem">Diagrama de estados por tick de tiempo</div>`;
  html+=`<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:10px;font-family:'JetBrains Mono',monospace">`;
  html+=`<thead><tr><th style="padding:3px 8px;text-align:left;color:var(--text3);border:1px solid var(--border);background:var(--surface3)">Proceso</th>`;
  for(let t=0;t<ticks;t++) html+=`<th style="padding:2px 3px;text-align:center;color:var(--text3);border:1px solid var(--border);background:var(--surface3);min-width:18px">${t}</th>`;
  html+=`</tr></thead><tbody>`;

  procs.forEach((p,i)=>{
    html+=`<tr><td style="padding:3px 8px;font-weight:700;color:${pcolor(i)};border:1px solid var(--border);white-space:nowrap">${p.id}</td>`;
    for(let t=0;t<ticks;t++){
      const running=result.timeline.some(seg=>seg.proc===i&&t>=seg.start&&t<seg.end);
      const arrived=t>=p.arrival;
      const done=t>=result.finish[i];
      let bg='',label='',title='';
      if(done && t>=result.finish[i]){bg='rgba(148,163,184,.12)';label='—';title='Terminado'}
      else if(running){bg='rgba(255,183,50,.25)';label='▶';title='Ejecutando'}
      else if(arrived){bg='rgba(0,229,160,.15)';label='R';title='Listo'}
      else{bg='transparent';label='';title='No llegado'}
      html+=`<td style="padding:2px 3px;text-align:center;border:1px solid var(--border);background:${bg};font-size:9px" title="${title} t=${t}">${label}</td>`;
    }
    html+=`</tr>`;
  });
  html+=`</tbody></table></div>`;
  html+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:.6rem;font-size:11px;color:var(--text3)">
    <span>▶ <span style="color:var(--amber)">Ejecutando</span></span>
    <span>R <span style="color:var(--green)">Listo</span></span>
    <span>— Terminado</span>
  </div>`;
  el.innerHTML=html;
}

/* ═══════════════════════════════════════════════════════════════
   GANTT DRAWING
═══════════════════════════════════════════════════════════════ */
function drawGanttCanvas(canvasId,timeline,procs,upTo){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const container=canvas.parentElement;
  const W=Math.max(container.clientWidth-2,400);
  const maxT=timeline.length?Math.max(...timeline.map(x=>x.end)):1;
  const ROW=30,PAD_T=26,PAD_L=56,PAD_R=16,TICK_H=20;
  const nRows=procs.length;
  const H=PAD_T+nRows*(ROW+5)+TICK_H+18;
  const usableW=W-PAD_L-PAD_R;
  const CELL=usableW/maxT;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);

  // grid
  for(let t=0;t<=maxT;t++){
    const x=PAD_L+t*CELL;
    ctx.strokeStyle='rgba(26,37,64,.7)';ctx.lineWidth=.5;
    ctx.beginPath();ctx.moveTo(x,PAD_T);ctx.lineTo(x,H-TICK_H-4);ctx.stroke();
    const skip=Math.max(1,Math.ceil(maxT/30));
    if(t%skip===0||t===maxT){
      ctx.fillStyle='#334466';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center';
      ctx.fillText(t,x,H-4);
    }
  }

  procs.forEach((p,i)=>{
    const y=PAD_T+i*(ROW+5);
    ctx.fillStyle='rgba(11,15,26,.7)';ctx.fillRect(PAD_L,y,usableW,ROW);
    ctx.fillStyle=pcolor(i);ctx.font='bold 12px JetBrains Mono,monospace';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(typeof p==='string'?p:p.id,PAD_L-5,y+ROW/2);
  });

  timeline.forEach((seg,si)=>{
    if(upTo!==undefined&&si>=upTo)return;
    const i=seg.proc;
    if(i<0||i>=procs.length)return;
    const y=PAD_T+i*(ROW+5);
    const x0=PAD_L+seg.start*CELL;
    const w=(seg.end-seg.start)*CELL;
    const col=pcolor(i);
    ctx.fillStyle=col+'33';ctx.fillRect(x0,y,w,ROW);
    ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.strokeRect(x0+.5,y+.5,w-1,ROW-1);
    if(w>22){
      ctx.fillStyle=col;ctx.font='bold 11px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      const label=typeof procs[i]==='string'?procs[i]:procs[i].id;
      ctx.fillText(label,x0+w/2,y+ROW/2);
    }
    ctx.fillStyle=col+'cc';ctx.font='8px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(seg.start,x0,y-1);
    if(si===upTo-1||si===timeline.length-1)ctx.fillText(seg.end,x0+w,y-1);
  });

  if(upTo!==undefined&&upTo<timeline.length){
    const seg=timeline[upTo];
    const x=PAD_L+seg.start*CELL;
    ctx.strokeStyle='rgba(0,212,245,.6)';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(x,PAD_T-4);ctx.lineTo(x,H-TICK_H-4);ctx.stroke();
    ctx.setLineDash([]);
  }
}

/* ═══════════════════════════════════════════════════════════════
   RAM CANVAS
═══════════════════════════════════════════════════════════════ */
function drawRAMCanvas(canvasId,blocks,totalRAM,snapIndex,totalSnaps){
  const canvas=document.getElementById(canvasId);
  if(!canvas)return;
  const W=canvas.parentElement.clientWidth-2||600;
  canvas.width=W;canvas.height=440;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,440);

  const PAD=22,BAR_H=90,BAR_Y=65,LABEL_Y=175;
  const usableW=W-PAD*2;
  const scale=usableW/totalRAM;

  ctx.fillStyle='#4a5e7a';ctx.font='bold 12px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText(`Mapa de Memoria — t=${snapIndex} / ${totalSnaps-1}`,PAD,12);
  ctx.textAlign='right';
  ctx.fillText(`Total: ${totalRAM}KB`,W-PAD,12);

  [0,Math.floor(totalRAM/4),Math.floor(totalRAM/2),Math.floor(totalRAM*3/4),totalRAM].forEach(addr=>{
    const x=PAD+addr*scale;
    ctx.strokeStyle='#1a2540';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,BAR_Y-10);ctx.lineTo(x,BAR_Y+BAR_H+10);ctx.stroke();
    ctx.fillStyle='#334466';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(addr>=1024?(addr/1024).toFixed(1)+'M':addr+'K',x,BAR_Y+BAR_H+14);
  });

  blocks.forEach((b,idx)=>{
    const x=PAD+b.start*scale;
    const w=b.size*scale;
    let col,labelCol;
    if(b.type==='os'){col='#4d9fff';labelCol='#4d9fff';}
    else if(b.type==='free'){col='#1c2d48';labelCol='#3a5578';}
    else{col=pcolor(b.procIdx!==undefined?b.procIdx:idx);labelCol=col;}

    ctx.fillStyle=col+'2a';ctx.fillRect(x,BAR_Y,w,BAR_H);
    ctx.strokeStyle=col;ctx.lineWidth=b.type==='free'?.5:1.5;ctx.strokeRect(x+.5,BAR_Y+.5,w-1,BAR_H-1);

    if(w>30){
      ctx.fillStyle=labelCol;
      ctx.font=`bold ${Math.min(12,w*.13)}px JetBrains Mono,monospace`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      const label=b.type==='os'?'S.O.':b.type==='free'?'libre':(b.pid||'?');
      ctx.fillText(label,x+w/2,BAR_Y+BAR_H/2-9);
      ctx.font=`${Math.min(10,w*.1)}px JetBrains Mono,monospace`;
      ctx.fillStyle=col+'99';
      const szLabel=b.size>=1024?(b.size/1024).toFixed(1)+'MB':b.size+'KB';
      ctx.fillText(szLabel,x+w/2,BAR_Y+BAR_H/2+9);
    }

    if(b.internalFrag>0&&w>22){
      const fw=b.internalFrag*scale;
      ctx.fillStyle='rgba(181,123,255,.25)';ctx.fillRect(x+w-fw,BAR_Y,fw,BAR_H);
      ctx.strokeStyle='#b57bff';ctx.lineWidth=.5;ctx.setLineDash([2,2]);
      ctx.strokeRect(x+w-fw+.5,BAR_Y+.5,fw-1,BAR_H-1);ctx.setLineDash([]);
    }

    if(w>22){
      ctx.fillStyle='#334466';ctx.font='8px JetBrains Mono,monospace';
      ctx.textAlign='center';ctx.textBaseline='top';
      const addrLabel=b.start>=1024?(b.start/1024).toFixed(1)+'M':b.start+'K';
      ctx.fillText(addrLabel,x+w/2,LABEL_Y);
    }
  });

  const legend=[{col:'#4d9fff',label:'S.O.'},{col:'#00e5a0',label:'Proceso'},{col:'#b57bff',label:'Frag.Int.'},{col:'#1c2d48',label:'Libre'}];
  let lx=PAD;const LY=230;
  ctx.font='10px Space Grotesk,sans-serif';ctx.textBaseline='middle';
  legend.forEach(({col,label})=>{
    ctx.fillStyle=col;ctx.fillRect(lx,LY-6,13,12);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.strokeRect(lx,LY-6,13,12);
    ctx.fillStyle='#5a6e8e';ctx.textAlign='left';ctx.fillText(label,lx+17,LY);lx+=65;
  });

  const usedKB=blocks.filter(b=>b.type==='proc').reduce((s,b)=>s+b.size,0);
  const freeKB=blocks.filter(b=>b.type==='free').reduce((s,b)=>s+b.size,0);
  const osKB=blocks.filter(b=>b.type==='os').reduce((s,b)=>s+b.size,0);
  const ifragKB=blocks.filter(b=>b.internalFrag).reduce((s,b)=>s+(b.internalFrag||0),0);

  const stats=[
    {label:'S.O.',val:osKB>=1024?(osKB/1024).toFixed(1)+'MB':osKB+'KB',col:'#4d9fff'},
    {label:'Usado',val:usedKB>=1024?(usedKB/1024).toFixed(1)+'MB':usedKB+'KB',col:'#00e5a0'},
    {label:'Libre',val:freeKB>=1024?(freeKB/1024).toFixed(1)+'MB':freeKB+'KB',col:'#3a5578'},
    {label:'Frag.Int.',val:ifragKB+'KB',col:'#b57bff'},
    {label:'Uso%',val:Math.round((usedKB+osKB)/totalRAM*100)+'%',col:'#00d4f5'},
  ];
  let sx=PAD;const SY=270;
  stats.forEach(({label,val,col})=>{
    ctx.fillStyle='#111828';ctx.strokeStyle=col;ctx.lineWidth=1;
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(sx,SY,95,52,6);else ctx.rect(sx,SY,95,52);
    ctx.fill();ctx.stroke();
    ctx.fillStyle='#334466';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(label.toUpperCase(),sx+8,SY+8);
    ctx.fillStyle=col;ctx.font='bold 16px JetBrains Mono,monospace';ctx.textBaseline='middle';
    ctx.fillText(val,sx+8,SY+34);
    sx+=105;
  });

  // Progress bar at bottom
  const barW=W-PAD*2;const barY=345;const barH=14;
  ctx.fillStyle='#0c1220';ctx.strokeStyle='#1a2540';ctx.lineWidth=1;
  ctx.fillRect(PAD,barY,barW,barH);ctx.strokeRect(PAD,barY,barW,barH);
  ctx.fillStyle='#4d9fff';ctx.fillRect(PAD,barY,osKB/totalRAM*barW,barH);
  const u0=PAD+osKB/totalRAM*barW;
  ctx.fillStyle='#00e5a0';ctx.fillRect(u0,barY,usedKB/totalRAM*barW,barH);
  const i0=u0+usedKB/totalRAM*barW;
  ctx.fillStyle='#b57bff';ctx.fillRect(i0,barY,ifragKB/totalRAM*barW,barH);
  ctx.fillStyle='#5a6e8e';ctx.font='10px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Distribución RAM →',PAD,barY+barH+5);
}

/* ═══════════════════════════════════════════════════════════════
   PARTICIONES MÚLTIPLES
═══════════════════════════════════════════════════════════════ */
function drawParticionesCanvas(canvasId,blocks,totalRAM,snapT,activeProc){
  const canvas=document.getElementById(canvasId);if(!canvas)return;
  const container=canvas.parentElement;
  const W=Math.max(container.clientWidth-2,500);
  const MEM_X=145,MEM_W=190,MEM_Y=45,ADDR_X=125;
  const REG_X=MEM_X+MEM_W+75,REG_W=115,REG_H=30;
  const ARROW_GAP=8;
  const totalH=Math.max(520,MEM_Y+30+blocks.length*65+65);
  canvas.width=W;canvas.height=totalH;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,W,totalH);
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,totalH);

  ctx.fillStyle='#5a6e8e';ctx.font='12px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText(`Particiones Múltiples — t = ${snapT}`,14,14);
  ctx.textAlign='right';ctx.fillText(`RAM: ${totalRAM>=1024?(totalRAM/1024).toFixed(1)+'MB':totalRAM+'KB'}`,W-14,14);

  const availH=totalH-MEM_Y-55;
  const scale=availH/totalRAM;
  ctx.strokeStyle='#223060';ctx.lineWidth=1.5;ctx.strokeRect(MEM_X,MEM_Y,MEM_W,totalRAM*scale);

  ctx.fillStyle='#334466';ctx.font='11px JetBrains Mono,monospace';ctx.textAlign='right';ctx.textBaseline='middle';
  ctx.fillText('0',ADDR_X-8,MEM_Y);

  let regPairs=[];
  blocks.forEach((b,idx)=>{
    const by=MEM_Y+b.start*scale;
    const bh=Math.max(b.size*scale,2);
    let col,labelCol,label;
    if(b.type==='os'){col='#4d9fff';labelCol='#4d9fff';label='S.O.';}
    else if(b.type==='free'){col='#1c2d48';labelCol='#3a5578';label='Libre';}
    else{col=pcolor(b.procIdx!==undefined?b.procIdx:idx);labelCol=col;label=b.pid||'?';}

    ctx.fillStyle=col+(b.type==='free'?'18':'28');ctx.fillRect(MEM_X,by,MEM_W,bh);
    ctx.strokeStyle=col;ctx.lineWidth=b.type==='free'?0.5:1.5;ctx.strokeRect(MEM_X+0.5,by+0.5,MEM_W-1,bh-1);

    if(b.internalFrag>0){
      const ifh=b.internalFrag*scale;
      ctx.fillStyle='rgba(181,123,255,0.22)';ctx.fillRect(MEM_X,by+bh-ifh,MEM_W,ifh);
      ctx.strokeStyle='#b57bff';ctx.lineWidth=0.5;ctx.setLineDash([3,3]);ctx.strokeRect(MEM_X+0.5,by+bh-ifh+0.5,MEM_W-1,ifh-1);ctx.setLineDash([]);
    }

    if(bh>15){
      ctx.fillStyle=labelCol;ctx.font=`bold ${Math.min(14,bh*0.22)}px Space Grotesk,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(label,MEM_X+MEM_W/2,by+bh/2-(bh>30?9:0));
      if(bh>30){
        ctx.font=`${Math.min(11,bh*0.16)}px JetBrains Mono,monospace`;ctx.fillStyle=col+'aa';
        const szLabel=b.size>=1024?(b.size/1024).toFixed(1)+'MB':b.size+'KB';
        ctx.fillText(szLabel,MEM_X+MEM_W/2,by+bh/2+9);
      }
    }

    ctx.strokeStyle='#1a2540';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(MEM_X-14,by);ctx.lineTo(MEM_X,by);ctx.stroke();
    ctx.fillStyle='#5a6e8e';ctx.font='11px JetBrains Mono,monospace';ctx.textAlign='right';ctx.textBaseline='middle';
    const addrLabel=b.start>=1024?(b.start/1024).toFixed(1)+'M':b.start;
    ctx.fillText(addrLabel,ADDR_X-8,by);

    if(b.type==='proc') regPairs.push({baseY:by,limitY:by+bh,baseAddr:b.start,limitAddr:b.start+b.size,label,col,ifrag:b.internalFrag||0});
  });

  ctx.strokeStyle='#1a2540';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(MEM_X-14,MEM_Y+totalRAM*scale);ctx.lineTo(MEM_X,MEM_Y+totalRAM*scale);ctx.stroke();
  ctx.fillStyle='#5a6e8e';ctx.font='11px JetBrains Mono,monospace';ctx.textAlign='right';ctx.textBaseline='middle';
  const bottomLabel=totalRAM>=1024?(totalRAM/1024).toFixed(1)+'M':totalRAM;
  ctx.fillText(bottomLabel,ADDR_X-8,MEM_Y+totalRAM*scale);

  const showAll=regPairs.length<=5;
  const toShow=showAll?regPairs:regPairs.slice(0,5);
  toShow.forEach((rp)=>{
    const midY=(rp.baseY+rp.limitY)/2;
    const regY_base=midY-REG_H-5;
    const regY_lim=midY+5;
    ctx.fillStyle='#111828';ctx.strokeStyle=rp.col;ctx.lineWidth=1.2;
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(REG_X,regY_base,REG_W,REG_H,4);else ctx.rect(REG_X,regY_base,REG_W,REG_H);
    ctx.fill();ctx.stroke();
    ctx.fillStyle=rp.col;ctx.font='bold 12px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(rp.baseAddr,REG_X+REG_W/2,regY_base+REG_H/2);
    ctx.fillStyle='#334466';ctx.font='10px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText('reg. base',REG_X,regY_base-13);
    ctx.fillStyle='#111828';ctx.strokeStyle=rp.col+'bb';ctx.lineWidth=1;
    ctx.beginPath();if(ctx.roundRect)ctx.roundRect(REG_X,regY_lim,REG_W,REG_H,4);else ctx.rect(REG_X,regY_lim,REG_W,REG_H);
    ctx.fill();ctx.stroke();
    ctx.fillStyle=rp.col+'cc';ctx.font='bold 12px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(rp.limitAddr,REG_X+REG_W/2,regY_lim+REG_H/2);
    ctx.fillStyle='#334466';ctx.font='10px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText('reg. límite',REG_X,regY_lim+REG_H+3);
    const arrowTargetX=MEM_X+MEM_W;
    const arrowSourceX=REG_X-ARROW_GAP;
    ctx.strokeStyle=rp.col+'aa';ctx.lineWidth=1.5;ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(arrowSourceX,regY_base+REG_H/2);ctx.lineTo(arrowTargetX+4,rp.baseY);ctx.stroke();
    const ax=arrowTargetX+4,ay=rp.baseY;ctx.fillStyle=rp.col+'aa';
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-8,ay-4);ctx.lineTo(ax-8,ay+4);ctx.closePath();ctx.fill();
    ctx.strokeStyle=rp.col+'66';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(arrowSourceX,regY_lim+REG_H/2);ctx.lineTo(arrowTargetX+4,rp.limitY);ctx.stroke();
    const lx2=arrowTargetX+4,ly2=rp.limitY;ctx.fillStyle=rp.col+'66';
    ctx.beginPath();ctx.moveTo(lx2,ly2);ctx.lineTo(lx2-8,ly2-4);ctx.lineTo(lx2-8,ly2+4);ctx.closePath();ctx.fill();
    if(rp.ifrag>0){ctx.fillStyle='#b57bff';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('frag.int='+rp.ifrag+'KB',REG_X,regY_lim+REG_H+20);}
  });

  ctx.fillStyle='#5a6e8e';ctx.font='bold 11px Space Grotesk,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('Memoria',MEM_X+MEM_W/2,MEM_Y-5);
  if(REG_X+REG_W<W){ctx.textAlign='left';ctx.fillText('Registros CPU',REG_X,MEM_Y-5);}
}

/* ═══════════════════════════════════════════════════════════════
   BUDDY CANVAS
═══════════════════════════════════════════════════════════════ */
function drawBuddyCanvas(snap,procs,totalRAM,osSize){
  const canvas=document.getElementById('buddyCanvas');
  if(!canvas||!snap.buddyBlocks)return;
  canvas.style.display='block';
  const W=canvas.parentElement.clientWidth-2||600;
  canvas.width=W;canvas.height=210;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#0a0f1e';ctx.fillRect(0,0,W,210);
  const PAD=22,Y=55,H2=85;
  const budgetW=W-PAD*2;
  const buddyTotal=snap.buddyBlocks.reduce((s,b)=>s+b.size,0)||1;
  const scale=budgetW/buddyTotal;
  ctx.fillStyle='#4d9fff33';ctx.fillRect(PAD-22,Y,osSize*scale,H2);
  ctx.strokeStyle='#4d9fff';ctx.lineWidth=1;ctx.strokeRect(PAD-22+.5,Y+.5,osSize*scale-1,H2-1);
  ctx.fillStyle='#4d9fff';ctx.font='11px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('S.O.',PAD-22+osSize*scale/2,Y+H2/2);
  snap.buddyBlocks.forEach(b=>{
    const x=PAD+b.start*scale-osSize*scale;
    const w=b.size*scale;
    const col=b.free?'#1c2d48':'#00e5a0';
    ctx.fillStyle=col+'33';ctx.fillRect(x,Y,w,H2);
    ctx.strokeStyle=col;ctx.lineWidth=1;ctx.strokeRect(x+.5,Y+.5,w-1,H2-1);
    if(w>30){
      ctx.fillStyle=b.free?'#3a5578':'#00e5a0';
      ctx.font=`${Math.min(11,w*.12)}px JetBrains Mono,monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
      const label=b.free?'libre':(procs[b.procIdx]?procs[b.procIdx].id:'?');
      ctx.fillText(label,x+w/2,Y+H2/2-9);
      ctx.font='9px JetBrains Mono,monospace';ctx.fillStyle=col+'99';
      ctx.fillText(b.size+'KB',x+w/2,Y+H2/2+9);
    }
    ctx.fillStyle='#334466';ctx.font='9px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(b.start+'K',x+w/2,Y+H2+7);
  });
  ctx.fillStyle='#5a6e8e';ctx.font='11px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Árbol Buddy System — t='+snap.t,PAD,12);
}

/* ═══════════════════════════════════════════════════════════════
   MEMORY MODULE
═══════════════════════════════════════════════════════════════ */
const mem=(()=>{
  let processes=[
    {id:'P1',arrival:0,burst:5,mem:300,priority:3},
    {id:'P2',arrival:1,burst:3,mem:600,priority:1},
    {id:'P3',arrival:2,burst:7,mem:450,priority:2},
    {id:'P4',arrival:3,burst:4,mem:200,priority:4},
    {id:'P5',arrival:4,burst:6,mem:800,priority:2},
    {id:'P6',arrival:5,burst:2,mem:350,priority:5},
    {id:'P7',arrival:6,burst:8,mem:550,priority:3},
    {id:'P8',arrival:7,burst:5,mem:400,priority:1},
  ];
  let algo='FF',mode='dynamic',simResult=null,currentTime=0,animTimer=null,procId=8;

  function renderTable(){
    const tb=document.getElementById('mem-proc-tbody');
    tb.innerHTML=processes.map((p,i)=>`<tr>
      <td><span class="color-dot" style="background:${pcolor(i)}"></span></td>
      <td><input value="${p.id}" oninput="mem.processes[${i}].id=this.value" style="width:44px"></td>
      <td><input type="number" value="${p.arrival}" min="0" oninput="mem.processes[${i}].arrival=+this.value" style="width:42px"></td>
      <td><input type="number" value="${p.burst}" min="1" oninput="mem.processes[${i}].burst=+this.value" style="width:42px"></td>
      <td><input type="number" value="${p.mem}" min="1" oninput="mem.processes[${i}].mem=+this.value" style="width:56px"></td>
      <td><input type="number" value="${p.priority||1}" min="1" max="10" oninput="mem.processes[${i}].priority=+this.value" style="width:42px"></td>
      <td><button class="btn-del" onclick="mem.delProc(${i})">✕</button></td>
    </tr>`).join('');
    document.getElementById('mem-proc-count').textContent=processes.length+' proceso(s)';
  }

  function selectAlgo(a,el){
    algo=a;
    document.querySelectorAll('.algo-card').forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('buddy-info').classList.toggle('show',a==='BD');
  }

  function setMode(m,btn){
    mode=m;
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('fixed-field').style.display=m==='fixed'?'block':'none';
  }

  function addProcess(){processes.push({id:'P'+(++procId),arrival:0,burst:1,mem:128,priority:3});renderTable();}
  function delProc(i){processes.splice(i,1);renderTable()}
  function clearAll(){processes=[];procId=0;renderTable();simResult=null;}

  function loadDefault(){
    processes=[
      {id:'P1',arrival:0,burst:5,mem:300,priority:3},
      {id:'P2',arrival:1,burst:3,mem:600,priority:1},
      {id:'P3',arrival:2,burst:7,mem:450,priority:2},
      {id:'P4',arrival:3,burst:4,mem:200,priority:4},
      {id:'P5',arrival:4,burst:6,mem:800,priority:2},
      {id:'P6',arrival:5,burst:2,mem:350,priority:5},
      {id:'P7',arrival:6,burst:8,mem:550,priority:3},
      {id:'P8',arrival:7,burst:5,mem:400,priority:1},
    ];
    procId=8;renderTable();
  }

  function loadCSV(inp){
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      const lines=e.target.result.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
      const parsed=[];
      lines.forEach((line,idx)=>{
        if(idx===0&&/[a-zA-Z]{2,}/.test(line))return;
        const p=line.split(/[,;\t]+/).map(s=>s.trim());
        if(p.length<4)return;
        parsed.push({id:p[0]||'P'+idx,arrival:+p[1]||0,burst:Math.max(1,+p[2]||1),mem:Math.max(1,+p[3]||64),priority:+p[4]||1});
      });
      if(parsed.length){processes=parsed;procId=parsed.length;renderTable();}
      inp.value='';
    };
    r.readAsText(f);
  }

  function run(){
    if(!processes.length){alert('Agrega al menos un proceso.');return;}
    const totalRAM=+document.getElementById('mem-ram').value;
    const osSize=+document.getElementById('mem-os').value;
    const fixedParts=document.getElementById('fixed-parts').value.split(',').map(Number).filter(n=>n>0);
    const procs=processes.map(p=>({...p,arrival:+p.arrival,burst:+p.burst,mem:+p.mem,priority:+p.priority||1}));
    simResult=simulateMemory(procs,algo,totalRAM,osSize,mode,fixedParts);
    simResult.totalRAM=totalRAM;simResult.osSize=osSize;simResult.procs=procs;

    const n=procs.length;
    const _tr=(simResult.startTime.map((s,i)=>simResult.finishTime[i]-procs[i].arrival).reduce((a,b)=>a+b,0)/n).toFixed(2);
    const _te=(simResult.startTime.map((s,i)=>Math.max(0,simResult.finishTime[i]-procs[i].arrival-procs[i].burst)).reduce((a,b)=>a+b,0)/n).toFixed(2);
    const _lastSt=simResult.snapshots[simResult.snapshots.length-1].stats;

    storedResults['memory_'+algo]={
      algo:'Memoria: '+algo,
      avgTR:_tr,avgTE:_te,n:procs.length,color:pcolor(0)
    };

    currentTime=0;
    document.getElementById('mem-time-slider').max=simResult.snapshots.length-1;
    document.getElementById('mem-time-slider').value=0;

    updateMetrics(simResult,algo,totalRAM);
    updateGlobalHeader({simname:{FF:'1° Ajuste',BF:'Mejor Ajuste',WF:'Peor Ajuste',BD:'Los Gemelos'}[algo]||algo,tr:_tr,te:_te,procs:n,ram:_lastSt.pct+'',cpu:'—',efrag:_lastSt.efrag+'KB'});

    buildSummaryTable(procs,simResult);
    buildLog(simResult.log);

    document.getElementById('mem-empty-fragdiag').style.display='none';
    document.getElementById('mem-fragdiag-content').style.display='block';
    document.getElementById('fragdiag-slider').max=simResult.snapshots.length-1;
    document.getElementById('fragdiag-slider').value=0;
    drawFragDiag(0);

    document.getElementById('ramCanvas').style.display='block';
    document.getElementById('mem-empty-ram').style.display='none';
    document.getElementById('mem-gantt-wrap').style.display='block';
    document.getElementById('mem-empty-gantt').style.display='none';
    document.getElementById('mem-tbl-content').style.display='block';
    document.getElementById('mem-empty-table').style.display='none';
    document.getElementById('mem-legend').style.display='flex';
    document.getElementById('mem-empty-particiones').style.display='none';
    document.getElementById('mem-particiones-content').style.display='block';

    buildLegend(procs);
    requestAnimationFrame(()=>{
      drawRAMCanvas('ramCanvas',simResult.snapshots[0].blocks,totalRAM,0,simResult.snapshots.length);
      drawMemGantt(simResult.cpuTimeline,procs);
      drawParticionesCanvas('partCanvas',simResult.snapshots[0].blocks,totalRAM,0);
    });
  }

  function simulateMemory(procs,algo,totalRAM,osSize,memMode,fixedParts){
    const log=[];const snapshots=[];
    if(algo==='BD') return simulateBuddy(procs,totalRAM,osSize,log,snapshots,memMode);
    let blocks=[];
    blocks.push({start:0,size:osSize,type:'os',pid:'OS'});
    if(memMode==='fixed'&&fixedParts&&fixedParts.length){
      let cur=osSize;
      for(const ps of fixedParts){
        if(cur+ps<=totalRAM){blocks.push({start:cur,size:ps,type:'free',pid:null});cur+=ps;}
      }
      if(cur<totalRAM) blocks.push({start:cur,size:totalRAM-cur,type:'free',pid:null});
    } else {
      blocks.push({start:osSize,size:totalRAM-osSize,type:'free',pid:null});
    }
    const maxT=Math.max(...procs.map(p=>p.arrival+p.burst))+3;
    const allocated=new Array(procs.length).fill(false);
    const finished=new Array(procs.length).fill(false);
    const startTime=new Array(procs.length).fill(-1);
    const finishTime=new Array(procs.length).fill(-1);
    const internalFrag=new Array(procs.length).fill(0);
    const waitQueue=[];
    const cpuResult=simulateSRT_mem(procs);
    log.push({type:'header',msg:`════ SIMULACIÓN [${algo}] ════ RAM:${totalRAM}KB | OS:${osSize}KB | Modo:${memMode}`});

    for(let t=0;t<maxT;t++){
      procs.forEach((p,i)=>{
        if(finished[i]||allocated[i])return;
        if(p.arrival<=t){
          const r=allocate(blocks,p.mem,i,algo,memMode);
          if(r.success){allocated[i]=true;internalFrag[i]=r.internalFrag||0;log.push({type:'alloc',msg:`t=${t}: [ALLOC] ${p.id} → ${p.mem}KB@${r.start}KB${internalFrag[i]>0?' frag.int='+internalFrag[i]+'KB':''}`});}
          else{if(!waitQueue.includes(i)){waitQueue.push(i);log.push({type:'wait',msg:`t=${t}: [ESPERA] ${p.id} necesita ${p.mem}KB`});}}
        }
      });
      procs.forEach((p,i)=>{
        if(!allocated[i]||finished[i])return;
        if(startTime[i]===-1)startTime[i]=t;
        if(t>=p.arrival+p.burst){
          finished[i]=true;finishTime[i]=t;freeBlock(blocks,i);mergeBlocks(blocks);
          log.push({type:'free',msg:`t=${t}: [FREE]  ${p.id} → ${p.mem}KB liberados`});
          const sw=[...waitQueue];waitQueue.length=0;
          for(const wi of sw){
            if(finished[wi]||allocated[wi])continue;
            const r=allocate(blocks,procs[wi].mem,wi,algo,memMode);
            if(r.success){allocated[wi]=true;internalFrag[wi]=r.internalFrag||0;log.push({type:'alloc',msg:`t=${t}: [ALLOC] ${procs[wi].id}(espera) → ${procs[wi].mem}KB@${r.start}KB`});}
            else waitQueue.push(wi);
          }
        }
      });
      const stats=calcStats(blocks,osSize,totalRAM,internalFrag);
      snapshots.push({t,blocks:blocks.map(b=>({...b})),stats});
      updateFragBar(stats,osSize,totalRAM);
    }
    procs.forEach((p,i)=>{if(finishTime[i]===-1)finishTime[i]=maxT;if(startTime[i]===-1)startTime[i]=p.arrival;});
    log.push({type:'header',msg:`════ FIN SIMULACIÓN ════`});
    return{snapshots,log,startTime,finishTime,internalFrag,cpuTimeline:cpuResult.timeline,cpuFinish:cpuResult.finish,cpuSteps:cpuResult.steps,maxT};
  }

  function allocate(blocks,mem,procIdx,algo,memMode){
    const free=blocks.filter(b=>b.type==='free'&&b.size>=mem);
    if(!free.length)return{success:false};
    let chosen;
    if(algo==='FF')chosen=free[0];
    else if(algo==='BF')chosen=free.reduce((a,b)=>b.size<a.size?b:a);
    else if(algo==='WF')chosen=free.reduce((a,b)=>b.size>a.size?b:a);
    const idx=blocks.indexOf(chosen);
    const rem=chosen.size-mem;
    const ifrag=memMode==='fixed'?rem:0;
    const allocSize=memMode==='fixed'?chosen.size:mem;
    blocks[idx]={start:chosen.start,size:allocSize,type:'proc',pid:'P'+(procIdx+1),procIdx,internalFrag:ifrag};
    if(rem>0&&memMode==='dynamic') blocks.splice(idx+1,0,{start:chosen.start+mem,size:rem,type:'free',pid:null});
    return{success:true,start:chosen.start,internalFrag:ifrag};
  }

  function freeBlock(blocks,procIdx){blocks.forEach(b=>{if(b.procIdx===procIdx){b.type='free';b.pid=null;b.procIdx=undefined;b.internalFrag=0;}})}

  function mergeBlocks(blocks){
    let merged=true;
    while(merged){merged=false;for(let i=0;i<blocks.length-1;i++){if(blocks[i].type==='free'&&blocks[i+1].type==='free'){blocks[i].size+=blocks[i+1].size;blocks.splice(i+1,1);merged=true;break;}}}
  }

  function calcStats(blocks,osSize,totalRAM,internalFrag){
    const usedByProcs=blocks.filter(b=>b.type==='proc').reduce((s,b)=>s+b.size,0);
    const totalFree=blocks.filter(b=>b.type==='free').reduce((s,b)=>s+b.size,0);
    const totalIF=(internalFrag||[]).reduce((s,v)=>s+v,0);
    const pct=Math.round((usedByProcs+osSize)/totalRAM*100);
    const freeBlocks=blocks.filter(b=>b.type==='free');
    const efrag=freeBlocks.length>1?totalFree:0;
    return{usedByProcs,totalFree,totalIF,pct,efrag,freeBlockCount:freeBlocks.length};
  }

  function simulateSRT_mem(procs){
    const n=procs.length;const rem=procs.map(p=>p.burst);
    const finish=new Array(n).fill(0);const timeline=[];const steps=[];
    let t=0,done=0;
    const maxT=procs.reduce((s,p)=>s+p.burst,0)+Math.max(...procs.map(p=>p.arrival))+5;
    while(done<n&&t<maxT){
      const ready=procs.map((p,i)=>({i,p})).filter(({i,p})=>p.arrival<=t&&rem[i]>0);
      if(!ready.length){steps.push({type:'tick',msg:`t=${t}: [IDLE]`});t++;continue;}
      const{i}=ready.reduce((a,b)=>rem[b.i]<rem[a.i]?b:a);
      rem[i]--;t++;
      if(timeline.length&&timeline[timeline.length-1].proc===i)timeline[timeline.length-1].end=t;
      else timeline.push({proc:i,start:t-1,end:t});
      if(rem[i]===0){done++;finish[i]=t;steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});}
    }
    return{timeline,finish,steps};
  }

  function simulateBuddy(procs,totalRAM,osSize,log,snapshots,memMode){
    const buddySize=Math.pow(2,Math.ceil(Math.log2(totalRAM-osSize)));
    let buddyBlocks=[{start:osSize,size:buddySize,free:true,level:0}];
    const ifrag=new Array(procs.length).fill(0);
    const startTime=new Array(procs.length).fill(-1);
    const finishTime=new Array(procs.length).fill(-1);
    const allocated=new Array(procs.length).fill(false);
    const finished=new Array(procs.length).fill(false);
    const waitQueue=[];
    const maxT=Math.max(...procs.map(p=>p.arrival+p.burst))+3;
    log.push({type:'header',msg:`════ BUDDY SYSTEM ════ Bloque base:${buddySize}KB`});
    for(let t=0;t<maxT;t++){
      procs.forEach((p,i)=>{
        if(finished[i]||allocated[i])return;
        if(p.arrival<=t){
          const need=Math.pow(2,Math.ceil(Math.log2(Math.max(p.mem,1))));
          const r=buddyAlloc(buddyBlocks,need,i);
          if(r){allocated[i]=true;ifrag[i]=need-p.mem;log.push({type:'alloc',msg:`t=${t}: [BUDDY] ${p.id} → ${need}KB (pide ${p.mem}KB) frag.int=${ifrag[i]}KB`});}
          else{if(!waitQueue.includes(i)){waitQueue.push(i);log.push({type:'wait',msg:`t=${t}: [ESPERA] ${p.id} no hay bloque >= ${need}KB`});}}
        }
      });
      procs.forEach((p,i)=>{
        if(!allocated[i]||finished[i])return;
        if(startTime[i]===-1)startTime[i]=t;
        if(t>=p.arrival+p.burst){
          finished[i]=true;finishTime[i]=t;buddyFree(buddyBlocks,i);
          log.push({type:'free',msg:`t=${t}: [FREE] ${p.id} → bloque liberado y fusionado`});
        }
      });
      const blocks=[{start:0,size:osSize,type:'os',pid:'OS'},...buddyBlocks.map(b=>({start:b.start,size:b.size,type:b.free?'free':'proc',pid:b.free?null:procs[b.procIdx]?.id,procIdx:b.procIdx,internalFrag:b.free?0:(ifrag[b.procIdx]||0)}))];
      const st=calcStats(blocks,osSize,totalRAM,ifrag);
      snapshots.push({t,blocks,buddyBlocks:buddyBlocks.map(b=>({...b})),stats:st});
      updateFragBar(st,osSize,totalRAM);
    }
    procs.forEach((p,i)=>{if(finishTime[i]===-1)finishTime[i]=maxT;if(startTime[i]===-1)startTime[i]=p.arrival;});
    const cpuR=simulateSRT_mem(procs);
    log.push({type:'header',msg:`════ FIN BUDDY ════`});
    return{snapshots,log,startTime,finishTime,internalFrag:ifrag,cpuTimeline:cpuR.timeline,cpuFinish:cpuR.finish,cpuSteps:cpuR.steps,maxT,isBuddy:true};
  }

  function buddyAlloc(blocks,size,procIdx){
    const cands=blocks.filter(b=>b.free&&b.size>=size).sort((a,b)=>a.size-b.size);
    if(!cands.length)return null;
    const b=cands[0];
    while(b.size>size){const half=b.size/2;blocks.push({start:b.start+half,size:half,free:true,level:b.level+1});b.size=half;b.level++;blocks.sort((a,c)=>a.start-c.start);}
    b.free=false;b.procIdx=procIdx;return b;
  }

  function buddyFree(blocks,procIdx){
    const b=blocks.find(bl=>!bl.free&&bl.procIdx===procIdx);if(!b)return;
    b.free=true;b.procIdx=undefined;
    let merged=true;
    while(merged){
      merged=false;
      for(let i=0;i<blocks.length;i++){
        if(!blocks[i].free)continue;
        const buddy=blocks.find(b2=>b2!==blocks[i]&&b2.free&&b2.size===blocks[i].size&&(blocks[i].start^b2.start)===blocks[i].size);
        if(buddy){blocks[i].start=Math.min(blocks[i].start,buddy.start);blocks[i].size*=2;blocks[i].level--;blocks.splice(blocks.indexOf(buddy),1);merged=true;break;}
      }
    }
    blocks.sort((a,b)=>a.start-b.start);
  }

  function updateFragBar(stats,osSize,totalRAM){
    document.getElementById('fb-os').style.width=(osSize/totalRAM*100).toFixed(1)+'%';
    document.getElementById('fb-used').style.width=(stats.usedByProcs/totalRAM*100).toFixed(1)+'%';
    document.getElementById('fb-ifrag').style.width=(stats.totalIF/totalRAM*100).toFixed(1)+'%';
    document.getElementById('fb-free').style.width=(stats.totalFree/totalRAM*100).toFixed(1)+'%';
    document.getElementById('frag-pct').textContent=stats.pct+'% usado';
    // Update mini bar in sidebar
    document.getElementById('m-usage-bar').style.width=stats.pct+'%';
    document.getElementById('mem-ram-usage-bar').style.width=stats.pct+'%';
    document.getElementById('mem-ram-label').textContent=stats.pct+'%';
  }

  function updateMetrics(result,algo,totalRAM){
    const procs=result.procs;
    const lastSnap=result.snapshots[result.snapshots.length-1];
    const st=lastSnap.stats;
    document.getElementById('m-algo').textContent={FF:'1° Ajuste',BF:'Mejor Aj.',WF:'Peor Aj.',BD:'Los Gemelos'}[algo]||algo;
    document.getElementById('m-usage').textContent=st.pct+'%';
    document.getElementById('m-efrag').textContent=st.efrag+'KB';
    document.getElementById('m-ifrag').textContent=st.totalIF+'KB';
    const inWait=procs.filter((_,i)=>result.finishTime[i]===result.maxT).length;
    document.getElementById('m-wait').textContent=inWait;
    document.getElementById('m-procs').textContent=procs.length;
  }

  function buildLegend(procs){
    const html=procs.map((p,i)=>`<div class="legend-item"><span class="color-dot" style="background:${pcolor(i)}"></span><span class="mono" style="font-weight:700;font-size:11px">${p.id}</span><span style="color:var(--text3);font-size:10px">a=${p.arrival} b=${p.burst} ${p.mem}KB</span></div>`).join('');
    document.getElementById('mem-legend').innerHTML=html;
    document.getElementById('mem-legend-gantt').innerHTML=html;
    document.getElementById('mem-legend-gantt').style.display='flex';
  }

  function buildSummaryTable(procs,result){
    let sumTR=0,sumTE=0;
    const rows=procs.map((p,i)=>{
      const tr=result.finishTime[i]-p.arrival;const te=Math.max(0,tr-p.burst);
      sumTR+=tr;sumTE+=te;
      return{p,i,tr,te,s:result.startTime[i],f:result.finishTime[i],ifr:result.internalFrag[i]||0};
    });
    const n=procs.length;
    document.getElementById('mem-sum-tbody').innerHTML=rows.map(({p,i,tr,te,s,f,ifr})=>`
      <tr>
        <td><div style="display:flex;align-items:center;gap:7px"><span style="width:9px;height:9px;border-radius:50%;background:${pcolor(i)};flex-shrink:0"></span><span class="mono" style="font-weight:700">${p.id}</span></div></td>
        <td class="center">${p.arrival}</td><td class="center">${p.burst}</td><td class="center">${p.mem}KB</td><td class="center">${p.priority||1}</td>
        <td class="center">${s}</td><td class="center">${f}</td>
        <td class="center"><span style="color:var(--amber);font-weight:700">${tr}</span></td>
        <td class="center"><span style="color:var(--blue);font-weight:700">${te}</span></td>
        <td class="center"><span style="color:var(--purple)">${ifr}KB</span></td>
        <td class="center"><span class="sbadge green">✓ Fin</span></td>
      </tr>`).join('');
    document.getElementById('mem-sum-tfoot').innerHTML=`<tr>
      <td colspan="7" style="color:var(--text2);font-weight:700;font-size:11px">Σ / Promedio →</td>
      <td class="center" style="color:var(--amber);font-weight:700">${(sumTR/n).toFixed(2)}</td>
      <td class="center" style="color:var(--blue);font-weight:700">${(sumTE/n).toFixed(2)}</td>
      <td class="center" style="color:var(--purple)">${result.internalFrag.reduce((a,b)=>a+b,0)}KB</td><td></td>
    </tr>`;
    document.getElementById('mem-stat-cards').innerHTML=[
      {l:'TR̄ Promedio',v:(sumTR/n).toFixed(2),c:'var(--amber)'},
      {l:'TĒ Promedio',v:(sumTE/n).toFixed(2),c:'var(--blue)'},
      {l:'N° Procesos',v:n,c:'var(--cyan)'},
      {l:'ΣTR / ΣTE',v:`${sumTR}/${sumTE}`,c:'var(--purple)'},
    ].map(s=>`<div class="stat-card" style="border-top:2px solid ${s.c}"><div class="sc-lbl">${s.l}</div><div class="sc-val" style="color:${s.c}">${s.v}</div></div>`).join('');
  }

  function buildLog(log){
    document.getElementById('mem-log-box').innerHTML=log.map(l=>`<div class="log-line ${l.type}">${l.msg}</div>`).join('');
  }

  function drawMemGantt(timeline,procs){if(timeline&&procs) drawGanttCanvas('memGanttCanvas',timeline,procs,timeline.length);}

  function switchTab(name,btn){
    document.querySelectorAll('#mem-result-panel .tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('#mem-result-panel .tab-panel').forEach(p=>p.classList.remove('active'));
    if(btn)btn.classList.add('active');
    document.getElementById('mem-tab-'+name).classList.add('active');
    if(name==='ram'&&simResult) requestAnimationFrame(()=>drawRAMCanvas('ramCanvas',simResult.snapshots[currentTime].blocks,simResult.totalRAM,currentTime,simResult.snapshots.length));
    if(name==='gantt'&&simResult) requestAnimationFrame(()=>drawMemGantt(simResult.cpuTimeline,simResult.procs));
    if(name==='buddy'&&simResult&&simResult.isBuddy){document.getElementById('buddyCanvas').style.display='block';document.getElementById('mem-empty-buddy').style.display='none';requestAnimationFrame(()=>drawBuddyCanvas(simResult.snapshots[currentTime],simResult.procs,simResult.totalRAM,simResult.osSize));}
    if(name==='particiones'&&simResult){document.getElementById('mem-empty-particiones').style.display='none';document.getElementById('mem-particiones-content').style.display='block';requestAnimationFrame(()=>drawParticionesCanvas('partCanvas',simResult.snapshots[currentTime].blocks,simResult.totalRAM,currentTime));}
    if(name==='fragdiag'&&simResult) requestAnimationFrame(()=>drawFragDiag(fragDiagTime));
  }

  function stepTime(delta){
    if(!simResult)return;
    currentTime=Math.max(0,Math.min(simResult.snapshots.length-1,currentTime+delta));
    document.getElementById('mem-time-slider').value=currentTime;
    _refreshFrame();
  }

  function sliderChange(v){if(!simResult)return;currentTime=+v;_refreshFrame();}

  function _refreshFrame(){
    document.getElementById('mem-time-display').textContent='t = '+currentTime;
    drawRAMCanvas('ramCanvas',simResult.snapshots[currentTime].blocks,simResult.totalRAM,currentTime,simResult.snapshots.length);
    if(simResult.isBuddy) drawBuddyCanvas(simResult.snapshots[currentTime],simResult.procs,simResult.totalRAM,simResult.osSize);
    const partTab=document.getElementById('mem-tab-particiones');
    if(partTab&&partTab.classList.contains('active')) drawParticionesCanvas('partCanvas',simResult.snapshots[currentTime].blocks,simResult.totalRAM,currentTime);
    const partLabel=document.getElementById('part-time-label');
    if(partLabel) partLabel.textContent='t = '+currentTime;
    const st=simResult.snapshots[currentTime].stats;
    updateFragBar(st,simResult.osSize,simResult.totalRAM);
  }

  function toggleAnim(){
    if(animTimer){clearInterval(animTimer);animTimer=null;document.getElementById('mem-anim-btn').textContent='▶ Auto';return;}
    document.getElementById('mem-anim-btn').textContent='⏸ Pausa';
    animTimer=setInterval(()=>{
      currentTime++;
      if(currentTime>=simResult.snapshots.length){currentTime=0;}
      document.getElementById('mem-time-slider').value=currentTime;
      _refreshFrame();
    },400);
  }

  function copyLog(){navigator.clipboard.writeText(document.getElementById('mem-log-box').innerText)}
  function downloadLog(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([document.getElementById('mem-log-box').innerText],{type:'text/plain'}));a.download='log_memoria.txt';a.click();}

  let fragDiagTime=0,fragDiagTimer=null;

  function drawFragDiag(t){
    if(!simResult)return;
    fragDiagTime=Math.max(0,Math.min(simResult.snapshots.length-1,t));
    document.getElementById('fragdiag-slider').value=fragDiagTime;
    document.getElementById('fragdiag-time-label').textContent='t = '+fragDiagTime;
    const snap=simResult.snapshots[fragDiagTime];
    const totalRAM=simResult.totalRAM;
    const col=document.getElementById('fragdiag-col');
    const COL_H=520;const scale=COL_H/totalRAM;
    let html=`<div style="position:relative;display:inline-block;width:145px;"><div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);margin-bottom:5px;text-align:center">${totalRAM>=1024?(totalRAM/1024).toFixed(1)+'MB':totalRAM+'K'}</div><div style="position:relative;width:145px;height:${COL_H}px;border:2px solid var(--border2);border-radius:8px;overflow:hidden;background:var(--surface4);">`;
    const sorted=[...snap.blocks].sort((a,b)=>a.start-b.start);
    sorted.forEach((b,idx)=>{
      const h=Math.max(b.size*scale,2);const top=b.start*scale;
      let bgColor,borderColor,labelColor,label,labelSub;
      if(b.type==='os'){bgColor='rgba(77,159,255,0.25)';borderColor='#4d9fff';labelColor='#4d9fff';label='S.O.';labelSub=b.size+'KB';}
      else if(b.type==='free'){bgColor='rgba(28,45,72,0.5)';borderColor='#253850';labelColor='#3a5578';label='Libre';labelSub=b.size+'KB';}
      else{const ci=b.procIdx!==undefined?b.procIdx:idx;const col_p=pcolor(ci);bgColor=col_p+'33';borderColor=col_p;labelColor=col_p;label=b.pid||'?';labelSub=b.size+'KB';}
      html+=`<div style="position:absolute;left:0;top:${top.toFixed(1)}px;width:100%;height:${h.toFixed(1)}px;background:${bgColor};border-bottom:1.5px solid ${borderColor};box-sizing:border-box;overflow:hidden;">`;
      if(h>18){
        html+=`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;pointer-events:none;"><span style="font-size:${Math.min(14,h*0.22)}px;font-weight:700;color:${labelColor};font-family:'Space Grotesk',sans-serif;line-height:1;">${label}</span>`;
        if(h>30) html+=`<span style="font-size:${Math.min(10,h*0.15)}px;color:${labelColor}88;font-family:'JetBrains Mono',monospace;">${labelSub}</span>`;
        html+=`</div>`;
      }
      if(b.internalFrag>0&&b.internalFrag<b.size){
        const ifh=(b.internalFrag*scale).toFixed(1);
        html+=`<div style="position:absolute;bottom:0;left:0;width:100%;height:${ifh}px;background:repeating-linear-gradient(45deg,rgba(181,123,255,0.2) 0px,rgba(181,123,255,0.2) 4px,rgba(181,123,255,0.07) 4px,rgba(181,123,255,0.07) 8px);border-top:1.5px dashed #b57bff;">${ifh>12?`<span style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);font-size:9px;color:#b57bff;font-family:'JetBrains Mono',monospace;white-space:nowrap;">Frag.Int ${b.internalFrag}KB</span>`:''}</div>`;
      }
      html+=`</div><div style="position:absolute;left:149px;top:${top.toFixed(1)}px;font-size:9px;font-family:'JetBrains Mono',monospace;color:#3a5578;white-space:nowrap;line-height:1;">${b.start>=1024?(b.start/1024).toFixed(1)+'M':b.start+'K'}</div>`;
    });
    html+=`<div style="position:absolute;left:149px;top:${COL_H}px;font-size:9px;font-family:'JetBrains Mono',monospace;color:#3a5578;white-space:nowrap;line-height:1;">${totalRAM>=1024?(totalRAM/1024).toFixed(1)+'M':totalRAM+'K'}</div>`;
    html+=`</div></div>`;
    col.innerHTML=html;
    const st=snap.stats;
    const efragBlocks=sorted.filter(b=>b.type==='free'&&b.size>0);
    document.getElementById('fragdiag-stats').innerHTML=[
      {l:'Fragmentación Externa',v:st.efrag+'KB',sub:efragBlocks.length+' hueco(s)',c:'#ff4d6a'},
      {l:'Fragmentación Interna',v:st.totalIF+'KB',sub:'desperdiciado',c:'#b57bff'},
      {l:'Memoria Utilizada',v:st.usedByProcs+'KB',sub:((st.usedByProcs/totalRAM)*100).toFixed(1)+'%',c:'var(--green)'},
      {l:'Memoria Libre Total',v:st.totalFree+'KB',sub:((st.totalFree/totalRAM)*100).toFixed(1)+'%',c:'var(--text2)'},
    ].map(s=>`<div class="fs-card" style="border-left-color:${s.c}"><div class="fs-lbl">${s.l}</div><div class="fs-val" style="color:${s.c}">${s.v}</div><div class="fs-sub">${s.sub}</div></div>`).join('');
  }

  function fragDiagStep(delta){if(!simResult)return;drawFragDiag(fragDiagTime+delta);}
  function fragDiagSlider(v){if(!simResult)return;drawFragDiag(+v);}
  function fragDiagAuto(){
    if(fragDiagTimer){clearInterval(fragDiagTimer);fragDiagTimer=null;document.getElementById('fragdiag-btn-play').textContent='▶ Auto';return;}
    document.getElementById('fragdiag-btn-play').textContent='⏸ Pausa';
    fragDiagTimer=setInterval(()=>{
      if(!simResult){clearInterval(fragDiagTimer);fragDiagTimer=null;return;}
      const next=fragDiagTime+1;
      if(next>=simResult.snapshots.length){clearInterval(fragDiagTimer);fragDiagTimer=null;document.getElementById('fragdiag-btn-play').textContent='▶ Auto';return;}
      drawFragDiag(next);
    },450);
  }

  window.addEventListener('resize',()=>{if(simResult)requestAnimationFrame(_refreshFrame)});
  renderTable();
  return{selectAlgo,setMode,addProcess,delProc,clearAll,loadDefault,loadCSV,run,switchTab,stepTime,sliderChange,toggleAnim,copyLog,downloadLog,fragDiagStep,fragDiagSlider,fragDiagAuto,processes};
})();

/* ═══════════════════════════════════════════════════════════════
   CPU MODULE FACTORY
═══════════════════════════════════════════════════════════════ */
function makeCPUModule(prefix,defaultProcs,hasPriority){
  let processes=[...defaultProcs];
  let currentPolicy=hasPriority?'FCFS':'SRT';
  let simResult=null,ganttStep_cur=0,ganttPlaying=false,animTimer=null,procId=defaultProcs.length;

  function renderTable(){
    const tb=document.getElementById(prefix+'-proc-tbody');
    tb.innerHTML=processes.map((p,i)=>`<tr>
      <td><span class="color-dot" style="background:${pcolor(i)}"></span></td>
      <td><input value="${p.id}" oninput="this.closest('tr').dataset.idx=${i};window._cpuProcs_${prefix}[${i}].id=this.value" style="width:42px"></td>
      <td><input type="number" value="${p.arrival}" min="0" oninput="window._cpuProcs_${prefix}[${i}].arrival=+this.value" style="width:40px"></td>
      <td><input type="number" value="${p.burst}" min="1" oninput="window._cpuProcs_${prefix}[${i}].burst=+this.value" style="width:40px"></td>
      ${hasPriority?`<td><input type="number" value="${p.priority||1}" min="1" max="10" oninput="window._cpuProcs_${prefix}[${i}].priority=+this.value" style="width:40px"></td>`:''}
      <td><button class="btn-del" onclick="window._cpuMod_${prefix}.delProc(${i})">✕</button></td>
    </tr>`).join('');
    document.getElementById(prefix+'-proc-count').textContent=processes.length+' proceso(s)';
    window[`_cpuProcs_${prefix}`]=processes;
  }

  function selectPolicy(pol,el){
    currentPolicy=pol;
    document.querySelectorAll(`#mod-${prefix==='exp'?'cpu-exp':'cpu-noexp'} .policy-card`).forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
    const infos={
      SRT:'<strong style="color:var(--blue)">SRT</strong> — En cada tick, el proceso con menor tiempo restante ejecuta. Si llega uno más corto, se desaloja el actual.',
      RR:'<strong style="color:var(--blue)">Round Robin</strong> — Cada proceso ejecuta como máximo q ticks. Luego regresa al final de la cola de listos.',
      FCFS:'<strong style="color:var(--amber)">FCFS</strong> — Orden estricto de llegada. Sin desalojo. Puede generar «efecto convoy».',
      SPN:'<strong style="color:var(--amber)">SPN / SJF</strong> — Al terminar el proceso actual, elige el de menor Ts disponible. Óptimo para TR promedio.',
      PRIO:'<strong style="color:var(--amber)">Prioridad</strong> — Menor número = mayor prioridad. No desaloja al proceso actual.',
      HRRN:'<strong style="color:var(--amber)">HRRN</strong> — Ratio = (TE + Ts) / Ts. Evita inanición.',
    };
    const infoEl=document.getElementById(prefix+'-algo-info');
    if(infoEl) infoEl.innerHTML=infos[pol]||'';
    const qf=document.getElementById(prefix+'-quantum-field');
    if(qf) qf.style.display=pol==='RR'?'block':'none';
  }

  function addProcess(){
    const base=hasPriority?{id:'P'+(++procId),arrival:0,burst:3,priority:3}:{id:'P'+(++procId),arrival:0,burst:3};
    processes.push(base);window[`_cpuProcs_${prefix}`]=processes;renderTable();
  }
  function delProc(i){processes.splice(i,1);window[`_cpuProcs_${prefix}`]=processes;renderTable();}
  function clearAll(){processes=[];procId=0;window[`_cpuProcs_${prefix}`]=processes;renderTable();}
  function loadDefault(){processes=[...defaultProcs];procId=defaultProcs.length;window[`_cpuProcs_${prefix}`]=processes;renderTable();}

  function loadCSV(inp){
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      const lines=e.target.result.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
      const parsed=[];
      lines.forEach((line,idx)=>{
        if(idx===0&&/[a-zA-Z]{2,}/.test(line))return;
        const p=line.split(/[,;\t]+/).map(s=>s.trim());
        if(p.length<3)return;
        const proc={id:p[0]||'P'+idx,arrival:+p[1]||0,burst:Math.max(1,+p[2]||1)};
        if(hasPriority)proc.priority=+p[3]||1;
        parsed.push(proc);
      });
      if(parsed.length){processes=parsed;procId=parsed.length;window[`_cpuProcs_${prefix}`]=processes;renderTable();}
      inp.value='';
    };
    r.readAsText(f);
  }

  /* SCHEDULERS */
  function simulateSRT(procs){
    const n=procs.length;const rem=procs.map(p=>p.burst);
    const finish=new Array(n).fill(0);const timeline=[];const steps=[];
    let t=0,done=0,idle=0;
    const maxT=procs.reduce((s,p)=>s+p.burst,0)+Math.max(...procs.map(p=>p.arrival))+5;
    while(done<n&&t<maxT){
      const ready=procs.map((p,i)=>({i,p})).filter(({i,p})=>p.arrival<=t&&rem[i]>0);
      if(!ready.length){idle++;steps.push({type:'tick',msg:`t=${t}: [IDLE] CPU libre`});t++;continue;}
      const{i}=ready.reduce((a,b)=>rem[b.i]<rem[a.i]?b:a);
      rem[i]--;t++;
      if(timeline.length&&timeline[timeline.length-1].proc===i)timeline[timeline.length-1].end=t;
      else{timeline.push({proc:i,start:t-1,end:t});steps.push({type:'event',msg:`t=${t-1}: [RUN] ${procs[i].id} (rem=${rem[i]+1}→${rem[i]})`});}
      if(rem[i]===0){done++;finish[i]=t;steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});}
    }
    return{timeline,finish,steps,idle,total:t};
  }

  function simulateRR(procs,q){
    const n=procs.length;const rem=procs.map(p=>p.burst);
    const finish=new Array(n).fill(0);const timeline=[];const steps=[];
    let t=0,done=0,idle=0;
    const queue=[];const inQueue=new Array(n).fill(false);
    const maxT=procs.reduce((s,p)=>s+p.burst,0)+Math.max(...procs.map(p=>p.arrival))+10;
    while(done<n&&t<maxT){
      procs.forEach((p,i)=>{if(p.arrival===t&&!inQueue[i]&&rem[i]>0){queue.push(i);inQueue[i]=true;}});
      if(!queue.length){idle++;t++;procs.forEach((p,i)=>{if(p.arrival<=t&&!inQueue[i]&&rem[i]>0){queue.push(i);inQueue[i]=true;}});continue;}
      const i=queue.shift();inQueue[i]=false;
      const run=Math.min(q,rem[i]);const start=t;
      steps.push({type:'event',msg:`t=${start}: [RR] ${procs[i].id} ejecuta ${run} tick(s) (rem=${rem[i]})`});
      for(let k=0;k<run;k++){rem[i]--;t++;procs.forEach((p,j)=>{if(j!==i&&p.arrival===t&&!inQueue[j]&&rem[j]>0){queue.push(j);inQueue[j]=true;}});}
      if(timeline.length&&timeline[timeline.length-1].proc===i)timeline[timeline.length-1].end=t;
      else timeline.push({proc:i,start,end:t});
      if(rem[i]===0){done++;finish[i]=t;steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});}
      else{queue.push(i);inQueue[i]=true;}
    }
    return{timeline,finish,steps,idle,total:t};
  }

  function simulateFCFS(procs){
    const sorted=[...procs.entries()].sort(([,a],[,b])=>a.arrival-b.arrival);
    const timeline=[];const steps=[];const finish=new Array(procs.length).fill(0);
    let t=0;
    sorted.forEach(([origIdx,p])=>{
      if(t<p.arrival)t=p.arrival;
      steps.push({type:'event',msg:`t=${t}: [FCFS] ${p.id} inicia (TL=${p.arrival}, Ts=${p.burst})`});
      timeline.push({proc:origIdx,start:t,end:t+p.burst});
      t+=p.burst;finish[origIdx]=t;steps.push({type:'finish',msg:`t=${t}: [FIN] ${p.id}`});
    });
    return{timeline,finish,steps,idle:0,total:t};
  }

  function simulateSPN(procs){
    const n=procs.length;const done=new Array(n).fill(false);
    const timeline=[];const steps=[];const finish=new Array(n).fill(0);
    let t=0,completed=0;
    while(completed<n){
      const avail=procs.map((p,i)=>({i,p})).filter(({i,p})=>p.arrival<=t&&!done[i]);
      if(!avail.length){t++;continue;}
      const{i}=avail.reduce((a,b)=>b.p.burst<a.p.burst?b:a);
      steps.push({type:'event',msg:`t=${t}: [SPN] ${procs[i].id} (Ts=${procs[i].burst}) disponibles:[${avail.map(x=>x.p.id+'('+x.p.burst+')').join(',')}]`});
      timeline.push({proc:i,start:t,end:t+procs[i].burst});
      t+=procs[i].burst;done[i]=true;finish[i]=t;completed++;
      steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});
    }
    return{timeline,finish,steps,idle:0,total:t};
  }

  function simulatePRIO(procs){
    const n=procs.length;const done=new Array(n).fill(false);
    const timeline=[];const steps=[];const finish=new Array(n).fill(0);
    let t=0,completed=0;
    while(completed<n){
      const avail=procs.map((p,i)=>({i,p})).filter(({i,p})=>p.arrival<=t&&!done[i]);
      if(!avail.length){t++;continue;}
      const{i}=avail.reduce((a,b)=>(b.p.priority||1)<(a.p.priority||1)?b:a);
      steps.push({type:'event',msg:`t=${t}: [PRIO] ${procs[i].id} (prior=${procs[i].priority||1})`});
      timeline.push({proc:i,start:t,end:t+procs[i].burst});
      t+=procs[i].burst;done[i]=true;finish[i]=t;completed++;
      steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});
    }
    return{timeline,finish,steps,idle:0,total:t};
  }

  function simulateHRRN(procs){
    const n=procs.length;const done=new Array(n).fill(false);
    const timeline=[];const steps=[];const finish=new Array(n).fill(0);
    let t=0,completed=0;
    while(completed<n){
      const avail=procs.map((p,i)=>({i,p})).filter(({i,p})=>p.arrival<=t&&!done[i]);
      if(!avail.length){t++;continue;}
      const{i}=avail.reduce((a,b)=>{
        const ratioA=(t-a.p.arrival+a.p.burst)/a.p.burst;
        const ratioB=(t-b.p.arrival+b.p.burst)/b.p.burst;
        return ratioB>ratioA?b:a;
      });
      const ratio=((t-procs[i].arrival+procs[i].burst)/procs[i].burst).toFixed(2);
      steps.push({type:'event',msg:`t=${t}: [HRRN] ${procs[i].id} ratio=${ratio}`});
      timeline.push({proc:i,start:t,end:t+procs[i].burst});
      t+=procs[i].burst;done[i]=true;finish[i]=t;completed++;
      steps.push({type:'finish',msg:`t=${t}: [FIN] ${procs[i].id}`});
    }
    return{timeline,finish,steps,idle:0,total:t};
  }

  function run(){
    if(!processes.length){alert('Agrega al menos un proceso.');return;}
    const procs=processes.map(p=>({...p,arrival:+p.arrival,burst:+p.burst,priority:+(p.priority||1)}));
    const q=Math.max(1,+(document.getElementById(prefix+'-quantum')||{value:2}).value||2);

    let result;
    if(currentPolicy==='SRT')result=simulateSRT(procs);
    else if(currentPolicy==='RR')result=simulateRR(procs,q);
    else if(currentPolicy==='FCFS')result=simulateFCFS(procs);
    else if(currentPolicy==='SPN')result=simulateSPN(procs);
    else if(currentPolicy==='PRIO')result=simulatePRIO(procs);
    else if(currentPolicy==='HRRN')result=simulateHRRN(procs);

    simResult={...result,procs,q};
    ganttStep_cur=0;ganttPlaying=false;

    const n=procs.length;
    const avgTR=(result.finish.map((f,i)=>f-procs[i].arrival).reduce((a,b)=>a+b,0)/n).toFixed(2);
    const avgTE=(result.finish.map((f,i)=>Math.max(0,f-procs[i].arrival-procs[i].burst)).reduce((a,b)=>a+b,0)/n).toFixed(2);
    const maxT=result.total||1;
    const util=Math.round((maxT-(result.idle||0))/maxT*100);

    document.getElementById(prefix+'-m-policy').textContent=currentPolicy+(currentPolicy==='RR'?' (q='+q+')':'');
    document.getElementById(prefix+'-m-n').textContent=n;
    document.getElementById(prefix+'-m-tr').textContent=avgTR;
    document.getElementById(prefix+'-m-te').textContent=avgTE;
    document.getElementById(prefix+'-m-total').textContent=maxT;
    document.getElementById(prefix+'-m-util').textContent=util+'%';
    const cpuBar=document.getElementById(prefix+'-cpu-bar');
    if(cpuBar){cpuBar.style.width=util+'%';}

    storedResults['cpu_'+prefix+'_'+currentPolicy]={
      algo:(prefix==='exp'?'Expulsiva: ':'No-Exp: ')+currentPolicy+(currentPolicy==='RR'?' q='+q:''),
      avgTR,avgTE,n,color:prefix==='exp'?pcolor(2):pcolor(4)
    };
    updateGlobalHeader({simname:(prefix==='exp'?'CPU-Exp: ':'CPU-NoExp: ')+currentPolicy,tr:avgTR,te:avgTE,procs:n,cpu:util+'',ram:'—',efrag:'—'});

    document.getElementById(prefix+'-empty-state').style.display='none';
    const _rc=document.getElementById(prefix+'-result-content');
    _rc.style.display='flex';_rc.style.flexDirection='column';

    buildLegend(procs);
    buildTable(procs,result,avgTR,avgTE);
    buildSteps(result.steps);
    buildSchedulerStates(prefix,procs,result);
    buildStatesTimeline(prefix,procs,result);
    switchTab('gantt',null);
    requestAnimationFrame(()=>drawGanttCanvas(prefix+'GanttCanvas',result.timeline,procs,result.timeline.length));
  }

  function buildLegend(procs){
    document.getElementById(prefix+'-legend').innerHTML=procs.map((p,i)=>`
      <div class="legend-item">
        <span class="color-dot" style="background:${pcolor(i)}"></span>
        <span class="mono" style="font-weight:700;font-size:11px">${p.id}</span>
        <span style="color:var(--text3);font-size:10px">TL=${p.arrival} Ts=${p.burst}${hasPriority?' P='+(p.priority||1):''}</span>
      </div>`).join('');
  }

  function buildTable(procs,result,avgTR,avgTE){
    let sumTR=0,sumTE=0;
    document.getElementById(prefix+'-sum-tbody').innerHTML=procs.map((p,i)=>{
      const f=result.finish[i];const tr=f-p.arrival;const te=Math.max(0,tr-p.burst);
      sumTR+=tr;sumTE+=te;
      return`<tr>
        <td><div style="display:flex;align-items:center;gap:7px"><span style="width:9px;height:9px;border-radius:50%;background:${pcolor(i)};flex-shrink:0"></span><span class="mono" style="font-weight:700">${p.id}</span></div></td>
        <td class="center">${p.arrival}</td><td class="center">${p.burst}</td>
        ${hasPriority?`<td class="center">${p.priority||1}</td>`:''}
        <td class="center">${f}</td>
        <td class="center"><span style="color:var(--amber);font-weight:700">${tr}</span></td>
        <td class="center"><span style="color:var(--blue);font-weight:700">${te}</span></td>
      </tr>`;
    }).join('');
    document.getElementById(prefix+'-sum-tfoot').innerHTML=`<tr>
      <td ${hasPriority?'colspan="4"':'colspan="3"'} style="color:var(--text2);font-weight:700;font-size:11px">Σ / Promedio →</td>
      <td class="center" style="color:var(--text3)">—</td>
      <td class="center" style="color:var(--amber);font-weight:700">${avgTR}</td>
      <td class="center" style="color:var(--blue);font-weight:700">${avgTE}</td>
    </tr>`;
    document.getElementById(prefix+'-stat-cards').innerHTML=[
      {l:'TR̄ Promedio',v:avgTR,c:'var(--amber)'},
      {l:'TĒ Promedio',v:avgTE,c:'var(--blue)'},
      {l:'N° Procesos',v:procs.length,c:'var(--cyan)'},
    ].map(s=>`<div class="stat-card" style="border-top:2px solid ${s.c}"><div class="sc-lbl">${s.l}</div><div class="sc-val" style="color:${s.c}">${s.v}</div></div>`).join('');
  }

  function buildSteps(steps){
    const el=document.getElementById(prefix+'-steps-panel');
    if(!el)return;
    el.innerHTML=steps.map(s=>`<div class="log-line ${s.type}">${s.msg}</div>`).join('');
  }

  function switchTab(name,btn){
    document.querySelectorAll(`#${prefix}-result-content .tab-btn`).forEach(b=>b.classList.remove('active'));
    document.querySelectorAll(`#${prefix}-result-content .tab-panel`).forEach(p=>p.classList.remove('active'));
    if(btn)btn.classList.add('active');
    else document.querySelectorAll(`#${prefix}-result-content .tab-btn`).forEach(b=>{
      if(b.getAttribute('onclick')&&b.getAttribute('onclick').includes("'"+name+"'"))b.classList.add('active');
    });
    document.getElementById(prefix+'-tab-'+name).classList.add('active');
    if(name==='gantt'&&simResult) requestAnimationFrame(()=>drawGanttCanvas(prefix+'GanttCanvas',simResult.timeline,simResult.procs,ganttStep_cur||simResult.timeline.length));
  }

  function ganttStep(dir){
    if(!simResult)return;
    ganttStep_cur=Math.max(0,Math.min(simResult.timeline.length,ganttStep_cur+dir));
    requestAnimationFrame(()=>drawGanttCanvas(prefix+'GanttCanvas',simResult.timeline,simResult.procs,ganttStep_cur));
    document.getElementById(prefix+'-step-indicator').textContent=`Paso ${ganttStep_cur} / ${simResult.timeline.length}`;
    document.getElementById(prefix+'-btn-prev').disabled=ganttStep_cur===0;
    document.getElementById(prefix+'-btn-next').disabled=ganttStep_cur===simResult.timeline.length;
  }

  function ganttReset(){
    clearInterval(animTimer);ganttPlaying=false;ganttStep_cur=0;
    document.getElementById(prefix+'-btn-play').textContent='▶ Auto';
    document.getElementById(prefix+'-step-indicator').textContent='Paso 0';
    document.getElementById(prefix+'-btn-prev').disabled=true;
    document.getElementById(prefix+'-btn-next').disabled=false;
    if(simResult) requestAnimationFrame(()=>drawGanttCanvas(prefix+'GanttCanvas',simResult.timeline,simResult.procs,0));
  }

  function ganttPlay(){
    if(!simResult)return;
    if(ganttPlaying){clearInterval(animTimer);ganttPlaying=false;document.getElementById(prefix+'-btn-play').textContent='▶ Auto';return;}
    if(ganttStep_cur>=simResult.timeline.length)ganttReset();
    ganttPlaying=true;document.getElementById(prefix+'-btn-play').textContent='⏸ Pausa';
    const speed=+(document.getElementById(prefix+'-speed')||{value:450}).value;
    animTimer=setInterval(()=>{
      if(ganttStep_cur<simResult.timeline.length){ganttStep(1);}
      else{clearInterval(animTimer);ganttPlaying=false;document.getElementById(prefix+'-btn-play').textContent='▶ Auto';}
    },speed);
  }

  window[`_cpuMod_${prefix}`]={selectPolicy,addProcess,delProc,clearAll,loadDefault,loadCSV,run,switchTab,ganttStep,ganttReset,ganttPlay};
  return window[`_cpuMod_${prefix}`];
}

/* ═══════════════════════════════════════════════════════════════
   INIT CPU MODULES
═══════════════════════════════════════════════════════════════ */
const cpuExpDefaults=[
  {id:'A',arrival:0,burst:9},{id:'B',arrival:3,burst:5},
  {id:'C',arrival:6,burst:1},{id:'D',arrival:8,burst:3},
];
const cpuNoExpDefaults=[
  {id:'A',arrival:0,burst:9,priority:3},{id:'B',arrival:3,burst:5,priority:1},
  {id:'C',arrival:6,burst:1,priority:4},{id:'D',arrival:8,burst:3,priority:2},
];
const cpuExp=makeCPUModule('exp',cpuExpDefaults,false);
const cpuNoExp=makeCPUModule('noexp',cpuNoExpDefaults,true);
cpuExp.loadDefault();
cpuNoExp.loadDefault();

/* ═══════════════════════════════════════════════════════════════
   COMPARISON MODULE
═══════════════════════════════════════════════════════════════ */
const compare={
  refresh(){
    const grid=document.getElementById('compare-grid');if(!grid)return;
    const entries=Object.entries(storedResults);
    if(!entries.length){
      grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:2.5rem;color:var(--text3)"><div style="font-size:36px;opacity:.2;margin-bottom:10px">📊</div><p style="font-size:13px">Ejecuta simulaciones en los módulos anteriores para ver la comparación.</p></div>`;
      return;
    }
    grid.innerHTML=entries.map(([k,r])=>`
      <div style="background:var(--surface2);border:1px solid var(--border);border-top:2px solid ${r.color||'var(--cyan)'};border-radius:var(--rlg);padding:1rem">
        <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:.6rem">${r.algo}</div>
        <div style="display:flex;gap:18px">
          <div><div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">TR̄</div><div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--amber)">${r.avgTR}</div></div>
          <div><div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">TĒ</div><div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--blue)">${r.avgTE}</div></div>
          <div><div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">N</div><div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:var(--cyan)">${r.n}</div></div>
        </div>
      </div>`).join('');
    this.drawChart(entries);
  },
  drawChart(entries){
    const canvas=document.getElementById('compareCanvas');if(!canvas||!entries.length)return;
    const W=canvas.parentElement.clientWidth-2||700;
    canvas.width=W;canvas.height=320;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#080c14';ctx.fillRect(0,0,W,320);
    const n=entries.length;
    const PAD_L=55,PAD_R=22,PAD_T=32,PAD_B=65;
    const barW=Math.min(44,(W-PAD_L-PAD_R)/n/2-10);
    const maxVal=Math.max(...entries.flatMap(([,r])=>[+r.avgTR,+r.avgTE]),1);
    const chartH=320-PAD_T-PAD_B;
    ctx.strokeStyle='#1a2540';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(PAD_L,PAD_T);ctx.lineTo(PAD_L,PAD_T+chartH);ctx.stroke();
    for(let i=0;i<=4;i++){
      const y=PAD_T+chartH-i/4*chartH;
      const val=(maxVal*i/4).toFixed(1);
      ctx.strokeStyle='#1a2540';ctx.lineWidth=.5;
      ctx.beginPath();ctx.moveTo(PAD_L,y);ctx.lineTo(W-PAD_R,y);ctx.stroke();
      ctx.fillStyle='#334466';ctx.font='10px JetBrains Mono,monospace';ctx.textAlign='right';ctx.textBaseline='middle';
      ctx.fillText(val,PAD_L-5,y);
    }
    const colW=(W-PAD_L-PAD_R)/n;
    entries.forEach(([k,r],idx)=>{
      const cx=PAD_L+idx*colW+colW/2;
      const trH=+r.avgTR/maxVal*chartH;const teH=+r.avgTE/maxVal*chartH;
      const xTR=cx-barW-4;const yTR=PAD_T+chartH-trH;
      ctx.fillStyle='rgba(255,183,50,.2)';ctx.fillRect(xTR,yTR,barW,trH);
      ctx.strokeStyle='#ffb732';ctx.lineWidth=1.5;ctx.strokeRect(xTR+.5,yTR+.5,barW-1,trH-1);
      ctx.fillStyle='#ffb732';ctx.font='bold 10px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText(r.avgTR,xTR+barW/2,yTR-2);
      const xTE=cx+4;const yTE=PAD_T+chartH-teH;
      ctx.fillStyle='rgba(77,159,255,.2)';ctx.fillRect(xTE,yTE,barW,teH);
      ctx.strokeStyle='#4d9fff';ctx.lineWidth=1.5;ctx.strokeRect(xTE+.5,yTE+.5,barW-1,teH-1);
      ctx.fillStyle='#4d9fff';ctx.font='bold 10px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText(r.avgTE,xTE+barW/2,yTE-2);
      ctx.fillStyle='#5a6e8e';ctx.font='10px Space Grotesk,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      const label=r.algo.length>14?r.algo.substring(0,14)+'…':r.algo;
      ctx.fillText(label,cx,PAD_T+chartH+10);
    });
    const LY=320-16;
    ctx.fillStyle='#ffb732';ctx.fillRect(PAD_L,LY-6,14,12);
    ctx.fillStyle='#5a6e8e';ctx.font='10px Space Grotesk,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('TR̄',PAD_L+18,LY);
    ctx.fillStyle='#4d9fff';ctx.fillRect(PAD_L+55,LY-6,14,12);
    ctx.fillStyle='#5a6e8e';ctx.fillText('TĒ',PAD_L+73,LY);
  }
};

/* ═══════════════════════════════════════════════════════════════
   MODULE: ASIGNACIÓN DE DISCO (Contigua / Enlazada / Indexada)
═══════════════════════════════════════════════════════════════ */
const diskMethodInfo={
  contig:`<strong style="color:var(--purple)">Contigua</strong> — Cada archivo ocupa un rango de bloques consecutivos. Se asigna por Primer Ajuste sobre los huecos libres. Fácil de leer secuencialmente, pero con el tiempo aparecen huecos (fragmentación externa) que impiden ubicar archivos grandes.`,
  linked:`<strong style="color:var(--purple)">Enlazada</strong> — Cada bloque del archivo guarda un puntero al siguiente bloque (como una lista enlazada). No requiere bloques consecutivos, así que no hay fragmentación externa. Desventaja: el acceso directo (aleatorio) es lento porque hay que recorrer la cadena.`,
  indexed:`<strong style="color:var(--purple)">Indexada</strong> — Se reserva un bloque extra por archivo, el <em>bloque índice</em>, que contiene los punteros a todos los bloques de datos del archivo. Permite acceso directo rápido, a costa de 1 bloque de overhead por archivo.`
};

const disk=(()=>{
  let files=[
    {id:'F1',name:'sistema_operativo.iso',blocks:9},
    {id:'F2',name:'video_clase.mp4',blocks:6},
    {id:'F3',name:'informe_final.docx',blocks:2},
    {id:'F4',name:'dataset_kaggle.csv',blocks:5},
    {id:'F5',name:'backup_bd.sql',blocks:4},
  ];
  let method='contig',fileIdCounter=5,result=null;

  function renderTable(){
    const tb=document.getElementById('disk-file-tbody');
    tb.innerHTML=files.map((f,i)=>`<tr>
      <td><span class="color-dot" style="background:${pcolor(i)}"></span></td>
      <td><input value="${f.name}" oninput="disk.files[${i}].name=this.value" style="width:120px;text-align:left"></td>
      <td><input type="number" value="${f.blocks}" min="1" oninput="disk.files[${i}].blocks=+this.value" style="width:52px"></td>
      <td><button class="btn-del" onclick="disk.delFile(${i})">✕</button></td>
    </tr>`).join('');
    document.getElementById('disk-file-count').textContent=files.length+' archivo(s)';
  }

  function selectMethod(m,el){
    method=m;
    document.querySelectorAll('#mod-disk .algo-card').forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
    document.getElementById('disk-algo-info').innerHTML=diskMethodInfo[m];
  }

  function addFile(){files.push({id:'F'+(++fileIdCounter),name:'archivo_'+fileIdCounter+'.dat',blocks:2});renderTable();}
  function delFile(i){files.splice(i,1);renderTable();}
  function clearAll(){files=[];fileIdCounter=0;renderTable();result=null;}

  function loadDefault(){
    files=[
      {id:'F1',name:'sistema_operativo.iso',blocks:9},
      {id:'F2',name:'video_clase.mp4',blocks:6},
      {id:'F3',name:'informe_final.docx',blocks:2},
      {id:'F4',name:'dataset_kaggle.csv',blocks:5},
      {id:'F5',name:'backup_bd.sql',blocks:4},
    ];
    fileIdCounter=5;renderTable();
  }

  function loadCSV(inp){
    const f=inp.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=e=>{
      const lines=e.target.result.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
      const parsed=[];
      lines.forEach((line,idx)=>{
        if(idx===0&&/[a-zA-Z]{2,}/.test(line)&&!/,\s*\d+\s*$/.test(line))return;
        const p=line.split(/[,;\t]+/).map(s=>s.trim());
        if(p.length<2)return;
        parsed.push({id:'F'+(idx+1),name:p[0]||('archivo_'+(idx+1)),blocks:Math.max(1,+p[1]||1)});
      });
      if(parsed.length){files=parsed;fileIdCounter=parsed.length;renderTable();}
      inp.value='';
    };
    r.readAsText(f);
  }

  /* ─────────── CORE ALLOCATION ALGORITHMS ─────────── */
  function allocate(method,files,totalBlocks){
    const ownerOf=new Array(totalBlocks).fill(null);
    const blockType=new Array(totalBlocks).fill(null);
    const nextPtr=new Array(totalBlocks).fill(null);
    const indexPtrs={},chainOf={},rangeOf={};
    const allocInfo=[],log=[];

    function freeRuns(){
      const runs=[];let i=0;
      while(i<totalBlocks){
        if(ownerOf[i]===null){const start=i;while(i<totalBlocks&&ownerOf[i]===null)i++;runs.push({start,length:i-start});}
        else i++;
      }
      return runs;
    }
    function freeIndices(){const a=[];for(let i=0;i<totalBlocks;i++)if(ownerOf[i]===null)a.push(i);return a;}

    if(method==='contig'){
      log.push({type:'header',text:'═══ ASIGNACIÓN CONTIGUA (Primer Ajuste sobre huecos libres) ═══'});
      files.forEach(f=>{
        const run=freeRuns().find(r=>r.length>=f.blocks);
        if(run){
          for(let b=run.start;b<run.start+f.blocks;b++){ownerOf[b]=f.id;blockType[b]='data';}
          rangeOf[f.id]={start:run.start,end:run.start+f.blocks-1};
          allocInfo.push({file:f,ok:true,blocksUsed:Array.from({length:f.blocks},(_,k)=>run.start+k)});
          log.push({type:'alloc',text:`✔ ${f.name} → bloques contiguos [${run.start}‑${run.start+f.blocks-1}] (${f.blocks} bloques)`});
        }else{
          allocInfo.push({file:f,ok:false,reason:'No existe un hueco contiguo suficientemente grande (fragmentación externa)'});
          log.push({type:'error',text:`✘ ${f.name} → sin hueco contiguo ≥ ${f.blocks} bloques disponible`});
        }
      });
    } else if(method==='linked'){
      log.push({type:'header',text:'═══ ASIGNACIÓN ENLAZADA (bloques libres cualquiera, ligados con punteros) ═══'});
      files.forEach(f=>{
        const free=freeIndices();
        if(free.length<f.blocks){
          allocInfo.push({file:f,ok:false,reason:`Solo hay ${free.length} bloques libres, se requieren ${f.blocks}`});
          log.push({type:'error',text:`✘ ${f.name} → solo ${free.length} bloques libres (necesita ${f.blocks})`});
          return;
        }
        const chosen=free.slice(0,f.blocks);
        chosen.forEach((b,idx)=>{ownerOf[b]=f.id;blockType[b]='data';nextPtr[b]=idx<chosen.length-1?chosen[idx+1]:'EOF';});
        chainOf[f.id]=chosen;
        allocInfo.push({file:f,ok:true,blocksUsed:chosen});
        log.push({type:'alloc',text:`✔ ${f.name} → cadena ${chosen.join(' → ')} → EOF`});
      });
    } else if(method==='indexed'){
      log.push({type:'header',text:'═══ ASIGNACIÓN INDEXADA (1 bloque índice + N bloques de datos) ═══'});
      files.forEach(f=>{
        const free=freeIndices();
        const needed=f.blocks+1;
        if(free.length<needed){
          allocInfo.push({file:f,ok:false,reason:`Se necesitan ${needed} bloques (incluye índice), solo hay ${free.length} libres`});
          log.push({type:'error',text:`✘ ${f.name} → solo ${free.length} bloques libres (necesita ${needed}, incl. índice)`});
          return;
        }
        const idxBlock=free[0];
        const dataBlocks=free.slice(1,1+f.blocks);
        ownerOf[idxBlock]=f.id;blockType[idxBlock]='index';
        dataBlocks.forEach(b=>{ownerOf[b]=f.id;blockType[b]='data';});
        indexPtrs[f.id]={index:idxBlock,data:dataBlocks};
        allocInfo.push({file:f,ok:true,blocksUsed:[idxBlock,...dataBlocks],indexBlock:idxBlock,dataBlocks});
        log.push({type:'alloc',text:`✔ ${f.name} → bloque índice [${idxBlock}] apunta a datos [${dataBlocks.join(', ')}]`});
      });
    }

    const holes=method==='contig'?freeRuns().filter(r=>r.length>0):[];
    const freeCount=freeIndices().length;
    log.push({type:'finish',text:`─── Fin de la simulación: ${allocInfo.filter(a=>a.ok).length}/${files.length} archivos asignados, ${freeCount} bloques libres de ${totalBlocks} ───`});
    return {ownerOf,blockType,nextPtr,indexPtrs,chainOf,rangeOf,allocInfo,log,holes,freeCount,totalBlocks};
  }

  /* ─────────── RENDER ─────────── */
  function run(){
    if(!files.length){alert('Agrega al menos un archivo.');return;}
    const totalBlocks=Math.max(4,+document.getElementById('disk-total-blocks').value||40);
    const blockSize=Math.max(1,+document.getElementById('disk-block-size').value||4);
    const fArr=files.map(f=>({...f,blocks:Math.max(1,+f.blocks||1)}));
    result=allocate(method,fArr,totalBlocks);
    result.blockSize=blockSize;result.files=fArr;result.method=method;

    document.getElementById('disk-empty-state').style.display='none';
    document.getElementById('disk-result-content').style.display='flex';

    const used=totalBlocks-result.freeCount;
    const usagePct=(used/totalBlocks*100).toFixed(1);
    const ok=result.allocInfo.filter(a=>a.ok).length;
    const overhead=method==='indexed'?ok:0;
    const methodName={contig:'Contigua',linked:'Enlazada',indexed:'Indexada'}[method];

    document.getElementById('d-m-method').textContent=methodName;
    document.getElementById('d-m-usage').textContent=usagePct+'%';
    document.getElementById('d-m-usage-bar').style.width=usagePct+'%';
    document.getElementById('d-m-usage-bar').style.background=usagePct>85?'var(--red)':usagePct>60?'var(--amber)':'var(--green)';
    document.getElementById('d-m-free').textContent=result.freeCount+' / '+totalBlocks;
    document.getElementById('d-m-holes').textContent=method==='contig'?result.holes.length:'—';
    document.getElementById('d-m-ok').textContent=ok+' / '+fArr.length;
    document.getElementById('d-m-overhead').textContent=method==='indexed'?overhead+' bloq.':(method==='linked'?'punteros':'0');

    document.getElementById('disk-usage-label').textContent=usagePct+'% ('+used+'/'+totalBlocks+' bloques)';
    document.getElementById('disk-usage-bar').style.width=usagePct+'%';

    renderGrid();
    renderLegend();
    renderTableTab();
    renderDetail();
    renderLog();
  }

  function renderGrid(){
    const grid=document.getElementById('disk-grid');
    const colorIdx={};result.files.forEach((f,i)=>colorIdx[f.id]=i);
    let html='';
    for(let b=0;b<result.totalBlocks;b++){
      const owner=result.ownerOf[b];
      if(owner===null){
        html+=`<div class="dblock free" title="Bloque ${b}: libre"><span class="db-idx">${b}</span>·</div>`;
      }else{
        const f=result.files.find(x=>x.id===owner);
        const type=result.blockType[b];
        const color=pcolor(colorIdx[owner]);
        let label=type==='index'?'IDX':(f?f.name.slice(0,3).toUpperCase():'?');
        let tip=`Bloque ${b}: ${f?f.name:owner} (${type==='index'?'bloque índice':'dato'})`;
        if(method==='linked'&&type==='data'){const np=result.nextPtr[b];tip+=np==='EOF'?' · siguiente: EOF':` · siguiente: bloque ${np}`;}
        if(type==='index'){tip+=` · apunta a: ${result.indexPtrs[owner].data.join(', ')}`;}
        html+=`<div class="dblock ${type==='index'?'index':''}" style="background:${color}" title="${tip}"><span class="db-idx">${b}</span>${label}</div>`;
      }
    }
    grid.innerHTML=html;
  }

  function renderLegend(){
    const leg=document.getElementById('disk-legend');
    leg.innerHTML=result.files.map((f,i)=>{
      const info=result.allocInfo.find(a=>a.file.id===f.id);
      const ok=info&&info.ok;
      return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px">
        <span style="width:11px;height:11px;border-radius:3px;background:${pcolor(i)};display:inline-block"></span>
        ${f.name} (${f.blocks} bloq.) ${ok?'':'<span class="disk-file-waiting">— en espera</span>'}
      </span>`;
    }).join('') + `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--text3)">
        <span style="width:11px;height:11px;border-radius:3px;border:1px dashed var(--border2);display:inline-block"></span> Libre</span>`;
  }

  function renderTableTab(){
    const tb=document.getElementById('disk-sum-tbody');
    tb.innerHTML=result.allocInfo.map(a=>{
      const f=a.file;
      let loc='—';
      if(a.ok){
        if(method==='contig')loc=`[${result.rangeOf[f.id].start}‑${result.rangeOf[f.id].end}]`;
        else if(method==='linked')loc=result.chainOf[f.id].join('→')+'→EOF';
        else if(method==='indexed')loc=`Índice:${result.indexPtrs[f.id].index} → Datos:[${result.indexPtrs[f.id].data.join(', ')}]`;
      }
      return `<tr>
        <td>${f.name}</td>
        <td class="center">${f.blocks}${method==='indexed'&&a.ok?' (+1 índice)':''}</td>
        <td class="center">${f.blocks*result.blockSize} KB</td>
        <td>${loc}</td>
        <td class="center" style="color:${a.ok?'var(--green)':'var(--red)'}">${a.ok?'✔ Asignado':'✘ En espera'}</td>
      </tr>`;
    }).join('');
    const ok=result.allocInfo.filter(a=>a.ok).length;
    document.getElementById('disk-sum-tfoot').innerHTML=`<tr><td colspan="4">Total: ${result.files.length} archivo(s)</td><td class="center">${ok} asignados</td></tr>`;
  }

  function renderDetail(){
    const box=document.getElementById('disk-detail-content');
    const colorIdx={};result.files.forEach((f,i)=>colorIdx[f.id]=i);
    if(method==='contig'){
      let html=`<div class="panel" style="padding:.7rem .9rem;margin-bottom:.8rem">
        <div class="panel-hdr" style="margin-bottom:.5rem"><span class="panel-dot" style="background:var(--red)"></span><span class="panel-title">Huecos libres (Fragmentación Externa)</span></div>`;
      if(!result.holes.length){
        html+=`<p style="font-size:12px;color:var(--text3)">No quedan huecos libres en el disco.</p>`;
      }else{
        html+=result.holes.map(h=>`<div class="hole-row"><span>Bloques [${h.start}‑${h.start+h.length-1}]</span><span style="color:var(--amber)">${h.length} bloque(s) libre(s)</span></div>`).join('');
      }
      html+=`</div>`;
      const waiting=result.allocInfo.filter(a=>!a.ok);
      if(waiting.length){
        html+=`<div class="panel" style="padding:.7rem .9rem">
          <div class="panel-hdr" style="margin-bottom:.5rem"><span class="panel-dot" style="background:var(--red)"></span><span class="panel-title">Archivos en espera</span></div>
          ${waiting.map(a=>`<div class="hole-row"><span>${a.file.name} (${a.file.blocks} bloq.)</span><span class="disk-file-waiting">${a.reason}</span></div>`).join('')}
        </div>`;
      }
      box.innerHTML=html;
    } else if(method==='linked'){
      box.innerHTML=result.allocInfo.map(a=>{
        const f=a.file;
        if(!a.ok)return `<div class="chain-file"><div class="chain-file-hdr"><span style="color:var(--red)">✘ ${f.name}</span></div><div style="font-size:11px;color:var(--red)">${a.reason}</div></div>`;
        const chain=result.chainOf[f.id];
        const color=pcolor(colorIdx[f.id]);
        const flow=chain.map(b=>`<span class="chain-node" style="background:${color}">${b}</span>`).join('<span class="chain-arrow">→</span>');
        return `<div class="chain-file">
          <div class="chain-file-hdr"><span style="width:10px;height:10px;border-radius:3px;background:${color};display:inline-block"></span>${f.name} <span style="color:var(--text3);font-weight:400">(${f.blocks} bloques)</span></div>
          <div class="chain-flow">${flow}<span class="chain-arrow">→</span><span class="chain-eof">EOF</span></div>
        </div>`;
      }).join('');
    } else if(method==='indexed'){
      box.innerHTML=result.allocInfo.map(a=>{
        const f=a.file;
        if(!a.ok)return `<div class="index-file"><div class="index-file-hdr"><span style="color:var(--red)">✘ ${f.name}</span></div><div style="font-size:11px;color:var(--red)">${a.reason}</div></div>`;
        const color=pcolor(colorIdx[f.id]);
        const ip=result.indexPtrs[f.id];
        return `<div class="index-file">
          <div class="index-file-hdr"><span style="width:10px;height:10px;border-radius:3px;background:${color};display:inline-block"></span>${f.name} <span style="color:var(--text3);font-weight:400">(${f.blocks} bloques + 1 índice)</span></div>
          <span class="index-block-tag">🗂 Bloque índice: ${ip.index}</span>
          <div class="index-ptrs">${ip.data.map(b=>`<span class="index-ptr" style="background:${color}">${b}</span>`).join('')}</div>
        </div>`;
      }).join('');
    }
  }

  function renderLog(){
    document.getElementById('disk-log-box').innerHTML=result.log.map(l=>`<div class="log-line ${l.type}">${l.text}</div>`).join('');
  }

  function switchTab(name,btn){
    document.querySelectorAll('#disk-result-panel .tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('#disk-result-panel .tab-panel').forEach(p=>p.classList.remove('active'));
    if(btn)btn.classList.add('active');
    document.getElementById('disk-tab-'+name).classList.add('active');
  }

  function copyLog(){
    if(!result)return;
    const text=result.log.map(l=>l.text).join('\n');
    navigator.clipboard.writeText(text).then(()=>{},()=>{});
  }
  function downloadLog(){
    if(!result)return;
    const blob=new Blob([result.log.map(l=>l.text).join('\n')],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='log_asignacion_disco.txt';a.click();
  }

  renderTable();

  return {files,selectMethod,addFile,delFile,clearAll,loadDefault,loadCSV,run,switchTab,copyLog,downloadLog};
})();

/* ═══════════════════════════════════════════════════════════════
   EXTRAS
═══════════════════════════════════════════════════════════════ */
function toggleDarkLight(){
  const btn=document.getElementById('theme-btn');
  document.body.style.filter=document.body.style.filter?'':'brightness(1.1) contrast(.96)';
  btn.textContent=document.body.style.filter?'🌙 Oscuro':'☀ Claro';
}

function exportReport(){
  const lines=['# REPORTE — SIS-215 Simulador SO v5','','## Resultados almacenados',''];
  Object.entries(storedResults).forEach(([k,r])=>{
    lines.push(`### ${r.algo}`);lines.push(`- Procesos: ${r.n}`);
    lines.push(`- TR̄ Promedio: ${r.avgTR}`);lines.push(`- TĒ Promedio: ${r.avgTE}`);lines.push('');
  });
  if(!Object.keys(storedResults).length){lines.push('(Sin resultados. Ejecuta simulaciones primero.)');}
  const blob=new Blob([lines.join('\n')],{type:'text/markdown'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reporte_sis215.md';a.click();
}

window.addEventListener('resize',()=>{setTimeout(()=>compare.refresh(),100);});

