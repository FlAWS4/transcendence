// Second additive demo batch, requested13October2026: seven pages per section.
// Fictional identities and project/article variations only, never real records.
// Short authored topic/perspective combinations keep the dataset reviewable.
const l=(fr,en,ar)=>({fr,en,ar});
const date=(start,offset)=>new Date(Date.parse(start+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
const combine=(left,right)=>l(left.fr+' · '+right.fr,left.en+' · '+right.en,left.ar+' · '+right.ar);
const sentence=(left,right)=>l(left.fr+' '+right.fr,left.en+' '+right.en,left.ar+' '+right.ar);
const names=[
 ['nadia-selim','Nadia Selim','نادية سليم'],['adam-karim','Adam Karim','آدم كريم'],['salma-aziz','Salma Aziz','سلمى عزيز'],['rayan-idrissi','Rayan Idrissi','ريان إدريسي'],
 ['sara-el-amr','Sara El Amr','سارة العمرو'],['idris-madi','Idris Madi','إدريس ماضي'],['amal-tariq','Amal Tariq','أمل طارق'],['faris-saber','Faris Saber','فارس صابر'],
 ['julia-weber','Julia Weber','يوليا فيبر'],['oscar-lind','Oscar Lind','أوسكار ليند'],['clara-bauer','Clara Bauer','كلارا باور'],['luca-meyer','Luca Meyer','لوكا ماير'],
 ['elise-martin','Élise Martin','إليز مارتان'],['hugo-vidal','Hugo Vidal','هوغو فيدال'],['ana-campos','Ana Campos','آنا كامبوس'],['bruno-lima','Bruno Lima','برونو ليما'],
 ['beatriz-rocha','Beatriz Rocha','بياتريس روشا'],['diego-alves','Diego Alves','دييغو ألفيس'],['camila-pires','Camila Pires','كاميلا بيريس'],['rafael-mota','Rafael Mota','رافاييل موتا'],
 ['chloe-bernard','Chloé Bernard','كلوي برنار'],['felix-roy','Félix Roy','فيليكس روا'],['alice-morel','Alice Morel','أليس موريل'],['gabriel-lopez','Gabriel López','غابرييل لوبيز'],
 ['mila-rossi','Mila Rossi','ميلا روسي'],['paolo-conti','Paolo Conti','باولو كونتي'],['alessia-marini','Alessia Marini','أليسيا ماريني'],['marco-silva','Marco Silva','ماركو سيلفا'],
 ['iris-de-vries','Iris De Vries','إيريس دي فريس'],['otto-visser','Otto Visser','أوتو فيسر'],['eva-horak','Eva Horák','إيفا هوراك'],['pavel-kral','Pavel Král','بافل كرال'],
 ['hana-kim','Hana Kim','هانا كيم'],['min-jun-park','Min Jun Park','مين جون بارك'],['aiko-mori','Aiko Mori','آيكو موري'],['ren-hayashi','Ren Hayashi','رين هاياشي'],
 ['liam-chen','Liam Chen','ليام تشين'],['jin-lee','Jin Lee','جين لي'],['priya-rao','Priya Rao','بريا راو'],['niran-sen','Niran Sen','نيران سين'],
 ['zeynep-kaya','Zeynep Kaya','زينب كايا'],['emre-aydin','Emre Aydın','إمره آيدن'],['dalia-saleh','Dalia Saleh','داليا صالح'],['rami-fadel','Rami Fadel','رامي فاضل'],
 ['mira-khoury','Mira Khoury','ميرا خوري'],['karim-abbas','Karim Abbas','كريم عباس'],['zoe-rana','Zoé Rana','زوي رانا'],['eli-razan','Eli Razan','إيلي رازان'],
 ['joana-santos','Joana Santos','جوانا سانتوس'],['pedro-nunes','Pedro Nunes','بيدرو نونيس'],['vera-lopes','Vera Lopes','فيرا لوبيس'],['alex-costa','Alex Costa','أليكس كوستا'],
];
// Stable IDs from the bundled58-campus catalogue; no name infers a nationality.
const campuses=['tirana','yerevan','vienna','wels','antwerp','belo-horizonte','lausanne','zurich','wolfsburg','malaga','urduliz','angouleme','le-havre','marseille','mulhouse','nice','perpignan','firenze','milano','roma','irbid','gyeongsan','beirut','luxembourg','1337-med','1337-rabat','iskandar-puteri','kuala-lumpur','penang','warsaw','porto','nablus','kocaeli','luanda','abu-dhabi','brussels','rio','sao','quebec','prague','berlin','heilbronn','barcelona','madrid','lyon','paris','london','amman','tokyo','seoul','1337-ben-guerir','1337-khouribga'];
const themes=[
 {type:'libft',cover:'network',title:l('Chaînes et mémoire','Strings and memory','نصوص وذاكرة'),role:l('Fonctions C et mémoire','C functions and memory','دوال C والذاكرة'),tech:['c'],skills:['parsing'],tags:['C','Parsing'],aim:l('Relier les opérations sur les chaînes à des règles de mémoire explicites.','Connect string operations to explicit memory rules.','ربط عمليات النصوص بقواعد واضحة للذاكرة.'),check:l('Comparer les chaînes vides, les tailles limites et les allocations libérées.','Compare empty strings, size boundaries and released allocations.','مقارنة النصوص الفارغة وحدود الحجم وتحرير الذاكرة.')},
 {type:'minishell',cover:'shell',title:l('Commandes en dialogue','Commands in dialogue','أوامر في حوار'),role:l('Processus et analyse syntaxique','Processes and parsing','عمليات وتحليل نحوي'),tech:['c','posix'],skills:['parsing'],tags:['C','POSIX'],aim:l('Suivre une commande depuis ses guillemets jusqu’à son processus.','Follow a command from its quotes to its process.','تتبّع الأمر من علامات اقتباسه إلى عمليته.'),check:l('Vérifier redirections, tubes et interruptions avec des entrées reproductibles.','Check redirections, pipes and interruptions with reproducible inputs.','فحص إعادة التوجيه والأنابيب والمقاطعات بمدخلات قابلة للتكرار.')},
 {type:'cub3d',cover:'raycast',title:l('Une ville en pixels','A city in pixels','مدينة من بكسلات'),role:l('Raycasting et textures','Raycasting and textures','إلقاء الأشعة والأنسجة'),tech:['c'],skills:['raycasting','textures'],tags:['C','Raycasting','Textures'],aim:l('Donner de la profondeur à une carte simple sans perdre ses repères.','Give a simple map depth without losing its landmarks.','إضافة عمق إلى خريطة بسيطة مع الحفاظ على علاماتها.'),check:l('Observer les angles, les distances et la lisibilité des murs en mouvement.','Observe angles, distances and wall readability while moving.','مراقبة الزوايا والمسافات ووضوح الجدران أثناء الحركة.')},
 {type:'so_long',cover:'garden',title:l('Le chemin des balises','The marker trail','طريق العلامات'),role:l('Jeux en grille et repères','Grid games and visual cues','ألعاب الشبكة والعلامات البصرية'),tech:['c'],skills:['textures'],tags:['C','Textures'],aim:l('Construire un parcours court où l’on comprend les règles en jouant.','Build a short journey whose rules become clear through play.','بناء مسار قصير تتضح قواعده أثناء اللعب.'),check:l('Essayer une carte invalide, un trajet impossible et plusieurs commandes rapides.','Try an invalid map, an impossible path and rapid commands.','تجربة خريطة غير صالحة ومسار مستحيل وأوامر سريعة.')},
 {type:'born2beroot',cover:'network',title:l('Le serveur reproductible','The reproducible server','الخادم القابل لإعادة البناء'),role:l('Installation et permissions','Installation and permissions','تثبيت وصلاحيات'),tech:['posix'],skills:['collaboration'],tags:['POSIX','Collaboration'],aim:l('Décrire une installation pour qu’une autre personne puisse la refaire.','Describe an installation so another person can repeat it.','وصف التثبيت حتى يتمكن شخص آخر من إعادته.'),check:l('Rejouer la procédure sur une machine vide et noter chaque décision manquante.','Repeat the procedure on an empty machine and note missing decisions.','إعادة الخطوات على آلة فارغة وتسجيل القرارات الناقصة.')},
 {type:'ft_irc',cover:'network',title:l('Des salons partagés','Shared chat rooms','غرف محادثة مشتركة'),role:l('Sockets et état des connexions','Sockets and connection state','مقابس وحالة الاتصالات'),tech:['cpp','sockets'],skills:['irc'],tags:['C++','Sockets','IRC'],aim:l('Faire circuler des messages entre clients rapides, lents et déconnectés.','Move messages between fast, slow and disconnected clients.','تمرير الرسائل بين عملاء سريعين وبطيئين ومنقطعين.'),check:l('Fragmenter les commandes et comparer l’état du salon avant et après un départ.','Fragment commands and compare room state before and after a departure.','تجزئة الأوامر ومقارنة حالة الغرفة قبل خروج مشارك وبعده.')},
 {type:'ft_transcendence',cover:'network',title:l('Le tableau commun','The shared board','اللوحة المشتركة'),role:l('Écrans et collaboration','Screens and collaboration','شاشات وتعاون'),tech:['typescript','css'],skills:['web','collaboration'],tags:['TypeScript','CSS','Web'],aim:l('Relier plusieurs écrans autour d’une session de jeu compréhensible.','Connect several screens around a clear game session.','ربط شاشات متعددة بجلسة لعب مفهومة.'),check:l('Parcourir les attentes, les changements de joueur et la reprise après une coupure.','Walk through waiting, player changes and recovery after a disconnection.','تجربة الانتظار وتبديل اللاعبين والاستئناف بعد انقطاع.')},
 {type:'personal',cover:'garden',title:l('Le carnet accessible','The accessible notebook','الدفتر المتاح للجميع'),role:l('Lecture et accessibilité','Reading and accessibility','قراءة وإمكانية الوصول'),tech:['typescript','css'],skills:['web','accessibility'],tags:['TypeScript','CSS','Accessibility'],aim:l('Garder des notes avec une interface lisible et entièrement accessible au clavier.','Keep notes in a readable interface fully usable with a keyboard.','حفظ الملاحظات بواجهة واضحة يمكن استخدامها بالكامل بلوحة المفاتيح.'),check:l('Comparer petits écrans, navigation au clavier et messages après une saisie incomplète.','Compare small screens, keyboard navigation and messages after incomplete input.','مقارنة الشاشات الصغيرة والتنقّل بلوحة المفاتيح والرسائل بعد إدخال ناقص.')},
];
const projectAngles=[
 [l('Le premier essai','The first experiment','التجربة الأولى'),l('Un premier parcours complet permet de nommer les états encore ambigus.','A first complete journey helps name states that remain unclear.','يساعد مسار كامل أولي على تسمية الحالات التي ما زالت غامضة.')],
 [l('La revue à deux','The paired review','المراجعة الثنائية'),l('Une seconde personne refait le parcours et note les choix qui méritent une explication.','A second person repeats the journey and notes decisions that need explanation.','يعيد شخص آخر المسار ويسجّل الاختيارات التي تحتاج إلى شرح.')],
 [l('Les cas limites','The edge cases','الحالات الحدّية'),l('Les entrées minimales et les erreurs volontaires révèlent les règles à préciser.','Minimal inputs and deliberate errors reveal rules that need clarifying.','تكشف المدخلات الصغيرة والأخطاء المقصودة القواعد التي تحتاج إلى توضيح.')],
 [l('Une autre approche','Another approach','نهج آخر'),l('Deux solutions sont conservées pour comparer leurs compromis avec le même exemple.','Two solutions are kept to compare their tradeoffs with the same example.','يُحتفظ بحلّين لمقارنة مزاياهما وحدودهما باستخدام المثال نفسه.')],
 [l('Les traces utiles','Useful traces','آثار مفيدة'),l('Un petit journal d’exécution relie chaque observation à l’action qui la précède.','A small execution log connects each observation to the action before it.','يربط سجل تنفيذ صغير كل ملاحظة بالفعل الذي سبقها.')],
 [l('Le parcours expliqué','The explained journey','المسار المشروح'),l('La documentation accompagne un exemple que les pairs peuvent suivre sans aide orale.','Documentation accompanies an example that peers can follow without spoken guidance.','يرافق التوثيق مثالًا يستطيع الزملاء اتباعه دون شرح شفهي.')],
 [l('La reprise collective','The shared follow-up','المتابعة الجماعية'),l('Après une pause, le groupe reprend à partir des décisions et des questions conservées.','After a break, the group resumes from recorded decisions and questions.','بعد استراحة، تستأنف المجموعة انطلاقًا من القرارات والأسئلة المحفوظة.')],
];
const statuses=['student','transcender','alumni'];
const statusNames=[l('Cadet','Cadet','كاديت'),l('Transcender','Transcender','ترانسيندر'),l('Alumni','Alumni','خريج')];
const finalLabels=[l('Aujourd’hui','Today','اليوم'),l('Spécialisation en cours','Specialisation in progress','تخصّص قيد المتابعة'),l('Après 42','After 42','بعد 42')];
const avatars=['leila-mansour','noe-laurent','ines-morel','haru-mizuno','luiza-costa','caio-mendes'];
export const expandedProfiles=names.map(([slug,name,ar],i)=>{
 const theme=themes[i%themes.length],angle=projectAngles[Math.floor(i/themes.length)],statusIndex=i%3,arrivalYear=[2024,2023,2022][statusIndex];
 return {id:'profile-'+slug,section:'people',kind:'profile',demo:true,demoBatch:'seven-pages',campus:campuses[i],cover:'profile',
  title:l(name,name,ar),summary:theme.aim,role:theme.role,eyebrow:combine(statusNames[statusIndex],theme.role),
  bio:sentence(theme.aim,angle[1]),status:statuses[statusIndex],arrivalYear,promotionNumber:2+i%6,
  avatar:'./assets/profile-avatars/'+avatars[i%avatars.length]+'.svg',socialLinks:[],tags:[...theme.tags],publishedAt:date('2026-05-01',i),
  milestones:[
   {date:String(arrivalYear-1),label:l('Avant 42','Before 42','قبل 42'),text:l('Premiers exercices personnels et découverte des échanges entre pairs.','First personal exercises and discovering exchanges with peers.','أولى التمارين الشخصية واكتشاف التبادل مع الزملاء.')},
   {date:statusIndex===0?String(arrivalYear):arrivalYear+'–2025',label:statusIndex===0?l('Apprendre ensemble','Learning together','التعلّم معًا'):l('Tronc commun terminé','Common core completed','إنهاء الجذع المشترك'),text:theme.check},
   {date:'2026',label:finalLabels[statusIndex],text:angle[1]},
  ],journeyEntryId:null,
 };
});
export const expandedEntryAuthors={};
const projects=expandedProfiles.map((profile,i)=>{
 const theme=themes[i%themes.length],angle=projectAngles[Math.floor(i/themes.length)];
 const authors=i%5===0?[profile,expandedProfiles[(i+7)%expandedProfiles.length]]:[profile];
 const id='demo-expanded-project-'+names[i][0];expandedEntryAuthors[id]=authors.map(a=>a.id);
 return {id,section:'projects',demo:true,demoBatch:'seven-pages',projectType:theme.type,campus:profile.campus,campusIds:[...new Set(authors.map(p=>p.campus))],
  leadAuthorId:authors.at(-1).id,cover:theme.cover,title:combine(theme.title,angle[0]),summary:sentence(theme.aim,angle[1]),
  technologies:[...theme.tech],skills:[...theme.skills],tags:[...theme.tags],publishedAt:date('2026-03-01',i),
  body:[{heading:l('La démarche','The approach','النهج'),text:sentence(theme.aim,angle[1])},{heading:l('Ce que nous vérifions','What we check','ما نتحقق منه'),text:theme.check}],
 };
});
const articleTopics=[
 [l('Décrire un blocage','Describing a roadblock','وصف عقبة'),l('Un résultat attendu et une observation précise donnent un point de départ commun.','An expected result and a precise observation provide a shared starting point.','تمنح النتيجة المتوقعة والملاحظة الدقيقة نقطة بداية مشتركة.')],
 [l('Relire les petites fonctions','Reviewing small functions','مراجعة الدوال الصغيرة'),l('Le nom, les entrées et les sorties d’une fonction doivent raconter la même intention.','A function’s name, inputs and outputs should describe the same intention.','ينبغي أن يعبّر اسم الدالة ومدخلاتها ومخرجاتها عن القصد نفسه.')],
 [l('Comprendre un message d’erreur','Understanding an error message','فهم رسالة خطأ'),l('Un message utile indique ce qui a échoué et l’action qui permet de reprendre.','A useful message explains what failed and how to continue.','تشرح الرسالة المفيدة ما فشل وكيف يمكن المتابعة.')],
 [l('Préparer les entrées de test','Preparing test inputs','إعداد مدخلات الاختبار'),l('Des exemples courts rendent les différences de comportement plus faciles à comparer.','Short examples make differences in behaviour easier to compare.','تجعل الأمثلة القصيرة مقارنة اختلاف السلوك أسهل.')],
 [l('Lire la documentation ensemble','Reading documentation together','قراءة التوثيق معًا'),l('Un passage difficile devient plus clair lorsqu’on le relie à un programme minimal.','A difficult passage becomes clearer when connected to a minimal program.','تتضح الفقرة الصعبة عند ربطها ببرنامج صغير.')],
 [l('Dessiner les responsabilités','Drawing responsibilities','رسم المسؤوليات'),l('Nommer qui crée et qui libère une ressource aide à discuter de sa durée de vie.','Naming who creates and releases a resource helps discuss its lifetime.','تساعد تسمية من ينشئ المورد ومن يحرره على مناقشة مدة بقائه.')],
 [l('Suivre un événement','Following an event','تتبّع حدث'),l('Une chronologie distingue les actions de l’utilisateur des réponses tardives du système.','A timeline distinguishes user actions from late system responses.','يميّز التسلسل الزمني بين أفعال المستخدم واستجابات النظام المتأخرة.')],
 [l('Faire une revue accueillante','Making reviews welcoming','جعل المراجعة مريحة'),l('Une question ouverte permet d’expliquer un choix avant de proposer une autre solution.','An open question lets someone explain a choice before another solution is suggested.','يتيح السؤال المفتوح شرح الاختيار قبل اقتراح حل آخر.')],
 [l('Prendre des notes utiles','Taking useful notes','تدوين ملاحظات مفيدة'),l('Une note relie un constat à son contexte pour éviter de recommencer la même recherche.','A note connects an observation to its context to avoid repeating the same investigation.','تربط الملاحظة النتيجة بسياقها لتجنّب إعادة البحث نفسه.')],
 [l('Observer sans interrompre','Observing without interrupting','المراقبة دون مقاطعة'),l('Laisser une personne finir son parcours révèle les repères qu’elle cherche spontanément.','Letting someone finish a journey reveals the cues they naturally look for.','يكشف ترك الشخص يكمل مساره العلامات التي يبحث عنها تلقائيًا.')],
 [l('Garder les versions intermédiaires','Keeping intermediate versions','حفظ النسخ الوسيطة'),l('Une ancienne version peut expliquer un compromis que le résultat final ne montre plus.','An older version can explain a tradeoff no longer visible in the final result.','قد تشرح نسخة سابقة موازنة لم تعد ظاهرة في النتيجة النهائية.')],
 [l('Rendre une décision lisible','Making a decision readable','توضيح القرار'),l('Le problème, les options essayées et le choix retenu tiennent parfois en quelques phrases.','The problem, attempted options and chosen solution sometimes fit in a few sentences.','قد تكفي جمل قليلة لوصف المشكلة والخيارات المجربة والحل المختار.')],
 [l('Préparer la prochaine séance','Preparing the next session','الاستعداد للجلسة التالية'),l('Terminer par une question concrète rend la reprise plus simple pour toute l’équipe.','Ending with a concrete question makes it easier for the whole team to resume.','يسهّل الختام بسؤال محدد استئناف العمل على الفريق كله.')],
];
const articleAngles=[
 [l('Les premières notes','First notes','الملاحظات الأولى'),l('Nous partons d’un seul exemple et gardons les mots employés par chacun. Cette trace permet de voir où nos interprétations se séparent.','We start with one example and keep the words each person uses. This record shows where interpretations begin to differ.','نبدأ بمثال واحد ونحتفظ بالكلمات التي يستخدمها كل شخص. يبيّن هذا السجل أين تبدأ التفسيرات بالاختلاف.')],
 [l('Pendant la revue','During the review','أثناء المراجعة'),l('Le binôme refait le raisonnement sans lire la solution d’abord. Ses questions indiquent les explications à compléter dans le carnet.','A partner repeats the reasoning before reading the solution. Their questions show which explanations need expanding in the notebook.','يعيد الزميل التفكير قبل قراءة الحل. وتوضح أسئلته الشروح التي تحتاج إلى إكمال في الدفتر.')],
 [l('Après une difficulté','After a difficulty','بعد مواجهة صعوبة'),l('Nous conservons le cas qui a résisté et changeons une seule hypothèse à la fois. Le compte rendu distingue ce qui est observé de ce qui reste supposé.','We keep the stubborn case and change one assumption at a time. The account separates observations from assumptions that remain.','نحتفظ بالحالة الصعبة ونغيّر افتراضًا واحدًا كل مرة. ويميّز السرد بين الملاحظة وما يبقى افتراضًا.')],
 [l('Ce que nous transmettons','What we pass on','ما ننقله للآخرين'),l('La dernière version est accompagnée d’un exemple reproductible et d’une limite connue. Une autre équipe peut ainsi continuer sans devoir reconstruire tout le contexte.','The latest version comes with a reproducible example and a known limitation. Another team can continue without reconstructing the entire context.','ترافق النسخة الأخيرةَ تجربة قابلة للتكرار وحدّ معروف. ويمكن بذلك لفريق آخر المتابعة دون إعادة بناء السياق كاملًا.')],
];
const articles=expandedProfiles.map((profile,i)=>{
 const topic=articleTopics[i%articleTopics.length],angle=articleAngles[Math.floor(i/articleTopics.length)];
 const authors=i%7===0?[profile,expandedProfiles[(i+1)%expandedProfiles.length]]:[profile];
 const id='demo-expanded-journal-'+names[i][0];expandedEntryAuthors[id]=authors.map(a=>a.id);
 return {id,section:'journal',demo:true,demoBatch:'seven-pages',campus:profile.campus,cover:'journal',leadAuthorId:authors.at(-1).id,
  title:combine(topic[0],angle[0]),summary:topic[1],tags:[...profile.tags],publishedAt:date('2026-01-01',i),
  body:[{heading:topic[0],text:topic[1]},{heading:angle[0],text:angle[1]}],
 };
});
export const expandedEditorialEntries=[...projects,...articles];
