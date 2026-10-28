import {renderSectionedDetail,clearProjectDetail} from './project-ui.mjs?v=8';
import {profileBackDistance} from './profile-sections.mjs?v=3';

export const journalSections=Object.freeze(['article','media','authors']);
export const normalizeJournalSection=value=>journalSections.includes(value)?value:'article';
export const journalBackDistance=state=>profileBackDistance({...state,profileDepth:state?.journalDepth});
const copy={
 fr:{article:'Article',media:'Médias',authors:'Auteurs',about:'En quelques mots',technologies:'Thèmes',sections:'Rubriques de l’article',inProject:'Dans cet article',back:'Retour au journal',campus:'Explorer {campus}',mediaCaption:'Illustration de démonstration',mediaNote:'Ce visuel accompagne cet article fictif.',teamIntro:'Les personnes qui ont écrit cet article.',byline:'Rédigé par',noAuthors:'Aucun auteur renseigné.'},
 en:{article:'Article',media:'Media',authors:'Authors',about:'At a glance',technologies:'Topics',sections:'Article sections',inProject:'In this article',back:'Back to the journal',campus:'Explore {campus}',mediaCaption:'Demonstration illustration',mediaNote:'This illustration accompanies the fictional article.',teamIntro:'The people who wrote this article.',byline:'Written by',noAuthors:'No authors listed.'},
 ar:{article:'المقال',media:'الوسائط',authors:'الكتّاب',about:'باختصار',technologies:'المواضيع',sections:'أقسام المقال',inProject:'في هذا المقال',back:'العودة إلى المجلة',campus:'استكشف {campus}',mediaCaption:'رسم توضيحي تجريبي',mediaNote:'يرافق هذا الرسم المقال الخيالي.',teamIntro:'الأشخاص الذين كتبوا هذا المقال.',byline:'بقلم',noAuthors:'لم يُحدَّد كتّاب.'},
};
export const clearJournalDetail=clearProjectDetail;
export function renderJournalDetail(options){
 return renderSectionedDetail({...options,kind:'journal',sectionKeys:journalSections,labels:copy,defaultSection:'article',activeSection:normalizeJournalSection(options.activeSection)});
}
