import {renderSectionedDetail,clearProjectDetail} from './project-ui.mjs?v=27';
import {profileBackDistance} from './profile-sections.mjs?v=6';

export const journalSections=Object.freeze(['article','media','authors','comments']);
export const normalizeJournalSection=value=>journalSections.includes(value)?value:'article';
export const journalBackDistance=state=>profileBackDistance({...state,profileDepth:state?.journalDepth});
const copy={
 fr:{comments:'Commentaires',article:'Article',media:'Médias',authors:'Auteurs',about:'En quelques mots',technologies:'Thèmes',sections:'Rubriques de l’article',inProject:'Dans cet article',back:'Retour aux chroniques',campus:'Explorer {campus}',mediaCaption:'Illustration de démonstration',mediaNote:'Ce visuel accompagne cet article fictif.',teamIntro:'Les personnes qui ont écrit cet article.',byline:'Rédigé par',noAuthors:'Aucun auteur renseigné.'},
 en:{comments:'Comments',article:'Article',media:'Media',authors:'Authors',about:'At a glance',technologies:'Topics',sections:'Article sections',inProject:'In this article',back:'Back to Chronicles',campus:'Explore {campus}',mediaCaption:'Demonstration illustration',mediaNote:'This illustration accompanies the fictional article.',teamIntro:'The people who wrote this article.',byline:'Written by',noAuthors:'No authors listed.'},
 ar:{comments:'التعليقات',article:'المقال',media:'الوسائط',authors:'الكتّاب',about:'باختصار',technologies:'المواضيع',sections:'أقسام المقال',inProject:'في هذا المقال',back:'العودة إلى حكايات',campus:'استكشف {campus}',mediaCaption:'رسم توضيحي تجريبي',mediaNote:'يرافق هذا الرسم المقال الخيالي.',teamIntro:'الأشخاص الذين كتبوا هذا المقال.',byline:'بقلم',noAuthors:'لم يُحدَّد كتّاب.'},
};
export const clearJournalDetail=clearProjectDetail;
export function renderJournalDetail(options){
 return renderSectionedDetail({...options,kind:'journal',sectionKeys:journalSections,labels:copy,defaultSection:'article',activeSection:normalizeJournalSection(options.activeSection)});
}
