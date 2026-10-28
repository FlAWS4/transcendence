import {coverArt} from './content-preview-art.mjs?v=1';

// Public, fictional profiles reuse the site's content styles and real route links.
const copy={
 fr:{discover:'Découvrir le profil',student:'Cadet',transcender:'Transcender',transcenderDescription:'Tronc commun terminé, spécialisation en cours',alumni:'Alumni',featured:'Un projet à découvrir',about:'Présentation',projects:'Projets',journey:'Parcours',contributions:'Contributions au journal',noProjects:'Pas encore de projet présenté.',noContributions:'Pas encore de contribution au journal.',story:'Un récit du parcours',campus:'Explorer {campus}',back:'Retour aux profils',authors:'Créé par',read:'Découvrir',skills:'Compétences et centres d’intérêt'},
 en:{discover:'Discover the profile',student:'Cadet',transcender:'Transcender',transcenderDescription:'Common core completed, specialization in progress',alumni:'Alumni',featured:'A project to discover',about:'About',projects:'Projects',journey:'Journey',contributions:'Journal contributions',noProjects:'No projects shared yet.',noContributions:'No journal contributions yet.',story:'A story from the journey',campus:'Explore {campus}',back:'Back to profiles',authors:'Created by',read:'Discover',skills:'Skills and interests'},
 ar:{discover:'اكتشف الملف',student:'كاديت',transcender:'Transcender',transcenderDescription:'أكمل الجذع المشترك ويتابع التخصص',alumni:'خريج / خريجة',featured:'مشروع لاكتشافه',about:'نبذة',projects:'المشاريع',journey:'المسار',contributions:'المساهمات في المجلة',noProjects:'لا توجد مشاريع معروضة بعد.',noContributions:'لا توجد مساهمات في المجلة بعد.',story:'حكاية من المسار',campus:'استكشف {campus}',back:'العودة إلى الملفات',authors:'من إعداد',read:'اكتشف',skills:'المهارات والاهتمامات'}
};
const localized=(value,locale)=>typeof value==='string'?value:value?.[locale]||value?.en||value?.fr||'';
const words=locale=>copy[locale]||copy.fr;
function node(tag,className,text){const element=document.createElement(tag);if(className)element.className=className;if(text!==undefined)element.textContent=text;return element;}
function arrow(back=false){const element=document.createElementNS('http://www.w3.org/2000/svg','svg');element.setAttribute('viewBox','0 0 24 24');element.setAttribute('aria-hidden','true');element.innerHTML=back?'<path d="m14 6-6 6 6 6M8 12h12"/>':'<path d="M5 12h14m-6-6 6 6-6 6"/>';return element;}
function portrait(profile,className='cp-person-avatar'){
 const image=node('img',className);image.src=profile.avatar;image.alt='';image.width=240;image.height=240;image.decoding='async';return image;
}
function statusBadge(profile,locale){
 const t=words(locale),badge=node('span','cp-profile-status',t[profile.status]||t.student);
 if(profile.status==='transcender'){badge.title=t.transcenderDescription;badge.dir='ltr';}
 return badge;
}
function routeLink({href,item,onNavigate,className}){
 const link=node('a',className);link.href=href;
 if(onNavigate)link.addEventListener('click',event=>onNavigate(event,item));
 return link;
}
function tags(values,locale){
 const list=node('ul','cp-profile-tags');list.setAttribute('aria-label',words(locale).skills);
 for(const value of values||[])list.append(node('li','',localized(value,locale)));
 return list;
}
function artwork(entry,className='cp-cover'){
 const cover=node('div',className);cover.dataset.cover=entry.cover;cover.setAttribute('aria-hidden','true');
 const art=node('div','cp-art');art.innerHTML=coverArt(entry.cover);cover.append(art);return cover;
}

/** onNavigate(event, profile) may use the shared router; links still support new tabs. */
export function renderProfileCard({profile,locale='fr',campusName,href,onNavigate,featuredProject}){
 const t=words(locale),card=node('article','cp-card cp-profile-card');card.dataset.profileId=profile.id;card.dataset.cover='profile';
 const link=routeLink({href,item:profile,onNavigate,className:'cp-card-open'});
 const face=node('div','cp-profile-portrait');face.append(portrait(profile));
 face.append(statusBadge(profile,locale));
 const body=node('div','cp-card-copy');
 const meta=node('p','cp-meta',campusName||profile.campus);body.append(meta);
 const title=node('h2','',localized(profile.title,locale));title.dir='auto';body.append(title);
 body.append(node('p','cp-profile-role',localized(profile.role,locale)));
 body.append(node('p','cp-summary',localized(profile.summary,locale)),tags(profile.tags,locale));
 if(featuredProject){
  const feature=node('div','cp-profile-feature');feature.append(artwork(featuredProject,'cp-profile-feature-art'));
  const text=node('span','cp-profile-feature-copy');text.append(node('small','',t.featured),node('strong','',localized(featuredProject.title,locale)));feature.append(text);body.append(feature);
 }
 const action=node('span','cp-card-link',t.discover);action.append(arrow());body.append(action);link.append(face,body);card.append(link);return card;
}

/** Authors are separate links, so neither cards nor favorites create nested controls. */
export function createAuthorByline({authors=[],locale='fr',getHref,onNavigate,compact=false,label}){
 const root=node('div','cp-authors');root.dataset.compact=String(compact);
 if(!authors.length)return root;
 root.append(node('p','cp-authors-label',label||words(locale).authors));
 const list=node('ul','cp-author-list');
 for(const author of authors){
  const item=node('li','cp-author-item');
  const link=routeLink({href:getHref(author),item:author,onNavigate,className:'cp-author-link'});
  const text=node('span','cp-author-copy'),name=node('strong','',localized(author.title,locale));name.dir='auto';
  text.append(name);
  if(!compact)text.append(node('span','cp-author-role',localized(author.role,locale)));
  link.append(portrait(author),text);item.append(link);list.append(item);
 }
 root.append(list);return root;
}

function relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}){
 const card=node('article','cp-profile-related-card');
 const link=routeLink({href:getEntryHref(entry),item:entry,onNavigate,className:'cp-profile-related-link'});
 link.append(artwork(entry));
 const text=node('div','cp-profile-related-copy');
 text.append(node('p','cp-meta',localized(entry.eyebrow,locale)),node('h3','',localized(entry.title,locale)),node('p','cp-profile-related-summary',localized(entry.summary,locale)));
 const action=node('span','cp-card-link',words(locale).read);action.append(arrow());text.append(action);link.append(text);card.append(link);
 if(createFavoriteButton)card.append(createFavoriteButton(entry,true));return card;
}
function section(title,id){const section=node('section','cp-profile-section');const heading=node('h2','',title);heading.id=id;section.setAttribute('aria-labelledby',id);section.append(heading);return section;}

/** entries are already linked to the person. journey keeps the former story intact. */
export function renderProfileDetail({container,profile,locale='fr',campusName,entries=[],journey,getEntryHref,onNavigate,createFavoriteButton,onExploreCampus,onBack,backLabel}){
 const t=words(locale);container.replaceChildren();container.classList.add('cp-profile-detail');
 const back=node('button','cp-back');back.type='button';back.id='profile-back';back.append(arrow(true),document.createTextNode(backLabel||t.back));if(onBack)back.addEventListener('click',onBack);container.append(back);
 const header=node('header','cp-profile-hero'),face=node('div','cp-profile-hero-portrait');face.append(portrait(profile));
 const heading=node('div','cp-profile-heading');
 heading.append(node('p','cp-meta',localized(profile.eyebrow,locale)));
 const name=node('h1','',localized(profile.title,locale));name.id='profile-title';name.tabIndex=-1;name.dir='auto';heading.append(name);
 heading.append(node('p','cp-profile-hero-role',localized(profile.role,locale)),node('p','cp-profile-hero-summary',localized(profile.summary,locale)));
 const facts=node('p','cp-profile-facts');facts.append(statusBadge(profile,locale),node('span','',campusName||profile.campus));heading.append(facts,tags(profile.tags,locale));
 const actions=node('div','cp-profile-actions');
 if(createFavoriteButton)actions.append(createFavoriteButton(profile));
 if(onExploreCampus){const campus=node('button','cp-profile-campus');campus.type='button';campus.append(document.createTextNode(t.campus.replace('{campus}',campusName||profile.campus)),arrow());campus.addEventListener('click',event=>onExploreCampus(event,profile));actions.append(campus);}
 heading.append(actions);header.append(face,heading);container.append(header);
 const about=section(t.about,'profile-about-title');about.classList.add('cp-profile-about');about.append(node('p','',localized(profile.bio,locale)));container.append(about);
 const projects=section(t.projects,'profile-projects-title'),projectEntries=entries.filter(entry=>entry.section==='projects');
 if(projectEntries.length){const grid=node('div','cp-profile-related-grid');for(const entry of projectEntries)grid.append(relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}));projects.append(grid);}else projects.append(node('p','cp-profile-empty',t.noProjects));container.append(projects);
 const path=section(t.journey,'profile-journey-title'),timeline=node('ol','cp-profile-timeline');timeline.setAttribute('role','list');
 for(const milestone of profile.milestones||[]){
  const item=node('li','cp-profile-milestone');item.setAttribute('role','listitem');item.append(node('span','cp-profile-milestone-date',milestone.date));
  const content=node('div','cp-profile-milestone-copy');content.append(node('h3','',localized(milestone.label,locale)),node('p','',localized(milestone.text,locale)));item.append(content);timeline.append(item);
 }
 path.append(timeline);
 if(journey){
  const story=node('article','cp-profile-story');story.append(node('p','cp-meta',t.story),node('h3','',localized(journey.title,locale)),node('p','cp-profile-story-intro',localized(journey.summary,locale)));
  for(const part of journey.body||[]){story.append(node('h4','',localized(part.heading,locale)),node('p','',localized(part.text,locale)));}path.append(story);
 }
 container.append(path);
 const contributions=section(t.contributions,'profile-contributions-title'),articles=entries.filter(entry=>entry.section==='journal');
 if(articles.length){const grid=node('div','cp-profile-related-grid');for(const entry of articles)grid.append(relatedEntry(entry,{locale,getEntryHref,onNavigate,createFavoriteButton}));contributions.append(grid);}else contributions.append(node('p','cp-profile-empty',t.noContributions));container.append(contributions);
 return container;
}
