import {plan} from './entrance-sync-plan.mjs';
import {refineEntrance} from './entrance-sync-refine.mjs';

const format=process.argv[2];
if(!['desktop','mobile'].includes(format))throw new Error('Usage: node entrance-sync-build.mjs desktop|mobile');
// The entrance already exists. Refine it additively and retain historical layers.
// Initial construction in entrance-sync-apply.mjs is a historical transaction.
const compactPlan={timing:plan.timing,formats:plan.formats,cells:plan.cells.map(({index,clear,rank})=>({index,clear,rank}))};
process.stdout.write(JSON.stringify({
 fileKey:'yFrdllVm6nrKZJ2c99MMjT',
 skillNames:'figma-use,figma-generate-design,figma-use-motion',
 description:`Synchroniser l’entrée n°22 et les transitions ${format} depuis le site`,
 code:`const plan=${JSON.stringify(compactPlan)};\n${refineEntrance.toString()}\nreturn await refineEntrance(plan,${JSON.stringify(format)});`,
}));
