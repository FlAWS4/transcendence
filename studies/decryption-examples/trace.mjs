import { transitionAt } from './shared.mjs';
import { graphicStage } from './graphic-stage.mjs';
import { contourLibrary, contourPairs } from './ink-contours.mjs';

export function mount({root,model}) {
  const contours = contourLibrary();
  const pairs = [];
  return graphicStage(root, model, ({ctx,scale,cells,time,colors,states}) => {
    cells.forEach(({index,x,y}) => {
      const change = transitionAt(time,index);
      const key = `${change.from.type}:${change.from.text}:${change.to.type}:${change.to.text}`;
      if (pairs[index]?.key !== key) pairs[index] = {key, curves:contourPairs(contours(change.from),contours(change.to))};
      const p = change.progress * change.progress * (3 - 2 * change.progress);
      ctx.save(); ctx.translate(x - 50 * scale, y - 70 * scale); ctx.scale(scale, scale);
      ctx.beginPath();
      for (const {from,to} of pairs[index].curves) {
        const points = from.map((a,i) => ({x:a.x+(to[i].x-a.x)*p,y:a.y+(to[i].y-a.y)*p}));
        const first=points[0], last=points.at(-1);
        ctx.moveTo((first.x+last.x)/2,(first.y+last.y)/2);
        points.forEach((point,i) => { const next=points[(i+1)%points.length]; ctx.quadraticCurveTo(point.x,point.y,(point.x+next.x)/2,(point.y+next.y)/2); });
        ctx.closePath();
      }
      ctx.strokeStyle = states[index].phase === 'decrypting' ? colors.accent : colors.ink;
      ctx.lineWidth = Math.max(1.5, 1 / scale); ctx.lineJoin='round'; ctx.stroke(); ctx.restore();
    });
  });
}
