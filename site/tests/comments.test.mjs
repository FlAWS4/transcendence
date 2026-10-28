import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCommentsState,updateCommentsState,insertCommentEmoji,resolveCommentAuthor,sortCommentThreads,COMMENT_LIMIT} from '../comments.mjs';
import {updateCommentMentions} from '../comment-mentions.mjs';

const created=Date.parse('2026-10-10T12:00:00Z');
const add=(state,id,text,replyToId=null)=>updateCommentsState(state,{type:'add',id,text,replyToId,created});
const get=(state,id)=>state.comments.find(item=>item.id===id);

test('comment sorting migrates to newest and persists with the same drafts and thread data',()=>{
 let state=add({},'parent','Texte inchangé');state=updateCommentsState(state,{type:'draft',text:'Brouillon principal'});state=updateCommentsState(state,{type:'reply-draft',threadId:'parent',targetId:'parent',text:'Brouillon réponse'});
 const original=structuredClone(state);assert.equal(state.sort,'newest');
 for(const sort of ['oldest','popular','newest']){
  state=updateCommentsState(state,{type:'sort',value:sort});state=normalizeCommentsState(JSON.parse(JSON.stringify(state)));assert.equal(state.sort,sort);assert.deepEqual(state.comments,original.comments);assert.equal(state.draft,original.draft);assert.deepEqual(state.replyDrafts,original.replyDrafts);
 }
 assert.equal(normalizeCommentsState({sort:'unknown'}).sort,'newest');assert.equal(updateCommentsState(state,{type:'sort',value:null}).sort,'newest');
});

test('thread order uses dates or local likes with recent ties, never reorders the input or promotes replies',()=>{
 let state=add({},'old','Ancien');state=updateCommentsState(state,{type:'add',id:'middle',text:'Milieu',created:created+10});state=updateCommentsState(state,{type:'add',id:'recent',text:'Récent',created:created+20});state=updateCommentsState(state,{type:'add',id:'reply',text:'Réponse',replyToId:'old',created:created+30});
 state=updateCommentsState(state,{type:'react',id:'old',reaction:'like'});state=updateCommentsState(state,{type:'react',id:'middle',reaction:'like'});state=updateCommentsState(state,{type:'react',id:'reply',reaction:'like'});
 const original=structuredClone(state.comments),ids=mode=>sortCommentThreads(state.comments,mode).map(item=>item.id);
 assert.deepEqual(ids('newest'),['recent','middle','old']);assert.deepEqual(ids('oldest'),['old','middle','recent']);assert.deepEqual(ids('popular'),['middle','old','recent']);assert.deepEqual(ids('invalid'),ids('newest'));assert.deepEqual(state.comments,original);
 state=updateCommentsState(state,{type:'react',id:'middle',reaction:'dislike'});assert.deepEqual(ids('popular'),['old','recent','middle']);
});

test('existing comments and draft survive migration and a JSON round trip',()=>{
 const legacy={draft:'Un brouillon 🙂',comments:[{id:'old',text:'<img src=x> est du texte, et ليس كودًا.',created}]};
 const current=normalizeCommentsState(legacy),restored=normalizeCommentsState(JSON.parse(JSON.stringify(current)));
 assert.equal(current.version,2);assert.equal(current.draft,legacy.draft);
 assert.equal(get(current,'old').text,legacy.comments[0].text);assert.equal(get(current,'old').created,created);
 assert.equal(get(current,'old').parentId,null);assert.equal(get(current,'old').reaction,null);
 assert.deepEqual(restored,current);assert.deepEqual(legacy.comments[0],{id:'old',text:'<img src=x> est du texte, et ليس كودًا.',created});
});

test('replies to replies keep the same thread and retain their target context',()=>{
 let state=add({},'a','Premier commentaire');state=add(state,'b','Première réponse','a');state=add(state,'c','Réponse à la réponse','b');
 assert.equal(get(state,'a').parentId,null);assert.equal(get(state,'b').parentId,'a');assert.equal(get(state,'c').parentId,'a');assert.equal(get(state,'c').replyToId,'b');
 const restored=normalizeCommentsState(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(restored,state);
 const unchanged=add(state,'bad','Réponse à une cible absente','missing');assert.equal(unchanged.comments.length,3);
});

test('reply drafts belong to their thread and sending one leaves every other draft intact',()=>{
 let state=add({},'a','Un fil');state=add(state,'b','Un autre fil');
 state=updateCommentsState(state,{type:'draft',text:'Mon prochain commentaire'});
 state=updateCommentsState(state,{type:'reply-draft',threadId:'a',targetId:'a',text:'Réponse A ✨'});
 state=updateCommentsState(state,{type:'reply-draft',threadId:'b',targetId:'b',text:'Réponse B'});
 state=normalizeCommentsState(JSON.parse(JSON.stringify(state)));
 assert.equal(state.replyDrafts.a.text,'Réponse A ✨');assert.equal(state.replyDrafts.b.text,'Réponse B');
 state=add(state,'reply-a',state.replyDrafts.a.text,'a');
 assert.equal(state.replyDrafts.a,undefined);assert.equal(state.replyDrafts.b.text,'Réponse B');assert.equal(state.draft,'Mon prochain commentaire');
});

test('deleting a parent preserves replies and deleting a reply preserves its siblings and unrelated threads',()=>{
 let state=add({},'a','À supprimer');state=add(state,'b','Réponse conservée','a');state=add(state,'c','Autre réponse conservée','b');state=add(state,'other','Un autre fil');
 state=updateCommentsState(state,{type:'react',id:'a',reaction:'like'});
 state=updateCommentsState(state,{type:'remove',id:'a'});
 assert.equal(state.comments.length,4);assert.equal(get(state,'a').deleted,true);assert.equal(get(state,'a').text,'');assert.equal(get(state,'a').reaction,null);
 assert.equal(get(state,'b').text,'Réponse conservée');assert.equal(get(state,'c').parentId,'a');
 state=updateCommentsState(state,{type:'remove',id:'b'});
 assert.equal(get(state,'b'),undefined);assert.equal(get(state,'c').text,'Autre réponse conservée');assert.equal(get(state,'c').replyToId,'b');assert.equal(get(state,'other').text,'Un autre fil');
 state=normalizeCommentsState(JSON.parse(JSON.stringify(state)));assert.equal(get(state,'a').deleted,true);assert.equal(get(state,'c').parentId,'a');
 state=updateCommentsState(state,{type:'remove',id:'other'});assert.equal(get(state,'other'),undefined);assert.ok(get(state,'c'));
});

test('like and dislike are exclusive, can be cancelled, and remain independent for each message',()=>{
 let state=add({},'a','Commentaire');state=add(state,'b','Réponse','a');
 state=updateCommentsState(state,{type:'react',id:'a',reaction:'like'});assert.equal(get(state,'a').reaction,'like');
 state=updateCommentsState(state,{type:'react',id:'a',reaction:'dislike'});assert.equal(get(state,'a').reaction,'dislike');
 state=updateCommentsState(state,{type:'react',id:'b',reaction:'like'});assert.equal(get(state,'a').reaction,'dislike');assert.equal(get(state,'b').reaction,'like');
 state=normalizeCommentsState(JSON.parse(JSON.stringify(state)));assert.equal(get(state,'b').reaction,'like');
 state=updateCommentsState(state,{type:'react',id:'a',reaction:'dislike'});assert.equal(get(state,'a').reaction,null);assert.equal(get(state,'b').reaction,'like');
 state=updateCommentsState(state,{type:'remove',id:'a'});state=updateCommentsState(state,{type:'react',id:'a',reaction:'like'});assert.equal(get(state,'a').reaction,null);
 const legacy=normalizeCommentsState({comments:[{id:'old',text:'Ancien like',created,liked:true}]});assert.equal(get(legacy,'old').reaction,'like');
});

test('editing a comment or reply preserves identity, initial date, reactions and thread context',()=>{
 let state=add({},'a','Avant');state=add(state,'b','Réponse initiale','a');
 state=updateCommentsState(state,{type:'react',id:'b',reaction:'like'});
 state=updateCommentsState(state,{type:'reply-draft',threadId:'a',targetId:'a',text:'Brouillon à garder'});
 const original=structuredClone(state),editedAt=created+60000;
 state=updateCommentsState(state,{type:'edit',id:'a',text:' Après ✨ ',editedAt});
 state=updateCommentsState(state,{type:'edit',id:'b',text:'Réponse enrichie',editedAt});
 assert.equal(get(state,'a').text,'Après ✨');assert.equal(get(state,'b').text,'Réponse enrichie');
 assert.equal(get(state,'a').created,created);assert.equal(get(state,'b').created,created);assert.equal(get(state,'b').editedAt,editedAt);
 assert.equal(get(state,'b').reaction,'like');assert.equal(get(state,'b').parentId,'a');assert.equal(get(state,'b').replyToId,'a');assert.equal(state.replyDrafts.a.text,'Brouillon à garder');
 assert.equal(get(original,'a').text,'Avant');assert.equal(get(original,'b').text,'Réponse initiale');
 assert.deepEqual(normalizeCommentsState(JSON.parse(JSON.stringify(state))),state);
});

test('empty, oversized and deleted-message edits cannot replace existing text',()=>{
 let state=add({},'a','À conserver');state=add(state,'b','Une réponse','a');
 for(const text of ['', '  ', 'x'.repeat(COMMENT_LIMIT+1)])state=updateCommentsState(state,{type:'edit',id:'a',text,editedAt:created+1000});
 assert.equal(get(state,'a').text,'À conserver');assert.equal(get(state,'a').editedAt,null);
 state=updateCommentsState(state,{type:'remove',id:'a'});state=updateCommentsState(state,{type:'edit',id:'a',text:'Ne pas ressusciter',editedAt:created+1000});
 assert.equal(get(state,'a').deleted,true);assert.equal(get(state,'a').text,'');
});

test('a deleted parent disappears exactly when its final reply is removed, without removing another thread',()=>{
 let state=add({},'a','Un parent');state=add(state,'b','Une réponse','a');state=add(state,'c','Une deuxième','a');state=add(state,'other','Un autre fil');
 state=updateCommentsState(state,{type:'remove',id:'a'});assert.equal(get(state,'a').deleted,true);
 state=updateCommentsState(state,{type:'remove',id:'b'});assert.ok(get(state,'a'));assert.ok(get(state,'c'));
 state=updateCommentsState(state,{type:'remove',id:'c'});assert.equal(get(state,'a'),undefined);assert.deepEqual(state.comments.map(item=>item.id),['other']);
 const migrated=normalizeCommentsState({comments:[{id:'empty',text:'',created,deleted:true},{id:'live',text:'Conservé',created}],replyDrafts:{empty:{text:'Ancien brouillon',targetId:'empty'}}});
 assert.deepEqual(migrated.comments.map(item=>item.id),['live']);assert.deepEqual(migrated.replyDrafts,{});
});

test('emoji insertion replaces the selected text and restores the cursor after the complete emoji',()=>{
 assert.deepEqual(insertCommentEmoji('Bonjour monde','🚀',8,13),{value:'Bonjour 🚀',caret:10,inserted:true});
 assert.deepEqual(insertCommentEmoji('Bonjour','✨',0,0),{value:'✨Bonjour',caret:1,inserted:true});
 assert.deepEqual(insertCommentEmoji('مرحبا','❤️'),{value:'مرحبا❤️',caret:7,inserted:true});
});

test('emoji insertion respects the textarea limit without truncating emoji or losing selected text',()=>{
 const almostFull='x'.repeat(COMMENT_LIMIT-1);
 assert.deepEqual(insertCommentEmoji(almostFull,'🚀'),{value:almostFull,caret:almostFull.length,inserted:false});
 const full='x'.repeat(COMMENT_LIMIT);
 const replaced=insertCommentEmoji(full,'🚀',COMMENT_LIMIT-2,COMMENT_LIMIT);
 assert.equal(replaced.inserted,true);assert.equal(replaced.value.length,COMMENT_LIMIT);assert.ok(replaced.value.endsWith('🚀'));
 assert.equal(insertCommentEmoji(full,'✨',0,0).value,full);
});

test('invalid records, missing parents and cycles cannot conceal otherwise valid message text',()=>{
 const state=normalizeCommentsState({comments:[
  {id:'a',text:'A',created,parentId:'b'},{id:'b',text:'B',created,parentId:'a'},
  {id:'orphan',text:'Conservé',created,parentId:'missing'},
  {id:'a',text:'Doublon',created},{id:'date',text:'Date invalide',created:Infinity},
 ]});
 assert.deepEqual(state.comments.map(item=>item.text),['A','B','Conservé']);
 assert.ok(state.comments.every(item=>item.parentId===null));
 assert.equal(add(state,'empty','  ').comments.length,3);
 assert.equal(add(state,'long','x'.repeat(COMMENT_LIMIT+1)).comments.length,3);
});

test('new comments and replies retain their own author across edits, reactions and JSON restoration',()=>{
 let state=updateCommentsState({}, {type:'add',id:'parent',text:'Message de Leïla',created,authorId:'profile-leila'});
 state=updateCommentsState(state,{type:'add',id:'reply',text:'Réponse de Noé',created,authorId:'profile-noe',replyToId:'parent'});
 state=updateCommentsState(state,{type:'edit',id:'reply',text:'Réponse précisée',editedAt:created+1000,authorId:'profile-leila'});
 state=updateCommentsState(state,{type:'react',id:'reply',reaction:'like'});
 assert.equal(get(state,'parent').authorId,'profile-leila');assert.equal(get(state,'reply').authorId,'profile-noe');
 assert.equal(get(state,'reply').replyToId,'parent');assert.equal(get(state,'reply').created,created);
 assert.deepEqual(normalizeCommentsState(JSON.parse(JSON.stringify(state))),state);
 state=updateCommentsState(state,{type:'remove',id:'parent'});
 assert.equal(get(state,'parent').authorId,'profile-leila');assert.equal(get(state,'reply').authorId,'profile-noe');
});

test('legacy author fallback is only a display decision and never rewrites stored text, date or author',()=>{
 const currentAuthor={id:'profile-leila',title:{fr:'Leïla Mansour',en:'Leïla Mansour',ar:'ليلى منصور'}};
 const state=normalizeCommentsState({comments:[{id:'legacy',text:'Mon ancien message',created}]}),before=structuredClone(state);
 const item=get(state,'legacy'),identity=resolveCommentAuthor(item,{currentAuthor,locale:'fr'});
 assert.equal(identity.profile,currentAuthor);assert.equal(identity.name,'Leïla Mansour');assert.equal(identity.own,true);assert.equal(identity.legacy,true);
 assert.equal(item.authorId,null);assert.deepEqual(state,before);
 assert.equal(resolveCommentAuthor(item,{currentAuthor,locale:'ar'}).name,'ليلى منصور');
 const revised=updateCommentsState(state,{type:'edit',id:'legacy',text:'Ancien message corrigé',editedAt:created+1000});
 assert.equal(get(revised,'legacy').authorId,null);assert.equal(get(revised,'legacy').created,created);
 assert.equal(resolveCommentAuthor({authorId:currentAuthor.id},{currentAuthor}).own,true);
});

test('other and unavailable authors never become the current profile or gain its edit controls',()=>{
 const currentAuthor={id:'profile-leila',title:{fr:'Leïla Mansour'}},other={id:'profile-noe',title:{fr:'Noé Laurent'}};
 const resolveAuthor=id=>id===other.id?other:null;
 const identity=resolveCommentAuthor({authorId:other.id},{currentAuthor,resolveAuthor});
 assert.equal(identity.profile,other);assert.equal(identity.name,'Noé Laurent');assert.equal(identity.own,false);assert.equal(identity.legacy,false);
 const missing=resolveCommentAuthor({authorId:'profile-missing'},{currentAuthor,resolveAuthor});
 assert.equal(missing.profile,null);assert.equal(missing.own,false);assert.equal(missing.name,'Auteur indisponible');
 assert.equal(resolveCommentAuthor({authorId:'profile-missing'},{currentAuthor,resolveAuthor,locale:'en'}).name,'Author unavailable');
 assert.equal(resolveCommentAuthor({authorId:'profile-missing'},{currentAuthor,resolveAuthor,locale:'ar'}).name,'الكاتب غير متاح');
 assert.equal(resolveCommentAuthor({authorId:'profile-missing'},{currentAuthor,resolveAuthor:()=>currentAuthor}).profile,null);
 assert.equal(resolveCommentAuthor({authorId:'profile-missing'},{}).own,false);
 const restored=normalizeCommentsState({comments:[{id:'unknown',authorId:'profile-missing',text:'À conserver',created}]});
 assert.equal(get(restored,'unknown').authorId,'profile-missing');
});

const mentionIn=(value,label='Inès Morel',profileId='profile-ines')=>({profileId,label,start:value.indexOf('@'+label),end:value.indexOf('@'+label)+label.length+1});

test('selected mentions survive separate drafts, submission trimming, replies and a JSON round trip',()=>{
 const text='  Salut @Inès Morel  ',mentions=[mentionIn(text)];
 let state=updateCommentsState({}, {type:'draft',text,mentions});
 assert.deepEqual(state.draftMentions,mentions);
 state=updateCommentsState(state,{type:'add',id:'parent',text,mentions,authorId:'profile-leila',created});
 assert.equal(get(state,'parent').text,'Salut @Inès Morel');
 assert.deepEqual(get(state,'parent').mentions,[mentionIn('Salut @Inès Morel')]);
 assert.equal(state.draft,'');assert.deepEqual(state.draftMentions,[]);
 state=updateCommentsState(state,{type:'draft',text:'Autre @Inès Morel',mentions:[mentionIn('Autre @Inès Morel')]});
 state=updateCommentsState(state,{type:'reply-draft',threadId:'parent',targetId:'parent',text,mentions});
 assert.deepEqual(state.replyDrafts.parent.mentions,mentions);
 state=normalizeCommentsState(JSON.parse(JSON.stringify(state)));
 state=updateCommentsState(state,{type:'add',id:'reply',text:state.replyDrafts.parent.text,mentions:state.replyDrafts.parent.mentions,replyToId:'parent',authorId:'profile-leila',created});
 assert.equal(get(state,'reply').parentId,'parent');assert.deepEqual(get(state,'reply').mentions,[mentionIn('Salut @Inès Morel')]);
 assert.equal(state.replyDrafts.parent,undefined);assert.equal(state.draft,'Autre @Inès Morel');assert.deepEqual(state.draftMentions,[mentionIn(state.draft)]);
 assert.deepEqual(normalizeCommentsState(JSON.parse(JSON.stringify(state))),state);
});

test('editing or inserting an emoji before a selected mention retains its target, but editing inside makes it plain text',()=>{
 const text='Bonjour @Inès Morel',mentions=[mentionIn(text)];
 let state=updateCommentsState({}, {type:'add',id:'message',text,mentions,authorId:'profile-leila',created});
 const change=insertCommentEmoji(text,'🚀',0,0),shifted=updateCommentMentions(text,change.value,mentions,{start:0,end:0});
 state=updateCommentsState(state,{type:'edit',id:'message',text:change.value,mentions:shifted,editedAt:created+1000});
 assert.deepEqual(get(state,'message').mentions,[mentionIn('🚀Bonjour @Inès Morel')]);assert.equal(get(state,'message').authorId,'profile-leila');assert.equal(get(state,'message').created,created);
 const previous=get(state,'message'),modified=previous.text.replace('Inès','Ines');
 const nextMentions=updateCommentMentions(previous.text,modified,previous.mentions);
 state=updateCommentsState(state,{type:'edit',id:'message',text:modified,mentions:nextMentions,editedAt:created+2000});
 assert.equal(get(state,'message').text,'🚀Bonjour @Ines Morel');assert.deepEqual(get(state,'message').mentions,[]);
});

test('typed text never invents mentions and deleting a parent clears only its mention metadata',()=>{
 const text='Bonjour @Inès Morel',mentions=[mentionIn(text)];
 let state=normalizeCommentsState({draft:text,comments:[{id:'legacy',text,created}]});
 assert.deepEqual(state.draftMentions,[]);assert.deepEqual(get(state,'legacy').mentions,[]);
 state=updateCommentsState(state,{type:'add',id:'parent',text,mentions,created});
 state=updateCommentsState(state,{type:'add',id:'reply',text,mentions,replyToId:'parent',created});
 state=updateCommentsState(state,{type:'remove',id:'parent'});
 assert.equal(get(state,'parent').deleted,true);assert.deepEqual(get(state,'parent').mentions,[]);assert.deepEqual(get(state,'reply').mentions,mentions);
});

test('changing a selected target with the same visible name is an edit without changing author or creation date',()=>{
 const text='@Inès Morel',mentions=[mentionIn(text)];
 let state=updateCommentsState({}, {type:'add',id:'message',text,mentions,authorId:'profile-leila',created});
 state=updateCommentsState(state,{type:'edit',id:'message',text,mentions:[mentionIn(text,'Inès Morel','profile-other-ines')],editedAt:created+1000});
 assert.equal(get(state,'message').text,text);assert.equal(get(state,'message').mentions[0].profileId,'profile-other-ines');assert.equal(get(state,'message').editedAt,created+1000);assert.equal(get(state,'message').created,created);assert.equal(get(state,'message').authorId,'profile-leila');
});
