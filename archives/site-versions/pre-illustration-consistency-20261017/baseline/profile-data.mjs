import {expandedProfiles,expandedEntryAuthors} from './demo-content-expanded.mjs?v=1';
import {demoProfiles,demoEntryAuthors} from './demo-content-seed.mjs?v=1';
// Fictional people for the Horizon prototype. Names, biographies, dates and
// collaborations are illustrative; none describe actual 42 students or staff.
// Arrival years and cohort numbers belong to the FIRST enrollment campus and
// stay stable after transfers. `campus` is the current campus used by discovery.
// These cohort numbers are demonstration data, not official campus statistics.
// Original editorial samples stay in content-preview-data.mjs. The additional
// seed is import-free, so rendering and search share links without a cycle.
const copy = (fr, en, ar) => ({fr, en, ar});
const deepFreeze = value => {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
};

// Optional public links supplied by the profile owner. No account URLs have been
// provided for the fictional corpus: its arrays deliberately remain empty.
// Record shape: {platform: 'github' | ... | 'custom', url, label?}.
// Custom labels allow other networks and personal sites without changing the UI.
export const profileSocialPlatforms = deepFreeze({
  github: 'GitHub', facebook: 'Facebook', x: 'X', instagram: 'Instagram', linkedin: 'LinkedIn'
});

export function normalizeProfileSocialLinks(links) {
  if (!Array.isArray(links)) return [];
  const seen = new Set();
  return links.flatMap(link => {
    if (!link || typeof link.url !== 'string') return [];
    const value = link.url.trim();
    // Only explicit web URLs are supported; relative paths and executable or
    // embedded schemes never become clickable links, even in imported data.
    if (!/^https?:\/\//i.test(value)) return [];
    let url;
    try { url = new URL(value); } catch { return []; }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password) return [];
    if (seen.has(url.href)) return [];
    seen.add(url.href);
    const platform = Object.hasOwn(profileSocialPlatforms, link.platform) ? link.platform : 'custom';
    const label = platform === 'custom'
      ? (typeof link.label === 'string' && link.label.trim() ? link.label.trim() : url.hostname)
      : profileSocialPlatforms[platform];
    return [{platform, url: url.href, label}];
  });
}

// Optional campusHistory is ordered from the first enrollment onward:
// [{campus: 'paris', date: '2024'}, {campus: 'lyon', date: '2025-09-01'}].
// date is optional and retains its recorded precision (YYYY, YYYY-MM or YYYY-MM-DD).
// Adjacent repeats of a campus do not establish a transfer. We never sort or
// infer missing transfers from the current campus, nor rewrite the source data.
function campusHistoryDate(value) {
  if (typeof value !== 'string' || !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) return null;
  const [year, month = 1, day = 1] = value.split('-').map(Number);
  if (year < 1900 || year > 2199 || month < 1 || month > 12 || day < 1) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? value : null;
}

export function normalizeProfileCampusHistory(history) {
  if (!Array.isArray(history)) return [];
  const normalized = [];
  for (const record of history) {
    if (!record || typeof record.campus !== 'string' || !record.campus.trim()) continue;
    const campus = record.campus.trim();
    if (normalized.at(-1)?.campus === campus) continue;
    normalized.push({campus, date: campusHistoryDate(record.date)});
  }
  return normalized;
}

export function getProfileCampusContext(profile = {}) {
  const history = normalizeProfileCampusHistory(profile?.campusHistory);
  const currentCampus = typeof profile?.campus === 'string' && profile.campus.trim() ? profile.campus.trim() : history.at(-1)?.campus || null;
  const originCampus = history[0]?.campus || currentCampus;
  const recordedYear = Number(history[0]?.date?.slice(0, 4));
  const arrivalYear = Number.isInteger(profile?.arrivalYear) && profile.arrivalYear > 0 ? profile.arrivalYear : recordedYear || null;
  const promotionNumber = Number.isInteger(profile?.promotionNumber) && profile.promotionNumber > 0 ? profile.promotionNumber : null;
  if (!history.length && originCampus) history.push({campus: originCampus, date: arrivalYear ? String(arrivalYear) : null});
  else if (history.length && !history[0].date && arrivalYear) history[0].date = String(arrivalYear);
  return {originCampus, currentCampus, arrivalYear, promotionNumber, hasCampusChanges: history.length > 1, history};
}

export const profiles = deepFreeze([
  {
    id: 'profile-leila-mansour', arrivalYear: 2024, promotionNumber: 8, intraLogin: 'lmansour', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'paris', cover: 'profile',
    title: copy('Leïla Mansour', 'Leïla Mansour', 'ليلى منصور'),
    summary: copy('Comprendre ce qui se passe derrière une commande, puis trouver les mots pour le partager.', 'Understand what happens behind a command, then find the words to share it.', 'فهم ما يحدث خلف الأمر البرمجي، ثم إيجاد الكلمات لمشاركة ذلك.'),
    eyebrow: copy('Cadet · Systèmes', 'Cadet · Systems', 'كاديت · أنظمة'),
    role: copy('Programmation système et apprentissage entre pairs', 'Systems programming and peer learning', 'برمجة الأنظمة والتعلّم مع الزملاء'),
    status: 'student', avatar: './assets/profile-avatars/leila-mansour.svg', socialLinks: [],
    tags: ['C', 'POSIX', 'Debugging'], publishedAt: '2026-09-22',
    bio: copy('Je suis arrivée à la programmation en essayant de comprendre les outils que j’utilisais chaque jour. À 42 Paris, je m’intéresse aux systèmes et aux petits détails qui changent le comportement d’un programme. J’aime garder une trace de mes questions et travailler à deux pour démêler un problème.', 'I came to programming by trying to understand the tools I used every day. At 42 Paris, I explore systems and the small details that change how a program behaves. I like keeping a record of my questions and working with a partner to untangle a problem.', 'بدأ اهتمامي بالبرمجة من محاولة فهم الأدوات التي أستخدمها كل يوم. في 42 باريس، أستكشف الأنظمة والتفاصيل الصغيرة التي تغيّر سلوك البرامج. أحب تدوين أسئلتي والعمل مع زميل لفهم المشكلات خطوة بخطوة.'),
    milestones: [
      {date: '2023', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Premiers scripts pour automatiser des tâches quotidiennes et découverte de la ligne de commande.', 'First scripts to automate everyday tasks and an introduction to the command line.', 'أولى المحاولات لكتابة سكربتات للمهام اليومية واكتشاف سطر الأوامر.')},
      {date: '2024', label: copy('Entrer dans le collectif', 'Joining the group', 'التعلّم ضمن مجموعة'), text: copy('Début à Paris, apprentissage du C et premières revues de code entre pairs.', 'Starting in Paris, learning C and reviewing code with peers for the first time.', 'البداية في باريس، وتعلّم لغة C، وأولى مراجعات الشيفرة مع الزملاء.')},
      {date: '2026', label: copy('Aujourd’hui', 'Today', 'اليوم'), text: copy('Construire un petit shell avec Noé et documenter les questions rencontrées en chemin.', 'Building a small shell with Noé and documenting the questions along the way.', 'بناء صدفة أوامر صغيرة مع نوي وتوثيق الأسئلة التي تظهر أثناء العمل.')}
    ],
    journeyEntryId: 'path-learning-to-ask'
  },
  {
    id: 'profile-noe-laurent', arrivalYear: 2024, promotionNumber: 8, intraLogin: 'nlaurent', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'paris', cover: 'profile',
    title: copy('Noé Laurent', 'Noé Laurent', 'نوي لوران'),
    summary: copy('Des cas limites, des schémas et des tests pour rendre les programmes plus compréhensibles.', 'Edge cases, sketches and tests to make programs easier to understand.', 'حالات حدّية ورسوم واختبارات تجعل البرامج أسهل فهمًا.'),
    eyebrow: copy('Transcender · Systèmes', 'Transcender · Systems', 'ترانسيندر · أنظمة'),
    role: copy('Spécialisation en cours · Systèmes et outils', 'Specialising · Systems and tools', 'تخصّص قيد المتابعة · أنظمة وأدوات'),
    status: 'transcender', avatar: './assets/profile-avatars/noe-laurent.svg', socialLinks: [],
    tags: ['C', 'Parsing', 'Testing'], publishedAt: '2026-09-19',
    bio: copy('J’aime comprendre un programme en dessinant ce qui circule entre ses différentes parties. Après avoir terminé le tronc commun à Paris en 2025, je poursuis une spécialisation autour des systèmes et des outils. Je continue aussi d’affiner avec Leïla les tests de notre shell et de garder une trace de nos questions.', 'I like understanding a program by drawing what moves between its parts. After completing the common core in Paris in 2025, I am continuing with a specialisation focused on systems and tools. I also keep refining the tests for our shell with Leïla and recording our questions.', 'أحب فهم البرامج برسم ما ينتقل بين أجزائها. بعد إتمام الجذع المشترك في باريس عام 2025، أواصل تخصّصي في الأنظمة والأدوات. وأستمر أيضًا في تحسين اختبارات صدفة الأوامر مع ليلى وتدوين أسئلتنا.'),
    milestones: [
      {date: '2023', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Petits programmes personnels pour apprendre en construisant et en observant leurs erreurs.', 'Small personal programs to learn by building and observing their mistakes.', 'برامج شخصية صغيرة للتعلّم من البناء وملاحظة الأخطاء.')},
      {date: '2024–2025', label: copy('Tronc commun terminé', 'Common core completed', 'إتمام الجذع المشترك'), text: copy('Apprentissage à Paris, projet de shell avec Leïla et fin du tronc commun en 2025.', 'Learning in Paris, building a shell with Leïla and completing the common core in 2025.', 'التعلّم في باريس وبناء صدفة أوامر مع ليلى وإتمام الجذع المشترك في عام 2025.')},
      {date: '2026', label: copy('Spécialisation en cours', 'Specialisation in progress', 'تخصّص قيد المتابعة'), text: copy('Approfondir les systèmes et les outils, tout en poursuivant les tests des projets précédents.', 'Going further into systems and tools while continuing to test earlier projects.', 'التعمّق في الأنظمة والأدوات مع مواصلة اختبار المشاريع السابقة.')}
    ],
    journeyEntryId: null
  },
  {
    id: 'profile-ines-morel', arrivalYear: 2022, promotionNumber: 6, intraLogin: 'imorel', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'lyon', cover: 'profile',
    title: copy('Inès Morel', 'Inès Morel', 'إيناس موريل'),
    summary: copy('Faire apparaître un lieu à l’écran et raconter les essais qui lui donnent forme.', 'Make a place appear on screen and tell the story of the experiments that shape it.', 'بناء مكان على الشاشة وسرد التجارب التي تمنحه شكله.'),
    eyebrow: copy('Alumni · Graphisme', 'Alumni · Graphics', 'خريجة · رسوميات'),
    role: copy('Graphisme temps réel et outils visuels', 'Real-time graphics and visual tools', 'رسوميات آنية وأدوات بصرية'),
    status: 'alumni', avatar: './assets/profile-avatars/ines-morel.svg', socialLinks: [],
    tags: ['C', 'Raycasting', 'Textures'], publishedAt: '2026-09-25',
    bio: copy('Le dessin m’a donné envie de comprendre comment un ordinateur représente un espace. Mon passage à 42 Lyon m’a amenée à explorer le raycasting, les textures et le mouvement. Aujourd’hui, je poursuis ces expériences graphiques et je partage les petits déclics du débogage dans les chroniques.', 'Drawing made me curious about how computers represent space. My time at 42 Lyon led me to explore raycasting, textures and movement. Today I continue those graphics experiments and share small debugging discoveries in Chronicles.', 'دفعني الرسم إلى التساؤل عن طريقة تمثيل الحاسوب للمكان. خلال تجربتي في 42 ليون، استكشفت تتبّع الأشعة والأنسجة والحركة. أواصل اليوم هذه التجارب البصرية وأشارك لحظات الفهم الصغيرة أثناء التنقيح في حكايات.'),
    milestones: [
      {date: '2021', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Croquis, petits jeux et curiosité pour les images produites par du code.', 'Sketches, small games and curiosity about images made with code.', 'رسوم وألعاب صغيرة وفضول تجاه الصور التي تنتجها الشيفرة.')},
      {date: '2022–2025', label: copy('À Lyon', 'In Lyon', 'في ليون'), text: copy('Du C aux premiers couloirs en raycasting, avec des essais de perspective et de collisions.', 'From C to the first raycast corridors, experimenting with perspective and collisions.', 'من لغة C إلى أولى الممرات بتتبّع الأشعة، مع تجارب المنظور والتصادم.')},
      {date: '2026', label: copy('Après 42', 'After 42', 'بعد 42'), text: copy('Poursuivre des prototypes visuels et garder le lien avec les échanges du campus.', 'Continuing visual prototypes and staying connected to conversations on campus.', 'مواصلة النماذج البصرية والحفاظ على الصلة بالنقاشات داخل الحرم.')}
    ],
    journeyEntryId: null
  },
  {
    id: 'profile-haru-mizuno', arrivalYear: 2024, promotionNumber: 7, intraLogin: 'hmizuno', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'tokyo', cover: 'profile',
    title: copy('Haru Mizuno', 'Haru Mizuno', 'هارو ميزونو'),
    summary: copy('Comprendre les connexions, les messages et ce qu’un prototype nous apprend quand on le partage.', 'Understand connections, messages and what sharing a prototype can teach us.', 'فهم الاتصالات والرسائل وما نتعلّمه عندما نشارك نموذجًا أوليًا.'),
    eyebrow: copy('Cadet · Réseau', 'Cadet · Networking', 'كاديت · شبكات'),
    role: copy('Réseaux et expériences collectives', 'Networking and shared experiments', 'شبكات وتجارب مشتركة'),
    status: 'student', avatar: './assets/profile-avatars/haru-mizuno.svg', socialLinks: [],
    tags: ['C++', 'Sockets', 'IRC'], publishedAt: '2026-09-16',
    bio: copy('Les outils de discussion m’ont donné envie de voir ce qui relie réellement deux ordinateurs. À 42 Tokyo, je construis un serveur de discussion et j’essaie de rendre visibles ses comportements inattendus. Je préfère partager un prototype encore imparfait pour découvrir les questions que les autres lui posent.', 'Chat tools made me want to see what really connects two computers. At 42 Tokyo, I am building a chat server and trying to make its unexpected behaviours visible. I prefer sharing an unfinished prototype to discover the questions others bring to it.', 'دفعتني أدوات المحادثة إلى فهم ما يربط حاسوبين فعلًا. في 42 طوكيو، أبني خادم محادثة وأحاول توضيح سلوكياته غير المتوقعة. أفضل مشاركة نموذج غير مكتمل لاكتشاف الأسئلة التي يطرحها الآخرون حوله.'),
    milestones: [
      {date: '2023', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Découverte des scripts et des échanges de messages entre petits programmes.', 'Discovering scripts and message exchanges between small programs.', 'اكتشاف السكربتات وتبادل الرسائل بين برامج صغيرة.')},
      {date: '2024', label: copy('Apprendre à Tokyo', 'Learning in Tokyo', 'التعلّم في طوكيو'), text: copy('Premiers projets en C, puis exploration du C++ et des sockets avec les pairs.', 'First C projects, then exploring C++ and sockets with peers.', 'أولى المشاريع بلغة C، ثم استكشاف C++ والمقابس مع الزملاء.')},
      {date: '2026', label: copy('Aujourd’hui', 'Today', 'اليوم'), text: copy('Tester un serveur IRC et raconter ce que les démonstrations inachevées font émerger.', 'Testing an IRC server and writing about what unfinished demos reveal.', 'اختبار خادم IRC والكتابة عمّا تكشفه العروض غير المكتملة.')}
    ],
    journeyEntryId: null
  },
  {
    id: 'profile-luiza-costa', arrivalYear: 2024, promotionNumber: 4, intraLogin: 'lcosta', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'rio', cover: 'profile',
    title: copy('Luiza Costa', 'Luiza Costa', 'لويزا كوستا'),
    summary: copy('Créer de petits outils où chacun peut lire, écrire et prendre le temps de chercher.', 'Create small tools where everyone can read, write and take time to explore.', 'إنشاء أدوات صغيرة تتيح للجميع القراءة والكتابة وأخذ الوقت للاستكشاف.'),
    eyebrow: copy('Cadet · Web', 'Cadet · Web', 'كاديت · ويب'),
    role: copy('Interfaces web et accessibilité', 'Web interfaces and accessibility', 'واجهات ويب وإمكانية الوصول'),
    status: 'student', avatar: './assets/profile-avatars/luiza-costa.svg', socialLinks: [],
    tags: ['TypeScript', 'CSS', 'Accessibility'], publishedAt: '2026-09-28',
    bio: copy('Je m’intéresse aux interfaces qui laissent de la place aux rythmes de chacun. Depuis 42 Rio, je développe un carnet partagé avec Caio, alumni de São Paulo. Nous explorons la lecture, les brouillons et la navigation au clavier, en gardant nos essais autant que leurs résultats.', 'I am interested in interfaces that make room for different paces. From 42 Rio, I am developing a shared notebook with Caio, an alumnus of São Paulo. We explore reading, drafts and keyboard navigation, keeping our experiments alongside their results.', 'أهتم بالواجهات التي تحترم اختلاف إيقاع كل شخص. من 42 ريو، أطوّر دفترًا مشتركًا مع كايو، أحد خريجي ساو باولو. نستكشف القراءة والمسودات والتنقّل بلوحة المفاتيح، ونحتفظ بالتجارب إلى جانب نتائجها.'),
    milestones: [
      {date: '2023', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Premières pages personnelles et envie de comprendre comment chacun les utilise.', 'First personal pages and a wish to understand how different people use them.', 'صفحات شخصية أولى ورغبة في فهم كيفية استخدامها من أشخاص مختلفين.')},
      {date: '2024', label: copy('À Rio', 'In Rio', 'في ريو'), text: copy('Apprentissage du code en collectif et attention grandissante à l’accessibilité.', 'Learning to code with others and paying closer attention to accessibility.', 'تعلّم البرمجة مع الآخرين والاهتمام المتزايد بإمكانية الوصول.')},
      {date: '2026', label: copy('Aujourd’hui', 'Today', 'اليوم'), text: copy('Construire un jardin de petites idées avec Caio, entre Rio et São Paulo.', 'Building a garden of small ideas with Caio, between Rio and São Paulo.', 'بناء حديقة من الأفكار الصغيرة مع كايو، بين ريو وساو باولو.')}
    ],
    journeyEntryId: null
  },
  {
    id: 'profile-caio-mendes', arrivalYear: 2022, promotionNumber: 3, intraLogin: 'cmendes', intraLoginIsDemo: true, section: 'people', kind: 'profile', campus: 'sao', cover: 'profile',
    title: copy('Caio Mendes', 'Caio Mendes', 'كايو مينديز'),
    summary: copy('Changer de voie, garder des notes et rendre l’apprentissage un peu plus accueillant.', 'Change direction, keep notes and make learning a little more welcoming.', 'تغيير المسار وتدوين الملاحظات وجعل التعلّم أكثر ترحيبًا.'),
    eyebrow: copy('Alumni · Outils collaboratifs', 'Alumni · Collaborative tools', 'خريج · أدوات تعاونية'),
    role: copy('Développement web et transmission', 'Web development and sharing knowledge', 'تطوير الويب ومشاركة المعرفة'),
    status: 'alumni', avatar: './assets/profile-avatars/caio-mendes.svg', socialLinks: [],
    tags: ['TypeScript', 'Learning', 'Collaboration'], publishedAt: '2026-09-12',
    bio: copy('Après une première expérience dans l’organisation de projets, j’ai choisi d’apprendre à programmer à 42 São Paulo. Tenir un carnet m’a aidé à reconnaître les progrès modestes et les détours utiles. Je poursuis aujourd’hui cette idée dans un outil partagé avec Luiza, à Rio.', 'After an initial experience organising projects, I chose to learn programming at 42 São Paulo. Keeping a notebook helped me recognise small steps forward and useful detours. Today I am carrying that idea into a shared tool with Luiza in Rio.', 'بعد تجربة أولى في تنظيم المشاريع، اخترت تعلّم البرمجة في 42 ساو باولو. ساعدني تدوين الملاحظات على رؤية التقدّم الصغير وفائدة الطرق غير المباشرة. أواصل اليوم هذه الفكرة في أداة مشتركة مع لويزا في ريو.'),
    milestones: [
      {date: '2021', label: copy('Avant 42', 'Before 42', 'قبل 42'), text: copy('Organisation de projets, puis premières découvertes du code et envie de changer de voie.', 'Organising projects, then discovering code and wanting to change direction.', 'تنظيم المشاريع، ثم اكتشاف البرمجة والرغبة في تغيير المسار.')},
      {date: '2022–2025', label: copy('Trouver son rythme', 'Finding a pace', 'العثور على الإيقاع المناسب'), text: copy('Apprendre à São Paulo en gardant des notes, en revenant sur les bases et en travaillant avec les autres.', 'Learning in São Paulo through notes, revisiting the basics and working with others.', 'التعلّم في ساو باولو عبر الملاحظات والعودة إلى الأساسيات والعمل مع الآخرين.')},
      {date: '2026', label: copy('Après 42', 'After 42', 'بعد 42'), text: copy('Poursuivre des outils collaboratifs avec Luiza et partager les traces du chemin parcouru.', 'Continuing collaborative tools with Luiza and sharing traces of the journey.', 'مواصلة تطوير أدوات تعاونية مع لويزا ومشاركة آثار المسار الذي قطعناه.')}
    ],
    journeyEntryId: 'path-making-room-to-learn'
  },
  ...demoProfiles,
  ...expandedProfiles
]);

export const profileById = new Map(profiles.map(profile => [profile.id, profile]));

// The order is the display order, not a ranking of contributions. These links are
// invented solely to demonstrate individual and shared authorship in the UI.
export const entryAuthors = deepFreeze({
  'ft-transcendence-building-together': ['profile-leila-mansour', 'profile-noe-laurent', 'profile-ines-morel', 'profile-haru-mizuno', 'profile-luiza-costa'],
  'minishell-under-the-prompt': ['profile-leila-mansour', 'profile-noe-laurent'],
  'raycast-find-the-light': ['profile-ines-morel'],
  'network-messages-between-us': ['profile-haru-mizuno'],
  'garden-small-useful-tools': ['profile-luiza-costa', 'profile-caio-mendes'],
  'path-learning-to-ask': ['profile-leila-mansour'],
  'path-making-room-to-learn': ['profile-caio-mendes'],
  'journal-an-evening-debugging': ['profile-ines-morel'],
  'journal-share-the-unfinished': ['profile-haru-mizuno', 'profile-luiza-costa', 'profile-caio-mendes', 'profile-ines-morel'],
  ...demoEntryAuthors,
  ...expandedEntryAuthors
});

export const legacyProfileRoutes = deepFreeze({
  'path-learning-to-ask': 'profile-leila-mansour',
  'path-making-room-to-learn': 'profile-caio-mendes'
});

const authorIdsFor = id => Object.hasOwn(entryAuthors, id) ? entryAuthors[id] : [];

export function getAuthors(entry) {
  const id = typeof entry === 'string' ? entry : entry?.id;
  return authorIdsFor(id).map(profileId => profileById.get(profileId)).filter(Boolean);
}

export function getProfileEntries(profileId, entries = [], {section} = {}) {
  if (!profileById.has(profileId)) return [];
  return entries.filter(entry => entry.kind !== 'profile' &&
    (!section || entry.section === section) && authorIdsFor(entry.id).includes(profileId));
}

// Discovery lists contain people rather than the old journey-only entries. Each
// original journey remains intact inside its profile and is not duplicated in
// the global index. Input records and their copy are never rewritten.
export function createDiscoveryEntries(editorialEntries = []) {
  const journeys = new Map(editorialEntries.map(entry => [entry.id, entry]));
  const content = editorialEntries
    .filter(entry => entry.section === 'projects' || entry.section === 'journal')
    .map(entry => ({...entry, authorIds: [...authorIdsFor(entry.id)]}));
  const people = profiles.map(profile => ({...profile,
    journey: profile.journeyEntryId ? journeys.get(profile.journeyEntryId) || null : null
  }));
  return [...content, ...people];
}
