// Fictional editorial samples for the separate content-first navigation preview.
// Campus names locate the examples; they do not attribute real work to a campus.
// Optional leadAuthorId records an explicit fictional responsibility. It never
// comes from the author order, and the UI accepts it only for a listed author.
// Optional body[].media places image/video media beside the related text;
// the detail gallery also includes these media without duplicate sources.
export const previewEntries = [
  {
    id: 'minishell-under-the-prompt', section: 'projects', campus: 'paris', cover: 'shell', leadAuthorId: 'profile-leila-mansour',
    eyebrow: { fr: 'Projet illustratif · Systèmes', en: 'Sample project · Systems', ar: 'مشروع توضيحي · أنظمة' },
    title: { fr: 'Derrière une ligne de commande', en: 'Behind a command line', ar: 'خلف سطر الأوامر' },
    summary: { fr: 'Un petit shell, et toutes les questions qui se cachent entre une commande et son résultat.', en: 'A small shell, and all the questions between a command and its result.', ar: 'صدفة أوامر صغيرة، وأسئلة كثيرة تفصل كتابة الأمر عن نتيجته.' },
    tags: ['C', 'POSIX', 'Parsing'],
    technologies: ['c', 'posix'],
    body: [
      {
        heading: { fr: 'Commencer par écouter', en: 'Start by listening', ar: 'البداية من الفهم' },
        text: { fr: 'Avant de lancer un programme, un shell doit comprendre une intention : conserver les espaces entre guillemets, relier deux commandes, rediriger une sortie. Dans ce récit illustratif, le premier défi consiste à séparer ces étapes pour pouvoir les expliquer à son binôme, puis les tester une à une.', en: 'Before launching a program, a shell has to understand an intention: preserve spaces inside quotes, connect two commands, redirect output. In this illustrative account, the first challenge is separating those steps so they can be explained to a partner and tested individually.', ar: 'قبل تشغيل برنامج، على صدفة الأوامر فهم المقصود: حفظ المسافات داخل علامات الاقتباس، وربط أمرين، وإعادة توجيه المخرجات. في هذا المثال، يبدأ التحدي بفصل هذه الخطوات حتى يسهل شرحها للشريك واختبار كل خطوة على حدة.' },
        media: [{
          type: 'image', src: './assets/minishell-flow-demo.svg',
          alt: {fr: 'Schéma illustratif : lire une commande, l’analyser, l’exécuter et afficher son résultat.', en: 'Illustrative diagram: read a command, parse it, execute it and display its output.', ar: 'مخطط توضيحي: قراءة أمر وتحليله وتنفيذه ثم عرض نتيجته.'},
          caption: {fr: 'Schéma de démonstration créé pour ce récit fictif ; ce n’est pas une capture du projet.', en: 'Demonstration diagram created for this fictional account; not a screenshot of the project.', ar: 'مخطط تجريبي أُنشئ لهذا السرد الخيالي؛ وليس لقطة شاشة للمشروع.'},
          credit: {fr: 'Illustration originale · prototype Horizon', en: 'Original illustration · Horizon prototype', ar: 'رسم أصلي · نموذج Horizon'}
        }]
      },
      {
        heading: { fr: 'Ce que le débogage apprend', en: 'What debugging teaches', ar: 'ما يعلّمنا إياه التنقيح' },
        text: { fr: 'Le moment intéressant arrive lorsqu’une commande semble fonctionner mais laisse un descripteur ouvert. Suivre les ressources, dessiner les processus et comparer les cas limites devient aussi important que produire le bon texte à l’écran.', en: 'The interesting moment comes when a command seems to work but leaves a file descriptor open. Tracking resources, sketching processes and comparing edge cases becomes as important as displaying the right text.', ar: 'تظهر الأسئلة الأهم حين يبدو الأمر ناجحًا، لكنه يترك واصف ملف مفتوحًا. يصبح تتبّع الموارد ورسم العمليات ومقارنة الحالات الحدّية مهمًا بقدر ظهور النص الصحيح على الشاشة.' }
      }
    ]
  },
  {
    id: 'raycast-find-the-light', section: 'projects', campus: 'lyon', cover: 'raycast', leadAuthorId: 'profile-ines-morel',
    eyebrow: { fr: 'Projet illustratif · Graphisme', en: 'Sample project · Graphics', ar: 'مشروع توضيحي · رسوميات' },
    title: { fr: 'Une porte vers la troisième dimension', en: 'A doorway into the third dimension', ar: 'باب إلى البعد الثالث' },
    summary: { fr: 'Partir d’une grille, lancer des rayons et voir naître un lieu dans lequel on peut se déplacer.', en: 'Start with a grid, cast rays, and watch a place emerge that you can walk through.', ar: 'شبكة بسيطة وأشعة متتابعة تتحول إلى مكان يمكن التجوّل فيه.' },
    tags: ['C', 'Raycasting', 'Textures'],
    technologies: ['c'],
    body: [
      {
        heading: { fr: 'Le premier couloir', en: 'The first corridor', ar: 'الممر الأول' },
        text: { fr: 'Une grille en deux dimensions suffit à décrire les murs, mais pas encore à donner une impression de profondeur. Cet exemple suit la construction d’un moteur de raycasting : mesurer les distances, corriger la perspective et choisir la portion de texture à dessiner pour chaque colonne.', en: 'A two-dimensional grid can describe walls, but it cannot yet convey depth. This example follows the construction of a raycasting engine: measuring distances, correcting perspective and choosing which part of a texture to draw for each column.', ar: 'تكفي شبكة ثنائية الأبعاد لوصف الجدران، لكنها لا تمنح الإحساس بالعمق وحدها. يتتبّع هذا المثال بناء محرك لتتبّع الأشعة: قياس المسافات، وتصحيح المنظور، واختيار جزء النسيج الذي يُرسم في كل عمود.' }
      },
      {
        heading: { fr: 'Rendre le mouvement agréable', en: 'Make movement feel right', ar: 'حركة مريحة داخل المكان' },
        text: { fr: 'Puis viennent les détails que l’on ressent avant de les remarquer : une collision qui ne bloque pas dans un angle, une rotation régulière, une lumière lisible. Les croquis et les essais ratés racontent ici autant que l’image finale.', en: 'Then come the details you feel before you notice them: collisions that do not trap you in a corner, steady turning, readable lighting. Sketches and failed attempts tell as much of the story as the final image.', ar: 'ثم تأتي تفاصيل نشعر بها قبل أن ننتبه إليها: تصادم لا يحبسنا في زاوية، ودوران منتظم، وإضاءة واضحة. تحمل الرسوم الأولية والمحاولات غير الناجحة جزءًا من الحكاية لا يقل أهمية عن الصورة النهائية.' }
      }
    ]
  },
  {
    id: 'network-messages-between-us', section: 'projects', campus: 'tokyo', cover: 'network', leadAuthorId: 'profile-haru-mizuno',
    eyebrow: { fr: 'Projet illustratif · Réseau', en: 'Sample project · Networking', ar: 'مشروع توضيحي · شبكات' },
    title: { fr: 'Ce qui relie nos messages', en: 'What connects our messages', ar: 'ما يربط رسائلنا' },
    summary: { fr: 'Construire un serveur de discussion pour comprendre ce qu’il se passe quand plusieurs personnes parlent en même temps.', en: 'Build a chat server to understand what happens when several people speak at once.', ar: 'بناء خادم محادثة لفهم ما يحدث حين يتحدث أشخاص عدة في الوقت نفسه.' },
    tags: ['C++', 'Sockets', 'IRC'],
    technologies: ['cpp', 'sockets'],
    body: [
      {
        heading: { fr: 'Un message n’arrive pas toujours entier', en: 'A message may arrive in pieces', ar: 'قد تصل الرسالة على أجزاء' },
        text: { fr: 'Derrière une conversation apparemment simple, les données arrivent par morceaux et les connexions peuvent disparaître. Ce projet illustratif explore la réception progressive des commandes, l’état des salons et la circulation des messages sans immobiliser les autres participants lorsqu’un client répond lentement.', en: 'Behind a seemingly simple conversation, data arrives in fragments and connections can disappear. This sample project explores incremental command handling, channel state and message delivery without holding up everyone else when one client responds slowly.', ar: 'خلف المحادثة البسيطة ظاهريًا، تصل البيانات على أجزاء وقد تنقطع الاتصالات. يستكشف هذا المشروع التوضيحي استقبال الأوامر تدريجيًا، وحالة القنوات، وتمرير الرسائل دون تعطيل الجميع عندما يتباطأ أحد العملاء.' }
      },
      {
        heading: { fr: 'Penser aux absences', en: 'Plan for disconnections', ar: 'التفكير في الانقطاع' },
        text: { fr: 'Le carnet ne garde pas seulement les échanges réussis. Il décrit aussi un départ inattendu, une commande incomplète et un salon vide. Ces situations obligent à rendre les règles explicites et donnent une place centrale aux tests entre pairs.', en: 'The notebook keeps more than successful exchanges. It also describes an unexpected departure, an incomplete command and an empty channel. These situations make the rules explicit and put testing with peers at the heart of the work.', ar: 'لا يقتصر الدفتر على المحادثات الناجحة؛ بل يتناول أيضًا خروجًا مفاجئًا، وأمرًا ناقصًا، وقناة فارغة. تدفع هذه الحالات إلى توضيح القواعد، وتمنح الاختبار مع الزملاء مكانًا أساسيًا في العمل.' }
      }
    ]
  },
  {
    id: 'garden-small-useful-tools', section: 'projects', campus: 'rio', cover: 'garden', leadAuthorId: 'profile-caio-mendes',
    eyebrow: { fr: 'Projet illustratif · Web', en: 'Sample project · Web', ar: 'مشروع توضيحي · ويب' },
    title: { fr: 'Un jardin de petites idées', en: 'A garden of small ideas', ar: 'حديقة من الأفكار الصغيرة' },
    summary: { fr: 'Un carnet partagé pour conserver une trouvaille, documenter un essai et donner envie de construire ensemble.', en: 'A shared notebook for discoveries, experiments and the urge to build together.', ar: 'دفتر مشترك للاكتشافات والتجارب والرغبة في البناء معًا.' },
    tags: ['TypeScript', 'CSS', 'Accessibility'],
    technologies: ['typescript', 'css'],
    body: [
      {
        heading: { fr: 'Une idée encore fragile', en: 'An idea taking shape', ar: 'فكرة تتكوّن' },
        text: { fr: 'Toutes les idées ne commencent pas par un dépôt bien rangé. Certaines tiennent dans un dessin ou une phrase échangée au détour d’une pause. Ce projet fictif imagine un carnet où l’on peut conserver ces débuts, raconter ses essais et inviter quelqu’un à poursuivre une piste.', en: 'Not every idea begins with a tidy repository. Some fit into a sketch or a sentence shared during a break. This fictional project imagines a notebook for those beginnings: keeping them, describing experiments and inviting someone to take an idea further.', ar: 'لا تبدأ كل فكرة بمستودع مرتب. قد تبدأ برسم صغير أو جملة عابرة أثناء استراحة. يتخيّل هذا المشروع دفترًا يحتفظ بهذه البدايات، ويسمح بسرد التجارب ودعوة شخص آخر إلى متابعة فكرة.' }
      },
      {
        heading: { fr: 'Faire de la place à chacun', en: 'Make room for everyone', ar: 'مساحة للجميع' },
        text: { fr: 'Le travail porte autant sur la lecture que sur l’écriture : navigation au clavier, contrastes, formulaires compréhensibles et brouillons conservés. Un outil accueillant doit aussi laisser le temps de chercher ses mots, sans pousser à publier trop tôt.', en: 'The work considers reading as much as writing: keyboard navigation, contrast, clear forms and saved drafts. A welcoming tool should leave time to find the right words, without pushing anyone to publish too soon.', ar: 'يهتم العمل بالقراءة مثلما يهتم بالكتابة: تنقّل بلوحة المفاتيح، وتباين واضح، ونماذج مفهومة، ومسودات محفوظة. الأداة المريحة تمنحنا وقتًا للعثور على الكلمات، دون استعجال النشر.' }
      }
    ]
  },
  {
    id: 'ft-transcendence-building-together', section: 'projects', campus: 'paris', cover: 'network', leadAuthorId: 'profile-luiza-costa',
    eyebrow: {fr: 'Projet illustratif · ft_transcendence', en: 'Sample project · ft_transcendence', ar: 'مشروع توضيحي · ft_transcendence'},
    title: {fr: 'ft_transcendence · Construire à cinq', en: 'ft_transcendence · Building as five', ar: 'ft_transcendence · نبني معًا، خمسة أشخاص'},
    summary: {fr: 'Cinq regards pour imaginer une application web, relier ses écrans et apprendre à assembler un travail collectif.', en: 'Five perspectives on a web application, connecting its screens and learning to bring a team’s work together.', ar: 'خمس وجهات نظر لتصوّر تطبيق ويب وربط شاشاته وتعلّم جمع عمل الفريق في تجربة واحدة.'},
    tags: ['TypeScript', 'Web', 'Collaboration'],
    technologies: ['typescript'],
    body: [
      {
        heading: {fr: 'Se répartir le travail, garder une vision commune', en: 'Share the work and a common direction', ar: 'توزيع العمل والحفاظ على رؤية مشتركة'},
        text: {fr: 'Ce projet fictif réunit Leïla, Noé, Inès, Haru et Luiza autour d’une application web. Le groupe commence par dessiner les parcours, partager le vocabulaire et définir les points de rencontre entre interface, données et échanges.', en: 'This fictional project brings Leïla, Noé, Inès, Haru and Luiza together around a web application. They begin by sketching journeys, agreeing on vocabulary and defining how the interface, data and communication meet.', ar: 'يجمع هذا المشروع الخيالي ليلى ونوي وإيناس وهارو ولويزا حول تطبيق ويب. يبدأ الفريق برسم المسارات والاتفاق على المفردات وتحديد نقاط التقاء الواجهة والبيانات والتواصل.'}
      },
      {
        heading: {fr: 'Assembler, essayer, reprendre ensemble', en: 'Bring it together, try it, improve it together', ar: 'التجميع والتجربة والتحسين معًا'},
        text: {fr: 'La réalisation se raconte à travers les essais : brancher deux écrans, comparer les comportements attendus, relire une contribution et documenter une décision. Une démo commune révèle les détails qui se perdent entre les tâches. Le carnet conserve ces échanges autant que le résultat, avec chaque personne reliée à son profil.', en: 'The development story follows the experiments: connect two screens, compare expected behaviours, review a contribution and record a decision. A shared demo reveals details that can fall between tasks. The notebook keeps those conversations alongside the result, linking every contributor to their profile.', ar: 'تُروى عملية الإنجاز عبر التجارب: ربط شاشتين ومقارنة السلوك المتوقع ومراجعة مساهمة وتوثيق قرار. يكشف العرض الجماعي التفاصيل التي قد تضيع بين المهام. يحتفظ الدفتر بهذه النقاشات إلى جانب النتيجة، ويربط كل مساهم بملفه الشخصي.'}
      }
    ]
  },
  {
    id: 'path-learning-to-ask', section: 'people', campus: 'paris', cover: 'path',
    eyebrow: { fr: 'Parcours fictif · Les débuts', en: 'Fictional journey · Beginnings', ar: 'مسار تخيّلي · البدايات' },
    title: { fr: 'Apprendre à poser la bonne question', en: 'Learning to ask the right question', ar: 'تعلّم طرح السؤال المناسب' },
    summary: { fr: 'Du premier blocage à la première explication partagée : un parcours se construit aussi avec les autres.', en: 'From the first roadblock to the first shared explanation: a journey also takes shape with others.', ar: 'من أول عقبة إلى أول شرح نتشاركه: يتشكّل المسار أيضًا بمساعدة الآخرين.' },
    tags: ['C', 'Debugging', 'Peer learning'],
    body: [
      {
        heading: { fr: 'Avant de trouver la solution', en: 'Before finding the answer', ar: 'قبل الوصول إلى الحل' },
        text: { fr: 'Ce parcours fictif commence devant un programme qui refuse de compiler. La tentation est de demander une correction immédiate. Apprendre à décrire ce que l’on attend, ce que l’on observe et ce que l’on a déjà essayé change peu à peu la manière d’aborder le problème.', en: 'This fictional journey begins with a program that refuses to compile. The temptation is to ask for an immediate fix. Learning to describe what you expect, what you see and what you have already tried gradually changes how you approach the problem.', ar: 'يبدأ هذا المسار التخيّلي أمام برنامج لا يُترجم بنجاح. قد يكون أول رد فعل هو طلب حل جاهز. لكن تعلّم وصف المتوقع، وما يحدث فعلًا، وما جُرّب حتى الآن، يغيّر تدريجيًا طريقة التعامل مع المشكلة.' }
      },
      {
        heading: { fr: 'Puis transmettre à son tour', en: 'Then pass it on', ar: 'ثم مشاركة ما تعلّمناه' },
        text: { fr: 'Le déclic n’est pas une note ni un classement. C’est pouvoir expliquer une erreur à quelqu’un qui la rencontre pour la première fois. Le carnet garde cette étape modeste, les hésitations et les petits outils qui rendent la suite moins intimidante.', en: 'The turning point is neither a grade nor a ranking. It is being able to explain an error to someone encountering it for the first time. The notebook keeps that modest step, the uncertainties and the small tools that make what comes next less daunting.', ar: 'ليست نقطة التحول درجةً أو ترتيبًا، بل القدرة على شرح خطأ لشخص يواجهه للمرة الأولى. يحتفظ الدفتر بهذه الخطوة البسيطة، وبالتردد والأدوات الصغيرة التي تجعل ما يأتي بعدها أقل رهبة.' }
      }
    ]
  },
  {
    id: 'path-making-room-to-learn', section: 'people', campus: 'sao', cover: 'path',
    eyebrow: { fr: 'Parcours fictif · Changer de voie', en: 'Fictional journey · A new direction', ar: 'مسار تخيّلي · اتجاه جديد' },
    title: { fr: 'Trouver son propre rythme', en: 'Finding your own pace', ar: 'العثور على إيقاع يناسبنا' },
    summary: { fr: 'Reprendre des bases, accepter les détours et garder une trace de ce que l’on comprend vraiment.', en: 'Return to the basics, allow for detours and keep track of what you truly understand.', ar: 'العودة إلى الأساسيات، وتقبّل الطرق غير المباشرة، وتدوين ما نفهمه حقًا.' },
    tags: ['Learning', 'Notes', 'Collaboration'],
    body: [
      {
        heading: { fr: 'Recommencer autrement', en: 'Begin again, differently', ar: 'بداية جديدة بطريقة مختلفة' },
        text: { fr: 'Changer de voie ne signifie pas repartir sans bagage. Dans ce récit fictif, organiser un travail, écouter et demander de l’aide deviennent des appuis pour apprendre à programmer. Les notions techniques prennent du temps ; le parcours laisse une place aux retours en arrière, sans les présenter comme des échecs.', en: 'Changing direction does not mean starting with nothing. In this fictional account, organising work, listening and asking for help become foundations for learning to code. Technical concepts take time; the journey makes room for revisiting earlier steps without treating them as failures.', ar: 'تغيير المسار لا يعني البدء بلا خبرة. في هذه الحكاية التخيّلية، يصبح تنظيم العمل والإصغاء وطلب المساعدة أساسًا لتعلّم البرمجة. تحتاج المفاهيم التقنية إلى وقت؛ ويترك المسار مجالًا للعودة إلى خطوات سابقة دون اعتبارها إخفاقًا.' }
      },
      {
        heading: { fr: 'Rendre les progrès visibles', en: 'Make progress visible', ar: 'رؤية التقدّم الصغير' },
        text: { fr: 'Une note relue quelques semaines plus tard peut montrer le chemin parcouru. Comprendre un pointeur, rendre une fonction plus claire ou mener une revue à deux : ces petites avancées donnent de la matière au récit, bien avant un grand projet terminé.', en: 'Reading an old note a few weeks later can reveal how far you have come. Understanding a pointer, making a function clearer or reviewing code together: these small steps give the story substance long before a large project is finished.', ar: 'قد تكشف قراءة ملاحظة قديمة بعد أسابيع مقدار ما تعلّمناه. فهم مؤشر، أو توضيح دالة، أو مراجعة شيفرة مع زميل: خطوات صغيرة تستحق أن تُروى، حتى قبل اكتمال مشروع كبير.' }
      }
    ]
  },
  {
    id: 'journal-an-evening-debugging', section: 'journal', campus: 'lyon', cover: 'journal', leadAuthorId: 'profile-ines-morel',
    eyebrow: { fr: 'Article illustratif · Vie de campus', en: 'Sample article · Campus life', ar: 'مقال توضيحي · حياة الحرم' },
    title: { fr: 'Autour d’un bug, une conversation', en: 'A bug becomes a conversation', ar: 'حديث يبدأ بخطأ برمجي' },
    summary: { fr: 'Un carnet sur ces échanges informels où expliquer son problème devient déjà une partie de la solution.', en: 'A note on informal conversations where explaining a problem becomes part of solving it.', ar: 'حكاية عن أحاديث عفوية يصبح فيها شرح المشكلة جزءًا من حلّها.' },
    tags: ['Debugging', 'Community'],
    body: [
      {
        heading: { fr: 'Un écran, plusieurs regards', en: 'One screen, several perspectives', ar: 'شاشة واحدة ووجهات نظر متعددة' },
        text: { fr: 'Cet article fictif prend place autour d’une table, lorsqu’un résultat inattendu attire la curiosité. Une personne reprend les entrées, une autre pose une question toute simple. Le programme n’a pas encore changé, mais le problème paraît déjà moins opaque parce qu’il vient d’être raconté à voix haute.', en: 'This fictional article takes place around a table, where an unexpected result sparks curiosity. One person checks the inputs; another asks a simple question. The program has not changed, but the problem already feels less opaque because it has been described aloud.', ar: 'يدور هذا المقال التخيّلي حول طاولة يثير عندها ناتج غير متوقع الفضول. يعيد شخص فحص المدخلات، ويسأل آخر سؤالًا بسيطًا. لم يتغيّر البرنامج بعد، لكن المشكلة أصبحت أوضح بمجرد شرحها بصوت مسموع.' }
      },
      {
        heading: { fr: 'Ce qui mérite aussi d’être raconté', en: 'Another story worth telling', ar: 'حكاية تستحق أن تُروى أيضًا' },
        text: { fr: 'Un journal de campus peut garder ces moments ordinaires, sans transformer chaque essai en exploit. Ce qui compte ici, c’est la patience, la diversité des raisonnements et le plaisir de comprendre ensemble pourquoi une petite ligne produit un si grand détour.', en: 'A campus journal can keep these ordinary moments without turning every attempt into a triumph. What matters here is patience, different ways of reasoning and the pleasure of discovering together why one small line led to such a long detour.', ar: 'يمكن ليوميات الحرم أن تحفظ هذه اللحظات العادية دون تحويل كل محاولة إلى إنجاز استثنائي. المهم هنا هو الصبر وتنوّع طرق التفكير ومتعة الفهم المشترك: كيف قاد سطر صغير إلى كل هذا البحث؟' }
      }
    ]
  },
  {
    id: 'journal-share-the-unfinished', section: 'journal', campus: 'tokyo', cover: 'journal', leadAuthorId: 'profile-ines-morel',
    eyebrow: { fr: 'Article illustratif · Dans l’atelier', en: 'Sample article · In the workshop', ar: 'مقال توضيحي · داخل الورشة' },
    title: { fr: 'Montrer ce qui n’est pas encore fini', en: 'Sharing work before it is finished', ar: 'مشاركة العمل قبل اكتماله' },
    summary: { fr: 'Une démonstration peut ouvrir une discussion, même quand il reste des coins à arrondir.', en: 'A demo can open a conversation, even while there are still rough edges.', ar: 'قد يفتح عرض بسيط باب النقاش، حتى حين تبقى تفاصيل تحتاج إلى تحسين.' },
    tags: ['Prototyping', 'Feedback'],
    body: [
      {
        heading: { fr: 'Ouvrir l’atelier', en: 'Open the workshop', ar: 'فتح أبواب الورشة' },
        text: { fr: 'Dans cette scène illustrative, on présente une idée avec ses limites, ses questions et les traces de ses premières versions. L’échange ne cherche pas à distribuer des bons points. Il permet de découvrir ce que les autres comprennent spontanément, ce qui manque et ce qui leur donne envie d’essayer.', en: 'In this illustrative scene, an idea is shared with its limitations, questions and traces of early versions. The conversation is not about handing out marks. It reveals what others understand immediately, what is missing and what makes them want to try it.', ar: 'في هذا المشهد التوضيحي، تُعرض فكرة مع حدودها وأسئلتها وآثار نسخها الأولى. لا يهدف النقاش إلى توزيع الدرجات، بل إلى اكتشاف ما يفهمه الآخرون تلقائيًا، وما ينقصهم، وما يدفعهم إلى التجربة.' }
      },
      {
        heading: { fr: 'Garder une question pour demain', en: 'Keep a question for tomorrow', ar: 'سؤال نحتفظ به للغد' },
        text: { fr: 'Le carnet peut ensuite raconter une décision concrète : simplifier une action, revoir une explication ou abandonner une fausse bonne idée. Montrer ces choix rend le travail plus accessible et rappelle qu’un projet se construit par ajustements, avec les regards qui l’accompagnent.', en: 'The notebook can then describe a concrete decision: simplify an action, rethink an explanation or let go of an idea that did not work. Showing those choices makes the work more approachable and reminds us that projects grow through adjustments and other perspectives.', ar: 'يمكن للدفتر بعدها أن يروي قرارًا محددًا: تبسيط خطوة، أو مراجعة شرح، أو ترك فكرة لم تنجح. تجعل هذه الاختيارات العمل أقرب إلى القارئ، وتذكّر بأن المشاريع تنمو بالتعديل وبوجهات النظر التي ترافقها.' }
      }
    ]
  }
];
