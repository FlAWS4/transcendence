import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mountScopeSelectors} from './scope-selectors.mjs';

class Element extends EventTarget {
 constructor(tagName,ownerDocument){super();this.tagName=tagName;this.ownerDocument=ownerDocument;this.children=[];this.value='';}
 append(...children){for(const child of children){child.parentElement=this;this.children.push(child);}}
 replaceChildren(...children){this.children=[];this.append(...children);}
 remove(){this.parentElement.children=this.parentElement.children.filter(child=>child!==this);}
}
const countries=[{id:'FRA',name:'France'},{id:'ITA',name:'Italie'}];
const campuses=[{id:'roma',name:'42 Roma',country:'ITA'},{id:'paris',name:'42 Paris',country:'FRA'},{id:'lyon',name:'42 Lyon',country:'FRA'}];
function fixture(options={}){
 const doc={createElement:tag=>new Element(tag,doc)},container=doc.createElement('div'),selections=[];
 const controls=mountScopeSelectors({container,locale:'fr',countries,campuses,scope:{},countryName:id=>countries.find(country=>country.id===id)?.name,onSelect:value=>selections.push(value),...options});
 return {container,selections,...controls};
}
const change=(select,value)=>{select.value=value;select.dispatchEvent(new Event('change'));};
const values=select=>select.children.map(option=>option.value);

test('world scope has exactly two native labelled selectors and disambiguated campus options',()=>{
 const f=fixture(),root=f.container.children[0];
 assert.equal(root.children.length,2);assert.deepEqual(values(f.countrySelect),['','FRA','ITA']);
 assert.deepEqual(values(f.campusSelect),['','lyon','paris','roma']);
 assert.equal(f.countrySelect.children[0].textContent,'Tous les pays');
 assert.equal(f.campusSelect.children[0].textContent,'Tous les campus');
 assert.equal(f.campusSelect.children[3].textContent,'42 Roma — Italie');
 for(const field of root.children){assert.equal(field.children[0].htmlFor,field.children[1].id);assert.equal(field.children[1].tagName,'select');}
 assert.deepEqual(f.selections,[]);
});

test('changing country clears the selected campus, immediately applies the country and keeps controls mounted',()=>{
 const f=fixture({scope:{country:'FRA',campus:'paris'}});
 change(f.countrySelect,'ITA');
 assert.equal(f.campusSelect.value,'');assert.deepEqual(values(f.campusSelect),['','roma']);
 assert.equal(f.campusSelect.children[0].textContent,'Tous les campus · Italie');
 assert.deepEqual(f.selections,[{country:'ITA',campus:null}]);
 assert.equal(f.container.children.length,1);assert.equal(f.campusSelect.parentElement.parentElement,f.container.children[0]);
});

test('a campus chosen globally infers its country and keeps the chosen campus selected',()=>{
 const f=fixture();change(f.campusSelect,'paris');
 assert.equal(f.countrySelect.value,'FRA');assert.equal(f.campusSelect.value,'paris');
 assert.deepEqual(values(f.campusSelect),['','lyon','paris']);
 assert.deepEqual(f.selections,[{country:'FRA',campus:'paris'}]);
});

test('all campuses retains the country, while all countries clears both and restores the full campus list',()=>{
 const f=fixture({scope:{country:'ITA',campus:'roma'}});
 change(f.campusSelect,'');assert.deepEqual(f.selections.at(-1),{country:'ITA',campus:null});
 change(f.countrySelect,'');assert.deepEqual(f.selections.at(-1),{country:null,campus:null});
 assert.deepEqual(values(f.campusSelect),['','lyon','paris','roma']);assert.equal(f.campusSelect.value,'');
});

test('initial campus determines a coherent country without emitting a selection',()=>{
 const f=fixture({scope:{country:'ITA',campus:'lyon'}});
 assert.equal(f.countrySelect.value,'FRA');assert.equal(f.campusSelect.value,'lyon');assert.deepEqual(f.selections,[]);
 const empty=fixture({scope:{country:'missing',campus:'missing'}});
 assert.equal(empty.countrySelect.value,'');assert.equal(empty.campusSelect.value,'');
});

test('English and Arabic labels, direction and unique label associations work across simultaneous mounts',()=>{
 const en=fixture({locale:'en'}),ar=fixture({locale:'ar'});
 assert.equal(en.container.children[0].dir,'ltr');assert.equal(ar.container.children[0].dir,'rtl');
 assert.equal(en.countrySelect.parentElement.children[0].textContent,'Country');
 assert.equal(ar.countrySelect.parentElement.children[0].textContent,'الدولة');
 assert.equal(ar.campusSelect.parentElement.children[0].textContent,'الفرع');
 assert.equal(en.countrySelect.children[0].textContent,'All countries');assert.equal(ar.countrySelect.children[0].textContent,'جميع الدول');
 assert.notEqual(en.countrySelect.id,ar.countrySelect.id);
});

test('mounting and selecting do not reorder or mutate the shared data or incoming scope',()=>{
 const scope={country:'FRA',campus:'paris'},before=JSON.stringify({countries,campuses,scope});
 const f=fixture({scope});change(f.countrySelect,'ITA');
 assert.equal(JSON.stringify({countries,campuses,scope}),before);
});

test('destroy removes controls and their selection listeners',()=>{
 const f=fixture();f.destroy();change(f.countrySelect,'FRA');
 assert.equal(f.container.children.length,0);assert.deepEqual(f.selections,[]);
});

test('the real network fits in the campus selector without losing or duplicating campuses',()=>{
 const network=JSON.parse(readFileSync(new URL('./campuses.json',import.meta.url),'utf8'));
 const f=fixture({countries:network.countries,campuses:network.campuses,countryName:id=>network.countries.find(country=>country.id===id)?.name});
 const ids=values(f.campusSelect).slice(1);
 assert.equal(ids.length,network.campuses.length);assert.equal(new Set(ids).size,network.campuses.length);
 assert.deepEqual([...ids].sort(),network.campuses.map(campus=>campus.id).sort());
});
