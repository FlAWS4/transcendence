const copy = {
 fr:{country:'Pays',campus:'Campus',allCountries:'Tous les pays',allCampuses:'Tous les campus'},
 en:{country:'Country',campus:'Campus',allCountries:'All countries',allCampuses:'All campuses'},
 ar:{country:'الدولة',campus:'الفرع',allCountries:'جميع الدول',allCampuses:'جميع الفروع'},
};
let nextId = 0;

/** Two native, immediately applied selectors; the owner controls its dialog. */
export function mountScopeSelectors({container,locale='fr',countries,campuses,scope={},countryName,onSelect}) {
 const language=copy[locale]?locale:'fr',text=copy[language],doc=container.ownerDocument;
 const collator=new Intl.Collator(language),countryById=new Map(countries.map(country=>[country.id,country]));
 const campusById=new Map(campuses.map(campus=>[campus.id,campus]));
 const nameOfCountry=id=>countryName?.(id)||countryById.get(id)?.name||id;
 let selectedCampus=campusById.get(scope.campus)||null;
 let selectedCountry=selectedCampus?.country||(countryById.has(scope.country)?scope.country:null);
 const root=doc.createElement('div');root.className='scope-selectors';root.lang=language;root.dir=language==='ar'?'rtl':'ltr';
 const prefix=`scope-selectors-${++nextId}`;
 function field(name,labelText){
  const wrapper=doc.createElement('div');wrapper.className='scope-field';
  const label=doc.createElement('label');label.htmlFor=`${prefix}-${name}`;label.textContent=labelText;
  const select=doc.createElement('select');select.id=label.htmlFor;select.name=name;
  wrapper.append(label,select);root.append(wrapper);return select;
 }
 function option(select,value,label){
  const item=doc.createElement('option');item.value=value;item.textContent=label;item.dir='auto';select.append(item);
 }
 const countrySelect=field('country',text.country),campusSelect=field('campus',text.campus);
 option(countrySelect,'',text.allCountries);
 [...countries].sort((a,b)=>collator.compare(nameOfCountry(a.id),nameOfCountry(b.id))).forEach(country=>{
  option(countrySelect,country.id,nameOfCountry(country.id));
 });
 countrySelect.value=selectedCountry||'';
 function renderCampuses(){
  campusSelect.replaceChildren();
  option(campusSelect,'',selectedCountry?`${text.allCampuses} · ${nameOfCountry(selectedCountry)}`:text.allCampuses);
  campuses.filter(campus=>!selectedCountry||campus.country===selectedCountry)
   .sort((a,b)=>collator.compare(a.name,b.name)||collator.compare(nameOfCountry(a.country),nameOfCountry(b.country)))
   .forEach(campus=>option(campusSelect,campus.id,selectedCountry?campus.name:`${campus.name} — ${nameOfCountry(campus.country)}`));
  campusSelect.value=selectedCampus?.id||'';
 }
 function countryChanged(){
  selectedCountry=countrySelect.value||null;selectedCampus=null;renderCampuses();
  onSelect({country:selectedCountry,campus:null});
 }
 function campusChanged(){
  selectedCampus=campusById.get(campusSelect.value)||null;
  if(selectedCampus){selectedCountry=selectedCampus.country;countrySelect.value=selectedCountry;renderCampuses();}
  onSelect({country:selectedCountry,campus:selectedCampus?.id||null});
 }
 renderCampuses();container.append(root);
 countrySelect.addEventListener('change',countryChanged);campusSelect.addEventListener('change',campusChanged);
 return {countrySelect,campusSelect,destroy(){
  countrySelect.removeEventListener('change',countryChanged);campusSelect.removeEventListener('change',campusChanged);root.remove();
 }};
}
