import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCampusWebsite} from './campus-website.mjs';
const campus={websiteUrl:'https://campus.example/',sourceUrl:'https://network.example/campus/',websiteLocales:{defaultUrl:'https://campus.example/ja/',defaultLanguage:'ja',locales:{fr:'https://campus.example/fr/',en:'https://campus.example/en/'}}};
test('the selected language takes precedence over English and local',()=>assert.equal(resolveCampusWebsite(campus,'fr-FR').url,'https://campus.example/fr/'));
test('an unavailable Arabic version falls back to a verified English URL',()=>assert.deepEqual(resolveCampusWebsite(campus,'ar'),{url:'https://campus.example/en/',language:'en',isFallback:true,kind:'campus-site'}));
test('without English the verified local version is kept',()=>assert.equal(resolveCampusWebsite({...campus,websiteLocales:{...campus.websiteLocales,locales:{}}},'ar').language,'ja'));
test('a default page in the selected language precedes translated English',()=>assert.equal(resolveCampusWebsite({...campus,websiteLocales:{...campus.websiteLocales,defaultUrl:'https://campus.example/',defaultLanguage:'fr',locales:{en:'https://campus.example/en/'}}},'fr').url,'https://campus.example/'));
test('unsafe locale links are skipped, never turned into invented paths',()=>assert.equal(resolveCampusWebsite({...campus,websiteLocales:{...campus.websiteLocales,locales:{ar:'javascript:alert(1)',en:'http://campus.example/en/'}}},'ar').url,'https://campus.example/ja/'));
test('a campus without a published site retains its official network profile',()=>assert.equal(resolveCampusWebsite({sourceUrl:'https://network.example/campus/'},'ar').kind,'network-profile'));
test('no valid URL leaves the link absent',()=>assert.equal(resolveCampusWebsite({websiteUrl:'https://user:pass@example.com',sourceUrl:'no-url'},'en'),null));

test('English requiring a site menu is disclosed instead of fabricating a locale URL',()=>{const result=resolveCampusWebsite({...campus,websiteLocales:{defaultUrl:'https://campus.example/',defaultLanguage:'pt',locales:{},manualLocales:['en']}},'fr');assert.equal(result.url,'https://campus.example/');assert.equal(result.manualLanguage,'en');});
