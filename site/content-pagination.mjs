// Profiles have denser cards; filtering and sorting still happen before slicing.
export const CONTENT_PAGE_SIZE=12;
export const PROFILE_PAGE_SIZE=24;

export function normalizeContentPage(value){
 if(typeof value==='number')return Number.isSafeInteger(value)&&value>0?value:1;
 if(typeof value!=='string'||!/^\d+$/.test(value))return 1;
 const page=Number(value);
 return Number.isSafeInteger(page)&&page>0?page:1;
}

export function paginateContentEntries(entries,page=1,section=entries[0]?.section){
 // A publication shared by campuses still occupies one place in the list.
 const seen=new Set(),unique=entries.filter(entry=>{if(seen.has(entry.id))return false;seen.add(entry.id);return true;});
 const size=section==='people'?PROFILE_PAGE_SIZE:CONTENT_PAGE_SIZE;
 const total=unique.length,pageCount=Math.ceil(total/size);
 const currentPage=Math.min(normalizeContentPage(page),Math.max(1,pageCount));
 const offset=(currentPage-1)*size;
 return {items:unique.slice(offset,offset+size),page:currentPage,pageCount,total,from:total?offset+1:0,to:Math.min(offset+size,total)};
}

export function contentPageNumbers(page,pageCount){
 if(pageCount<1)return [];
 if(pageCount<=5)return Array.from({length:pageCount},(_,i)=>i+1);
 const current=Math.min(normalizeContentPage(page),pageCount),numbers=new Set([1,pageCount]);
 const start=current<=2?2:current>=pageCount-1?pageCount-2:current-1;
 const end=current<=2?3:current>=pageCount-1?pageCount-1:current+1;
 for(let value=start;value<=end;value++)numbers.add(value);
 const ordered=[...numbers].sort((a,b)=>a-b),result=[];
 for(const value of ordered){
  const previous=result.at(-1);
  if(previous&&value-previous>1)result.push(null);
  result.push(value);
 }
 return result;
}
