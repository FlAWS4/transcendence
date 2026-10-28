// Select only URLs observed in the official sites. Never synthesize locale paths.
const httpsURL = value => {
 try { const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null; }
 catch { return null; }
};
const languageCode = value => {const code=typeof value==='string'?value.toLowerCase().split(/[-_]/)[0]:'';return /^[a-z]{2,3}$/.test(code)?code:null;};

export function resolveCampusWebsite(campus,locale='fr'){
 const requested=languageCode(locale)||'fr';
 const versions=campus.websiteLocales||{};
 const defaultLanguage=languageCode(versions.defaultLanguage)||(!campus.websiteUrl&&campus.sourceUrl?'en':null);
 const defaultUrl=versions.defaultUrl||campus.websiteUrl||campus.sourceUrl;
 const local=versions.locales||{};
 const manual=(versions.manualLocales||[]).map(languageCode);
 const candidates=[
  {url:local[requested],language:requested},
  ...(defaultLanguage===requested?[{url:defaultUrl,language:requested}]:[]),
  {url:local.en,language:'en'},
  {url:defaultUrl,language:defaultLanguage},
  {url:campus.websiteUrl,language:null},
  {url:campus.sourceUrl,language:'en',kind:'network-profile'},
 ];
 for(const candidate of candidates){
  const url=httpsURL(candidate.url);if(!url)continue;
  const manualLanguage=candidate.language!==requested&&manual.includes(requested)?requested:candidate.language!==requested&&candidate.language!=='en'&&manual.includes('en')?'en':null;
  return {url,language:candidate.language,isFallback:candidate.language!==requested,...(manualLanguage?{manualLanguage}:{}),
   kind:candidate.kind||(!campus.websiteUrl?'network-profile':'campus-site')};
 }
 return null;
}
