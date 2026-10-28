// One shared limit for all three discovery lists; filtering and sorting happen first.
export const CONTENT_PAGE_SIZE=12;

export function normalizeContentPage(value){
 if(typeof value==='number')return Number.isSafeInteger(value)&&value>0?value:1;
 if(typeof value!=='string'||!/^\d+$/.test(value))return 1;
 const page=Number(value);
 return Number.isSafeInteger(page)&&page>0?page:1;
}

export function paginateContentEntries(entries,page=1){
 // A publication shared by campuses still occupies one place in the list.
 const seen=new Set(),unique=entries.filter(entry=>{if(seen.has(entry.id))return false;seen.add(entry.id);return true;});
 const total=unique.length,pageCount=Math.ceil(total/CONTENT_PAGE_SIZE);
 const currentPage=Math.min(normalizeContentPage(page),Math.max(1,pageCount));
 const offset=(currentPage-1)*CONTENT_PAGE_SIZE;
 return {items:unique.slice(offset,offset+CONTENT_PAGE_SIZE),page:currentPage,pageCount,total,from:total?offset+1:0,to:Math.min(offset+CONTENT_PAGE_SIZE,total)};
}

export function contentPageNumbers(page,pageCount){
 if(pageCount<1)return [];
 if(pageCount<=7)return Array.from({length:pageCount},(_,i)=>i+1);
 const current=Math.min(normalizeContentPage(page),pageCount),numbers=new Set([1,pageCount]);
 const start=current<=4?2:current>=pageCount-3?pageCount-4:current-1;
 const end=current<=4?5:current>=pageCount-3?pageCount-1:current+1;
 for(let value=start;value<=end;value++)numbers.add(value);
 const ordered=[...numbers].sort((a,b)=>a-b),result=[];
 for(const value of ordered){
  const previous=result.at(-1);
  if(previous&&value-previous>1)result.push(null);
  result.push(value);
 }
 return result;
}
