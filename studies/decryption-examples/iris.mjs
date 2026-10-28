import { representation } from './shared.mjs';
import { graphicStage, drawInk } from './graphic-stage.mjs';

export function mount({root,model}) {
  return graphicStage(root,model,({ctx,scale,cells,colors,time,states}) => {
    cells.forEach(({index,x,y}) => {
      const state=states[index], change=representation(state);
      const active=!change.settled;
      const p=change.progress;
      const closure=active ? Math.sin(Math.PI*p)**2 : 0;
      const radius=55*(1-closure);
      const face=p<.5 ? change.from : change.to;
      ctx.save(); ctx.translate(x-50*scale,y-70*scale); ctx.scale(scale,scale);
      ctx.save(); ctx.beginPath(); ctx.arc(50,70,radius,0,Math.PI*2); ctx.clip();
      ctx.fillStyle=state.phase==='decrypting'?colors.accent:colors.ink;
      ctx.save(); ctx.translate(50,70); ctx.scale(.8,.8); ctx.translate(-50,-70); drawInk(ctx,face); ctx.restore(); ctx.restore();
      // Each diaphragm blade is a moving curved boundary, not an opacity mask.
      for(let blade=0;blade<8;blade++) {
        const angle=blade*Math.PI/4 + closure*.6;
        const a={x:50+Math.cos(angle)*49,y:70+Math.sin(angle)*49};
        const b={x:50+Math.cos(angle+.9)*radius,y:70+Math.sin(angle+.9)*radius};
        const c={x:50+Math.cos(angle+1.4)*49,y:70+Math.sin(angle+1.4)*49};
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(b.x,b.y,c.x,c.y);
        ctx.strokeStyle=active?colors.accent:colors.border;ctx.lineWidth=1.4;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(50,70,49,0,Math.PI*2);ctx.strokeStyle=colors.border;ctx.lineWidth=1;ctx.stroke();
      if(state.phase==='decrypting') {
        const start=(time/200)% (Math.PI*2);ctx.beginPath();ctx.arc(50,70,49,start,start+Math.PI*.5);ctx.strokeStyle=colors.accent;ctx.lineWidth=2;ctx.stroke();
      }
      ctx.restore();
    });
  });
}
