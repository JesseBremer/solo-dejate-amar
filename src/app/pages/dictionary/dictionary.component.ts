import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DictionaryService } from '../../services/dictionary.service';
import { LanguageService } from '../../services/language.service';
import { IdentityService } from '../../services/identity.service';
import { DictionaryEntry, DictionaryCategory } from '../../models';

interface CategoryMeta { key: DictionaryCategory; emoji: string; en: string; es: string; }

const CATEGORIES: CategoryMeta[] = [
  { key: 'basics',    emoji: '🪪', en: 'Basics',          es: 'Lo Básico' },
  { key: 'past',      emoji: '🕰️', en: 'Past & Roots',    es: 'Pasado y Raíces' },
  { key: 'inner',     emoji: '🧠', en: 'Heart & Mind',    es: 'Corazón y Mente' },
  { key: 'people',    emoji: '👪', en: 'People',          es: 'Personas' },
  { key: 'dates',     emoji: '📅', en: 'Dates',           es: 'Fechas' },
  { key: 'food',      emoji: '🍽️', en: 'Food',            es: 'Comida' },
  { key: 'favorites', emoji: '⭐', en: 'Favorites',       es: 'Favoritos' },
  { key: 'sizes',     emoji: '📏', en: 'Sizes',           es: 'Tallas' },
  { key: 'health',    emoji: '🩺', en: 'Health',          es: 'Salud' },
  { key: 'comfort',   emoji: '💗', en: 'Comfort',         es: 'Consuelo' },
  { key: 'love',      emoji: '💞', en: 'Love & Us',       es: 'Amor y Nosotros' },
  { key: 'intimacy',  emoji: '🔥', en: 'Intimacy',        es: 'Intimidad' },
  { key: 'future',    emoji: '🔮', en: 'Dreams & Future', es: 'Sueños y Futuro' },
  { key: 'words',     emoji: '🗣️', en: 'Words & Phrases', es: 'Palabras y Frases' },
  { key: 'gifts',     emoji: '🎁', en: 'Gift Ideas',      es: 'Ideas de Regalo' },
  { key: 'questions', emoji: '👤', en: 'Personal',        es: 'Personal' },
  { key: 'other',     emoji: '📌', en: 'Other',           es: 'Otro' },
];

// Preset prompts shown as quick-fill suggestions on your own page — a profile checklist
const PRESETS: { category: DictionaryCategory; en: string; es: string }[] = [
  // Basics
  { category: 'basics', en: 'Full name',                 es: 'Nombre completo' },
  { category: 'basics', en: 'Nickname',                  es: 'Apodo' },
  { category: 'basics', en: 'Hometown',                  es: 'Ciudad natal' },
  { category: 'basics', en: 'Where I live now',          es: 'Dónde vivo ahora' },
  { category: 'basics', en: 'Zodiac sign',               es: 'Signo zodiacal' },
  { category: 'basics', en: 'Height',                    es: 'Estatura' },
  { category: 'basics', en: 'Languages I speak',         es: 'Idiomas que hablo' },
  { category: 'basics', en: 'My religion or beliefs',    es: 'Mi religión o creencias' },
  { category: 'basics', en: 'A fun fact about me',       es: 'Un dato curioso sobre mí' },
  { category: 'basics', en: "Something most people don't know", es: 'Algo que casi nadie sabe' },

  // People
  { category: 'people', en: "My mom's name",             es: 'Nombre de mi mamá' },
  { category: 'people', en: "My dad's name",             es: 'Nombre de mi papá' },
  { category: 'people', en: 'My siblings (names)',       es: 'Mis hermanos (nombres)' },
  { category: 'people', en: 'My grandparents',           es: 'Mis abuelos' },
  { category: 'people', en: 'My best friend',            es: 'Mi mejor amigo/a' },
  { category: 'people', en: 'My pets',                   es: 'Mis mascotas' },
  { category: 'people', en: 'My closest cousin',         es: 'Mi primo/a más cercano/a' },
  { category: 'people', en: 'Who to call in an emergency', es: 'A quién llamar en una emergencia' },
  { category: 'people', en: 'People who feel like family', es: 'Personas que son como familia' },

  // Dates
  { category: 'dates', en: 'My birthday',                es: 'Mi cumpleaños' },
  { category: 'dates', en: "Mom's birthday",             es: 'Cumpleaños de mamá' },
  { category: 'dates', en: "Dad's birthday",             es: 'Cumpleaños de papá' },
  { category: 'dates', en: "My siblings' birthdays",     es: 'Cumpleaños de mis hermanos' },
  { category: 'dates', en: 'Our anniversary',            es: 'Nuestro aniversario' },
  { category: 'dates', en: 'Other birthdays to remember', es: 'Otros cumpleaños para recordar' },
  { category: 'dates', en: 'Dates that matter to me',    es: 'Fechas que me importan' },

  // Food
  { category: 'food', en: 'Favorite dish',               es: 'Plato favorito' },
  { category: 'food', en: 'Comfort food',                es: 'Comida reconfortante' },
  { category: 'food', en: 'Favorite restaurant',         es: 'Restaurante favorito' },
  { category: 'food', en: 'Go-to coffee or drink order', es: 'Mi pedido de café o bebida' },
  { category: 'food', en: 'Favorite snack',              es: 'Botana favorita' },
  { category: 'food', en: 'Favorite dessert',            es: 'Postre favorito' },
  { category: 'food', en: 'Foods I dislike',             es: 'Comidas que no me gustan' },
  { category: 'food', en: 'My takeout order',            es: 'Mi pedido para llevar' },

  // Favorites
  { category: 'favorites', en: 'Favorite color',         es: 'Color favorito' },
  { category: 'favorites', en: 'Favorite movie',         es: 'Película favorita' },
  { category: 'favorites', en: 'Favorite show',          es: 'Serie favorita' },
  { category: 'favorites', en: 'Favorite song',          es: 'Canción favorita' },
  { category: 'favorites', en: 'Favorite artist or band', es: 'Artista o banda favorita' },
  { category: 'favorites', en: 'Favorite book',          es: 'Libro favorito' },
  { category: 'favorites', en: 'Favorite flower',        es: 'Flor favorita' },
  { category: 'favorites', en: 'Favorite scent',         es: 'Aroma favorito' },
  { category: 'favorites', en: 'Favorite season',        es: 'Estación favorita' },
  { category: 'favorites', en: 'Favorite animal',        es: 'Animal favorito' },
  { category: 'favorites', en: 'Favorite place',         es: 'Lugar favorito' },
  { category: 'favorites', en: 'Dream vacation',         es: 'Vacaciones soñadas' },

  // Sizes
  { category: 'sizes', en: 'Shirt size',                 es: 'Talla de camisa' },
  { category: 'sizes', en: 'Pants size',                 es: 'Talla de pantalón' },
  { category: 'sizes', en: 'Shoe size',                  es: 'Talla de zapato' },
  { category: 'sizes', en: 'Ring size',                  es: 'Talla de anillo' },
  { category: 'sizes', en: 'Dress size',                 es: 'Talla de vestido' },
  { category: 'sizes', en: 'Favorite clothing brands',   es: 'Marcas de ropa favoritas' },

  // Health
  { category: 'health', en: 'Allergies',                 es: 'Alergias' },
  { category: 'health', en: 'Dietary restrictions',      es: 'Restricciones alimenticias' },
  { category: 'health', en: 'Medications I take',        es: 'Medicamentos que tomo' },
  { category: 'health', en: 'Health conditions to know', es: 'Condiciones de salud que debes saber' },
  { category: 'health', en: 'Blood type',                es: 'Tipo de sangre' },
  { category: 'health', en: 'My doctor',                 es: 'Mi doctor/a' },

  // Comfort
  { category: 'comfort', en: 'How to comfort me',        es: 'Cómo consolarme' },
  { category: 'comfort', en: 'My love language',         es: 'Mi lenguaje del amor' },
  { category: 'comfort', en: 'What cheers me up',        es: 'Lo que me anima' },
  { category: 'comfort', en: "What I need when I'm sad",  es: 'Lo que necesito cuando estoy triste' },
  { category: 'comfort', en: 'My pet peeves',            es: 'Lo que me molesta' },
  { category: 'comfort', en: 'What helps me sleep',      es: 'Lo que me ayuda a dormir' },
  { category: 'comfort', en: 'My comfort show or movie', es: 'Mi serie o película de consuelo' },
  { category: 'comfort', en: 'How I like to be cared for when sick', es: 'Cómo me gusta que me cuiden enfermo/a' },

  // Words
  { category: 'words', en: 'Pet name I love',            es: 'Apodo que me encanta' },
  { category: 'words', en: 'Slang I always use',         es: 'Jerga que siempre uso' },
  { category: 'words', en: 'A word in my language you should know', es: 'Una palabra de mi idioma que deberías saber' },

  // Gifts
  { category: 'gifts', en: "Something I've always wanted", es: 'Algo que siempre he querido' },
  { category: 'gifts', en: 'My wishlist',                es: 'Mi lista de deseos' },
  { category: 'gifts', en: 'My favorite way to be surprised', es: 'Mi forma favorita de ser sorprendido/a' },
];

// Deep, comprehensive question bank — one surfaced per day, rotating through the list
interface QuestionGroup { en: string; es: string; questions: { en: string; es: string }[]; }

const QUESTION_GROUPS: QuestionGroup[] = [
  { en: 'Childhood & roots', es: 'Niñez y raíces', questions: [
  { en: "Where did you grow up, and what was it like?", es: "¿Dónde creciste y cómo era?" },
  { en: "What is your happiest childhood memory?", es: "¿Cuál es tu recuerdo más feliz de la niñez?" },
  { en: "What is a childhood memory that still hurts?", es: "¿Qué recuerdo de la niñez todavía te duele?" },
  { en: "What were you like as a kid?", es: "¿Cómo eras de niño/a?" },
  { en: "What did you want to be when you grew up?", es: "¿Qué querías ser cuando fueras grande?" },
  { en: "What was your favorite game or toy?", es: "¿Cuál era tu juego o juguete favorito?" },
  { en: "Who was your childhood best friend?", es: "¿Quién fue tu mejor amigo/a de la infancia?" },
  { en: "What food reminds you of childhood?", es: "¿Qué comida te recuerda a tu niñez?" },
  { en: "What smell takes you back to being young?", es: "¿Qué olor te transporta a cuando eras joven?" },
  { en: "What was your childhood home like?", es: "¿Cómo era la casa donde creciste?" },
  { en: "What is something your parents always said to you?", es: "¿Qué te decían siempre tus padres?" },
  { en: "Were you closer to your mom or your dad growing up?", es: "¿Eras más cercano/a a tu mamá o a tu papá?" },
  { en: "What tradition from your childhood do you want to keep?", es: "¿Qué tradición de tu niñez quieres conservar?" },
  { en: "What is something you missed out on as a kid?", es: "¿Qué te perdiste de vivir cuando eras niño/a?" },

  ] },
  { en: 'Family', es: 'Familia', questions: [
  { en: "Who in your family are you closest to?", es: "¿Con quién de tu familia eres más cercano/a?" },
  { en: "Tell me about your mom.", es: "Háblame de tu mamá." },
  { en: "Tell me about your dad.", es: "Háblame de tu papá." },
  { en: "Do you have siblings? What are they like?", es: "¿Tienes hermanos? ¿Cómo son?" },
  { en: "What is your family known for?", es: "¿Por qué es conocida tu familia?" },
  { en: "What value did your family teach you?", es: "¿Qué valor te enseñó tu familia?" },
  { en: "Who in your family do you take after most?", es: "¿A quién de tu familia te pareces más?" },
  { en: "What does family mean to you?", es: "¿Qué significa la familia para ti?" },
  { en: "Is there family conflict that weighs on you?", es: "¿Hay algún conflicto familiar que te pesa?" },
  { en: "Which family member do you wish I could meet?", es: "¿A qué familiar te gustaría que yo conociera?" },
  { en: "What do you want our family to look like one day?", es: "¿Cómo quieres que sea nuestra familia algún día?" },

  ] },
  { en: 'Personality & inner world', es: 'Personalidad y mundo interior', questions: [
  { en: "How would you describe yourself in three words?", es: "¿Cómo te describirías en tres palabras?" },
  { en: "Are you more introverted or extroverted?", es: "¿Eres más introvertido/a o extrovertido/a?" },
  { en: "What recharges you when you feel drained?", es: "¿Qué te recarga cuando te sientes agotado/a?" },
  { en: "What drains your energy the fastest?", es: "¿Qué te quita la energía más rápido?" },
  { en: "What do people misunderstand about you?", es: "¿Qué malinterpreta la gente de ti?" },
  { en: "What part of yourself are you proud of?", es: "¿Qué parte de ti te enorgullece?" },
  { en: "What part of yourself do you struggle with?", es: "¿Con qué parte de ti luchas?" },
  { en: "How do you handle anger?", es: "¿Cómo manejas el enojo?" },
  { en: "How do you handle sadness?", es: "¿Cómo manejas la tristeza?" },
  { en: "Do you trust people easily?", es: "¿Confías en la gente con facilidad?" },
  { en: "What makes you feel confident?", es: "¿Qué te hace sentir seguro/a de ti?" },
  { en: "When do you feel most like yourself?", es: "¿Cuándo te sientes más tú mismo/a?" },
  { en: "Are you a planner or do you go with the flow?", es: "¿Eres de planear o te dejas llevar?" },

  ] },
  { en: 'Emotions & mental health', es: 'Emociones y salud mental', questions: [
  { en: "How are you really doing lately?", es: "¿Cómo estás realmente últimamente?" },
  { en: "What does your anxiety feel like?", es: "¿Cómo se siente tu ansiedad?" },
  { en: "What does your inner critic love to say?", es: "¿Qué te dice tu crítico interno más seguido?" },
  { en: "What helps when your mind won't quiet down?", es: "¿Qué te ayuda cuando tu mente no se calma?" },
  { en: "When was the last time you cried, and why?", es: "¿Cuándo lloraste por última vez y por qué?" },
  { en: "What is something you are healing from?", es: "¿De qué te estás sanando?" },
  { en: "What does a good mental-health day look like for you?", es: "¿Cómo es un buen día para tu salud mental?" },
  { en: "What do you need from me when you're overwhelmed?", es: "¿Qué necesitas de mí cuando te sientes abrumado/a?" },
  { en: "What is weighing on you right now?", es: "¿Qué te pesa en este momento?" },

  ] },
  { en: 'Fears & vulnerabilities', es: 'Miedos y vulnerabilidades', questions: [
  { en: "What is your biggest fear?", es: "¿Cuál es tu mayor miedo?" },
  { en: "What are you afraid of in our relationship?", es: "¿Qué te da miedo en nuestra relación?" },
  { en: "What is your biggest insecurity?", es: "¿Cuál es tu mayor inseguridad?" },
  { en: "What makes you feel small?", es: "¿Qué te hace sentir pequeño/a?" },
  { en: "What do you worry about at night?", es: "¿Qué te preocupa en las noches?" },
  { en: "What is a risk you are scared to take?", es: "¿Qué riesgo te da miedo tomar?" },
  { en: "What would you do if you weren't afraid?", es: "¿Qué harías si no tuvieras miedo?" },
  { en: "When do you feel most alone?", es: "¿Cuándo te sientes más solo/a?" },
  { en: "What is hard for you to ask for?", es: "¿Qué te cuesta pedir?" },

  ] },
  { en: 'Dreams & ambitions', es: 'Sueños y ambiciones', questions: [
  { en: "What is a dream you've never told anyone?", es: "¿Cuál es un sueño que nunca le has contado a nadie?" },
  { en: "Where do you see yourself in five years?", es: "¿Dónde te ves en cinco años?" },
  { en: "What would your ideal life look like?", es: "¿Cómo sería tu vida ideal?" },
  { en: "What do you want to achieve this year?", es: "¿Qué quieres lograr este año?" },
  { en: "If money were no object, what would you do?", es: "Si el dinero no importara, ¿qué harías?" },
  { en: "What skill do you wish you had?", es: "¿Qué habilidad te gustaría tener?" },
  { en: "What legacy do you want to leave?", es: "¿Qué legado quieres dejar?" },
  { en: "What does success mean to you?", es: "¿Qué significa el éxito para ti?" },
  { en: "What is on your bucket list?", es: "¿Qué hay en tu lista de cosas por hacer?" },
  { en: "What is a dream we could chase together?", es: "¿Qué sueño podríamos perseguir juntos?" },

  ] },
  { en: 'Love & our relationship', es: 'Amor y nuestra relación', questions: [
  { en: "When did you know you were falling for me?", es: "¿Cuándo supiste que te estabas enamorando de mí?" },
  { en: "What is your favorite memory of us?", es: "¿Cuál es tu recuerdo favorito de nosotros?" },
  { en: "What makes you feel most loved by me?", es: "¿Qué te hace sentir más amado/a por mí?" },
  { en: "How do you like to be comforted after a fight?", es: "¿Cómo te gusta que te consuelen después de una pelea?" },
  { en: "What is something I do that you adore?", es: "¿Qué hago que te encanta?" },
  { en: "What do you need more of from me?", es: "¿Qué necesitas más de mí?" },
  { en: "What does commitment mean to you?", es: "¿Qué significa el compromiso para ti?" },
  { en: "What excites you and scares you about our future?", es: "¿Qué te emociona y te asusta de nuestro futuro?" },
  { en: "How do you imagine us when we're old?", es: "¿Cómo nos imaginas cuando seamos viejos?" },
  { en: "What is the kindest thing I've done for you?", es: "¿Qué es lo más tierno que he hecho por ti?" },
  { en: "What makes you feel safe with me?", es: "¿Qué te hace sentir seguro/a conmigo?" },
  { en: "What does our home need to feel like?", es: "¿Cómo necesita sentirse nuestro hogar?" },

  ] },
  { en: 'Intimacy & desire', es: 'Intimidad y deseo', questions: [
  { en: "What makes you feel most desired?", es: "¿Qué te hace sentir más deseado/a?" },
  { en: "Where do you most love to be touched?", es: "¿Dónde te encanta que te toquen?" },
  { en: "What is a fantasy you haven't told me yet?", es: "¿Qué fantasía no me has contado todavía?" },
  { en: "What turns you on that might surprise me?", es: "¿Qué te excita que me podría sorprender?" },
  { en: "How do you like to be kissed?", es: "¿Cómo te gusta que te besen?" },
  { en: "What makes you feel most attractive?", es: "¿Qué te hace sentir más atractivo/a?" },
  { en: "What is your favorite intimacy that isn't sex?", es: "¿Cuál es tu intimidad favorita que no es sexo?" },
  { en: "What do you want more of in the bedroom?", es: "¿Qué quieres más en la intimidad?" },
  { en: "What helps you feel safe being vulnerable with me?", es: "¿Qué te ayuda a sentirte seguro/a siendo vulnerable conmigo?" },
  { en: "What romantic thing do you secretly want?", es: "¿Qué cosa romántica deseas en secreto?" },

  ] },
  { en: 'Favorites & tastes', es: 'Favoritos y gustos', questions: [
  { en: "What song always makes you emotional?", es: "¿Qué canción siempre te emociona?" },
  { en: "What is your favorite way to spend a day off?", es: "¿Cuál es tu forma favorita de pasar un día libre?" },
  { en: "What book or story has stayed with you?", es: "¿Qué libro o historia se quedó contigo?" },
  { en: "What kind of weather do you love?", es: "¿Qué clima te encanta?" },
  { en: "What is your favorite holiday?", es: "¿Cuál es tu día festivo favorito?" },
  { en: "What is a guilty pleasure of yours?", es: "¿Cuál es un placer culposo tuyo?" },

  ] },
  { en: 'Daily life & habits', es: 'Vida diaria y hábitos', questions: [
  { en: "Are you a morning person or a night owl?", es: "¿Eres de mañanas o de noches?" },
  { en: "What does your perfect morning look like?", es: "¿Cómo es tu mañana perfecta?" },
  { en: "What habit do you want to build?", es: "¿Qué hábito quieres construir?" },
  { en: "What habit do you want to break?", es: "¿Qué hábito quieres dejar?" },
  { en: "How do you unwind after a hard day?", es: "¿Cómo te relajas después de un día difícil?" },
  { en: "What does self-care look like for you?", es: "¿Cómo es el autocuidado para ti?" },
  { en: "What is always in your fridge?", es: "¿Qué siempre hay en tu refrigerador?" },

  ] },
  { en: 'Comfort & emotional needs', es: 'Consuelo y necesidades emocionales', questions: [
  { en: "What instantly makes you feel better?", es: "¿Qué te hace sentir mejor al instante?" },
  { en: "What words do you need to hear when you're down?", es: "¿Qué palabras necesitas escuchar cuando estás triste?" },
  { en: "Do you want solutions, or just to be heard?", es: "¿Quieres soluciones o solo que te escuchen?" },
  { en: "What makes you feel truly understood?", es: "¿Qué te hace sentir verdaderamente comprendido/a?" },

  ] },
  { en: 'Body & senses', es: 'Cuerpo y sentidos', questions: [
  { en: "What is your favorite physical feature of your own?", es: "¿Cuál es tu rasgo físico favorito de ti?" },
  { en: "What texture do you love?", es: "¿Qué textura te encanta?" },
  { en: "What sound calms you?", es: "¿Qué sonido te calma?" },
  { en: "What position do you love to sleep in?", es: "¿En qué posición te gusta dormir?" },
  { en: "What food could you never give up?", es: "¿Qué comida nunca podrías dejar?" },

  ] },
  { en: 'Beliefs & values', es: 'Creencias y valores', questions: [
  { en: "What do you believe happens after we die?", es: "¿Qué crees que pasa después de morir?" },
  { en: "What is a value you'll never compromise on?", es: "¿Qué valor nunca negociarías?" },
  { en: "Are you spiritual or religious?", es: "¿Eres espiritual o religioso/a?" },
  { en: "What does being a good person look like to you?", es: "¿Cómo es una buena persona para ti?" },
  { en: "What is something you've changed your mind about?", es: "¿Sobre qué has cambiado de opinión?" },
  { en: "What matters most to you in life?", es: "¿Qué es lo más importante para ti en la vida?" },
  { en: "What do you think your purpose is?", es: "¿Cuál crees que es tu propósito?" },

  ] },
  { en: 'Memories & past', es: 'Recuerdos y pasado', questions: [
  { en: "What moment changed your life?", es: "¿Qué momento cambió tu vida?" },
  { en: "What is your proudest accomplishment?", es: "¿Cuál es tu mayor orgullo?" },
  { en: "What is a regret you carry?", es: "¿Qué arrepentimiento cargas?" },
  { en: "Who shaped you the most?", es: "¿Quién te formó más?" },
  { en: "What is the best advice you've ever gotten?", es: "¿Cuál es el mejor consejo que te han dado?" },
  { en: "What mistake taught you the most?", es: "¿Qué error te enseñó más?" },
  { en: "What moment do you wish you could relive?", es: "¿Qué momento te gustaría volver a vivir?" },

  ] },
  { en: 'Future & hypotheticals', es: 'Futuro e hipótesis', questions: [
  { en: "If we could live anywhere, where would it be?", es: "Si pudiéramos vivir en cualquier lugar, ¿dónde sería?" },
  { en: "How many kids do you want, if any?", es: "¿Cuántos hijos quieres, si acaso?" },
  { en: "What would our dream wedding look like?", es: "¿Cómo sería nuestra boda soñada?" },
  { en: "What trip do you want to take with me?", es: "¿Qué viaje quieres hacer conmigo?" },
  { en: "If you could master one thing instantly, what?", es: "Si pudieras dominar algo al instante, ¿qué sería?" },
  { en: "What does growing old happily look like to you?", es: "¿Cómo es envejecer feliz para ti?" },
  { en: "What tradition do you want us to start?", es: "¿Qué tradición quieres que empecemos?" },

  ] },
  { en: 'Quirks & little things', es: 'Manías y pequeñas cosas', questions: [
  { en: "What is a weird habit you have?", es: "¿Qué hábito raro tienes?" },
  { en: "What is an irrational fear of yours?", es: "¿Qué miedo irracional tienes?" },
  { en: "What small thing makes your whole day?", es: "¿Qué cosa pequeña te alegra todo el día?" },
  { en: "What is your most-used emoji?", es: "¿Cuál es tu emoji más usado?" },
  { en: "What silly thing makes you laugh every time?", es: "¿Qué tontería te hace reír siempre?" },
  { en: "What is your midnight snack?", es: "¿Cuál es tu antojo de medianoche?" },

  ] },
  { en: 'Places, work & people', es: 'Lugares, trabajo y personas', questions: [
  { en: "What is the most beautiful place you've been?", es: "¿Cuál es el lugar más hermoso que has visitado?" },
  { en: "Beach, mountains, or city?", es: "¿Playa, montaña o ciudad?" },
  { en: "What does home mean to you?", es: "¿Qué significa hogar para ti?" },
  { en: "What do you actually love about your work?", es: "¿Qué amas realmente de tu trabajo?" },
  { en: "What would you do if you didn't have to work?", es: "¿Qué harías si no tuvieras que trabajar?" },
  { en: "What is your relationship with money like?", es: "¿Cómo es tu relación con el dinero?" },
  { en: "What makes you feel accomplished?", es: "¿Qué te hace sentir realizado/a?" },
  { en: "Who is your person outside of me?", es: "¿Quién es tu persona aparte de mí?" },
  { en: "What do you value most in a friend?", es: "¿Qué valoras más en un amigo/a?" },
  { en: "How do you show people you care?", es: "¿Cómo demuestras que te importa alguien?" },

  ] },
  { en: 'The 36 Questions', es: 'Las 36 Preguntas', questions: [
  { en: "Would you like to be famous? In what way?", es: "¿Te gustaría ser famoso/a? ¿De qué forma?" },
  { en: "What would a perfect day look like for you?", es: "¿Cómo sería un día perfecto para ti?" },
  { en: "When did you last sing to yourself, or to someone else?", es: "¿Cuándo cantaste para ti, o para alguien más, por última vez?" },
  { en: "If you could wake up tomorrow with one new quality or ability, what would it be?", es: "Si despertaras mañana con una cualidad o habilidad nueva, ¿cuál sería?" },
  { en: "Is there something you've dreamed of doing for a long time? Why haven't you?", es: "¿Hay algo que has soñado hacer por mucho tiempo? ¿Por qué no lo has hecho?" },
  { en: "What is your most treasured memory?", es: "¿Cuál es tu recuerdo más preciado?" },
  { en: "What is your most painful memory?", es: "¿Cuál es tu recuerdo más doloroso?" },
  { en: "If you knew you had one year left to live, what would you change?", es: "Si supieras que te queda un año de vida, ¿qué cambiarías?" },
  { en: "What role do love and affection play in your life?", es: "¿Qué papel juegan el amor y el afecto en tu vida?" },
  { en: "What is your most embarrassing moment?", es: "¿Cuál es tu momento más vergonzoso?" },
  { en: "What, if anything, is too serious to joke about?", es: "¿Qué cosa, si acaso, es demasiado seria para bromear?" },
  { en: "If you died tonight, what would you regret not telling someone?", es: "Si murieras esta noche, ¿qué lamentarías no haberle dicho a alguien?" },
  { en: "If your home caught fire, what one object would you save?", es: "Si tu casa se incendiara, ¿qué objeto salvarías después de tus seres queridos?" },
  { en: "What is a problem you're facing that you'd want my take on?", es: "¿Qué problema estás enfrentando sobre el que querrías mi opinión?" },
  { en: "What would you want me to know if we were to grow truly close?", es: "Si vamos a ser muy cercanos, ¿qué querrías que yo supiera de ti?" },

  ] },
  { en: 'Love maps', es: 'Mapas del amor', questions: [
  { en: "What is a recurring dream or nightmare you have?", es: "¿Qué sueño o pesadilla recurrente tienes?" },
  { en: "What's one of your life dreams I might not know about yet?", es: "¿Cuál es un sueño de vida tuyo que quizá yo aún no conozco?" },
  { en: "Who in your life has hurt you that you haven't fully forgiven?", es: "¿Quién en tu vida te ha herido y aún no has perdonado del todo?" },
  { en: "What do you need from me when we're apart?", es: "¿Qué necesitas de mí cuando estamos lejos?" },
  { en: "What is a small ritual that would make you feel connected to me?", es: "¿Qué pequeño ritual te haría sentir conectado/a conmigo?" },
  { en: "What's something you're looking forward to?", es: "¿Qué es algo que estás esperando con ilusión?" },

  ] },
  { en: 'Desire & connection', es: 'Deseo y conexión', questions: [
  { en: "When do you feel most alive?", es: "¿Cuándo te sientes más vivo/a?" },
  { en: "When do you feel most drawn to me?", es: "¿Cuándo te sientes más atraído/a hacia mí?" },
  { en: "What do you find attractive that has nothing to do with looks?", es: "¿Qué encuentras atractivo que no tiene nada que ver con lo físico?" },
  { en: "Where do you find it hardest to let your guard down?", es: "¿Dónde te cuesta más bajar la guardia?" },
  { en: "What helps you feel free to be fully yourself with me?", es: "¿Qué te ayuda a sentirte libre de ser completamente tú conmigo?" },
  { en: "What do you long for that you rarely say out loud?", es: "¿Qué anhelas que rara vez dices en voz alta?" },

  ] },
  { en: 'Gratitude, healing & self', es: 'Gratitud, sanación y ser', questions: [
  { en: "What are you most grateful for today?", es: "¿Por qué estás más agradecido/a hoy?" },
  { en: "What is something you need to forgive yourself for?", es: "¿Qué necesitas perdonarte a ti mismo/a?" },
  { en: "Who do you miss right now?", es: "¿A quién extrañas en este momento?" },
  { en: "What compliment do you struggle to accept?", es: "¿Qué cumplido te cuesta aceptar?" },
  { en: "What does unconditional love look like to you?", es: "¿Cómo es el amor incondicional para ti?" },
  { en: "What is your heart asking for these days?", es: "¿Qué te está pidiendo el corazón estos días?" },
  ] },
];

// Flattened list for the daily-question rotation.
const DAILY_QUESTIONS = QUESTION_GROUPS.flatMap(g => g.questions);

// Map each question theme onto one of the existing dictionary categories, so questions
// are grouped and filed under the same headers as everything else (no separate taxonomy).
const THEME_CATEGORY: Record<string, DictionaryCategory> = {
  'Childhood & roots':          'past',
  'Memories & past':            'past',
  'Personality & inner world':  'inner',
  'Beliefs & values':           'inner',
  'The 36 Questions':           'inner',
  'Family':                     'people',
  'Places, work & people':      'people',
  'Emotions & mental health':   'health',
  'Body & senses':              'health',
  'Fears & vulnerabilities':    'comfort',
  'Comfort & emotional needs':  'comfort',
  'Gratitude, healing & self':  'comfort',
  'Love & our relationship':    'love',
  'Love maps':                  'love',
  'Intimacy & desire':          'intimacy',
  'Desire & connection':        'intimacy',
  'Dreams & ambitions':         'future',
  'Future & hypotheticals':     'future',
  'Favorites & tastes':         'favorites',
  'Daily life & habits':        'questions',
  'Quirks & little things':     'questions',
};

interface Group { meta: CategoryMeta; entries: DictionaryEntry[]; }

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full px-4 pt-8 pb-28 flex flex-col items-center gap-4 max-w-[600px] mx-auto">

      <!-- Header -->
      <div class="w-full text-center">
        <h1 class="text-romantic-pink font-romantic text-4xl md:text-5xl animate-pulse-glow">{{ t().dict_title }}</h1>
        <p class="text-romantic-text/55 text-sm font-serif italic mt-1">{{ t().dict_subtitle }}</p>
      </div>

      <!-- Question card -->
      @if (currentQuestion(); as question) {
        <div class="w-full rounded-2xl border border-romantic-coral/30 bg-romantic-coral/5 px-5 py-4 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🌅</span>
            <div>
              <p class="text-romantic-coral font-serif text-sm font-semibold">{{ t().dict_daily_title }}</p>
              <p class="text-romantic-text/45 text-[11px] font-serif">{{ t().dict_daily_sub }}</p>
            </div>
          </div>
          <p class="text-romantic-text/85 font-serif text-base leading-snug">{{ question }}</p>
          <textarea [(ngModel)]="dailyAnswer" rows="2" [placeholder]="t().dict_daily_placeholder"
            class="w-full bg-white/5 border border-romantic-coral/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-coral/60 placeholder:text-romantic-text/40 resize-none"></textarea>
          <div class="flex items-center justify-between">
            <button (click)="skipQuestion()"
              class="text-romantic-text/45 hover:text-romantic-coral text-xs font-serif transition-colors">
              {{ t().dict_skip }}
            </button>
            <button (click)="saveDaily()" [disabled]="!dailyAnswer.trim() || savingDaily()"
              class="px-5 py-2 rounded-xl bg-romantic-coral text-white font-serif text-sm transition-all disabled:opacity-40 active:scale-95">
              {{ savingDaily() ? t().dict_saving : t().dict_daily_save }}
            </button>
          </div>
        </div>
      } @else {
        <p class="text-romantic-text/40 text-xs font-serif italic">{{ t().dict_all_answered }}</p>
      }

      <!-- Whose page toggle -->
      <div class="w-full grid grid-cols-2 gap-2">
        <button (click)="viewing.set('theirs')"
          [class]="viewing() === 'theirs' ? 'border-romantic-pink bg-romantic-pink/15 text-romantic-pink' : 'border-romantic-text/20 text-romantic-text/50'"
          class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
          {{ partnerName() }}
        </button>
        <button (click)="viewing.set('mine')"
          [class]="viewing() === 'mine' ? 'border-jesse-blue bg-jesse-blue/15 text-jesse-blue' : 'border-romantic-text/20 text-romantic-text/50'"
          class="py-2.5 rounded-xl border text-sm font-serif transition-all duration-200">
          {{ t().dict_view_mine }}
        </button>
      </div>

      <!-- Search -->
      <div class="w-full relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-romantic-text/40">🔎</span>
        <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="search.set($event)"
          [placeholder]="t().dict_search"
          class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl pl-11 pr-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40" />
      </div>

      <!-- Category filter -->
      <select [ngModel]="activeCategory() ?? ''" (ngModelChange)="activeCategory.set($event || null)"
        class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]">
        <option value="">🗂️ {{ t().dict_all }}</option>
        @for (cat of categories; track cat.key) {
          <option [value]="cat.key">{{ cat.emoji }} {{ catLabel(cat) }}</option>
        }
      </select>

      <!-- Backdrop for open menu -->
      @if (menuOpenId()) {
        <div class="fixed inset-0 z-10" (click)="menuOpenId.set(null)"></div>
      }

      <!-- Empty states -->
      @if (groups().length === 0 && !search()) {
        <p class="text-romantic-text/40 text-sm font-serif italic text-center py-6">
          {{ viewing() === 'mine' ? t().dict_empty_mine : t().dict_empty_theirs }}
        </p>
      } @else if (groups().length === 0) {
        <p class="text-romantic-text/40 text-sm font-serif italic text-center py-6">{{ t().dict_no_results }}</p>
      }

      <!-- Grouped entries -->
      @for (group of groups(); track group.meta.key) {
        <div class="w-full flex flex-col gap-2">
          <div class="flex items-center gap-2 mt-2">
            <span class="text-base">{{ group.meta.emoji }}</span>
            <h2 class="text-romantic-text/55 text-xs font-serif uppercase tracking-widest">{{ catLabel(group.meta) }}</h2>
            <span class="text-romantic-text/40 text-[11px] font-serif">{{ group.entries.length }}</span>
          </div>

          @for (entry of group.entries; track entry.id) {
            <div class="relative w-full rounded-2xl border border-romantic-pink/12 bg-white/3 px-4 py-3 flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2 flex-wrap">
                  <p class="text-romantic-text text-sm font-serif font-semibold">{{ entry.term }}</p>
                  @if (entry.translation) {
                    <p class="text-romantic-pink/70 text-xs font-serif italic">— {{ entry.translation }}</p>
                  }
                </div>
                @if (entry.definition) {
                  <p class="text-romantic-text/70 text-xs font-serif mt-0.5 leading-relaxed whitespace-pre-wrap">{{ entry.definition }}</p>
                }
              </div>

              @if (viewing() === 'mine') {
                <button (click)="toggleMenu(entry.id)"
                  class="w-7 h-7 rounded-full flex items-center justify-center text-romantic-text/45 hover:text-romantic-text/70 hover:bg-white/5 transition-all shrink-0">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
                  </svg>
                </button>

                @if (menuOpenId() === entry.id) {
                  <div class="absolute top-11 right-3 z-20 w-32 rounded-xl border border-romantic-pink/20 bg-[#1a0810]/95 backdrop-blur-md overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <button (click)="openEdit(entry)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-romantic-text/70 hover:bg-romantic-pink/10 hover:text-romantic-pink transition-colors">
                      ✏️ {{ t().dict_edit }}
                    </button>
                    <button (click)="deleteEntry(entry.id)"
                      class="w-full px-4 py-2.5 text-left text-sm font-serif text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors border-t border-white/5">
                      🗑️ {{ t().dict_delete }}
                    </button>
                  </div>
                }
              }
            </div>
          }
        </div>
      }

      <!-- Suggestions: presets + questions under one set of category headers (your page only) -->
      @if (viewing() === 'mine' && groupedSuggestions().length > 0) {
        <div class="w-full flex flex-col gap-3 mt-3">
          <p class="text-romantic-text/45 text-xs font-serif uppercase tracking-widest">{{ t().dict_suggested }}</p>
          @for (group of groupedSuggestions(); track group.meta.key) {
            <div class="w-full flex flex-col gap-1.5">
              <div class="flex items-center gap-2">
                <span class="text-sm">{{ group.meta.emoji }}</span>
                <h3 class="text-romantic-text/45 text-[11px] font-serif uppercase tracking-widest">{{ catLabel(group.meta) }}</h3>
              </div>
              <div class="flex flex-col gap-1.5">
                @for (preset of group.presets; track preset.en) {
                  <button (click)="openFromPreset(preset)"
                    class="text-left px-3.5 py-2 rounded-xl border border-romantic-text/15 text-romantic-text/65 text-xs font-serif hover:border-romantic-pink/40 hover:text-romantic-pink transition-all leading-snug">
                    {{ lang() === 'es' ? preset.es : preset.en }}
                  </button>
                }
                @for (q of group.questions; track q) {
                  <button (click)="openFromQuestion(q, group.meta.key)"
                    class="text-left px-3.5 py-2 rounded-xl border border-romantic-text/15 text-romantic-text/65 text-xs font-serif hover:border-romantic-pink/40 hover:text-romantic-pink transition-all leading-snug">
                    {{ q }}
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Floating add -->
    <button (click)="openAdd()"
      class="fixed bottom-20 right-5 z-50 w-14 h-14 rounded-full bg-romantic-pink text-white shadow-[0_0_20px_rgba(255,105,180,0.4)] flex items-center justify-center transition-all duration-300 hover:bg-romantic-coral active:scale-95">
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Add / Edit sheet -->
    @if (sheetOpen()) {
      <div class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="closeSheet()"></div>
        <div class="relative bg-[#1a0810] border-t border-romantic-pink/20 rounded-t-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-10 flex flex-col gap-4 max-h-[92dvh] overflow-y-auto">
          <div class="w-10 h-1 rounded-full bg-romantic-pink/30 mx-auto mb-1 shrink-0"></div>
          <h3 class="text-romantic-coral font-romantic text-2xl text-center shrink-0">
            {{ editingId() ? t().dict_edit_title : t().dict_add_title }}
          </h3>

          <!-- Category -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().dict_category_label }}</label>
            <select [ngModel]="formCategory()" (ngModelChange)="formCategory.set($event)"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 [color-scheme:dark]">
              @for (cat of categories; track cat.key) {
                <option [value]="cat.key">{{ cat.emoji }} {{ catLabel(cat) }}</option>
              }
            </select>
          </div>

          <!-- Prompt / label -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().dict_prompt_label }}</label>
            <input type="text" [(ngModel)]="formTerm" [placeholder]="t().dict_prompt_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40" />
          </div>

          <!-- Answer -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().dict_answer_label }}</label>
            <textarea [(ngModel)]="formDefinition" rows="3" [placeholder]="t().dict_answer_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40 resize-none leading-relaxed"></textarea>
          </div>

          <!-- Translation (optional, mainly for words) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-romantic-text/55 text-xs font-serif">{{ t().dict_translation_label }} <span class="text-romantic-text/40">{{ t().dict_optional }}</span></label>
            <input type="text" [(ngModel)]="formTranslation" [placeholder]="t().dict_translation_placeholder"
              class="w-full bg-white/5 border border-romantic-pink/20 rounded-xl px-4 py-3 text-romantic-text text-sm focus:outline-none focus:border-romantic-pink/60 placeholder:text-romantic-text/40" />
          </div>

          <button (click)="save()" [disabled]="!formTerm.trim() || saving()"
            class="w-full py-3.5 rounded-xl bg-romantic-pink text-white font-serif text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shrink-0">
            {{ saving() ? t().dict_saving : editingId() ? t().dict_save_edit : t().dict_save }}
          </button>
        </div>
      </div>
    }
  `,
})
export class DictionaryComponent implements OnInit {
  dictionaryService = inject(DictionaryService);
  private langService = inject(LanguageService);
  private identityService = inject(IdentityService);

  readonly t = this.langService.t;
  readonly lang = this.langService.lang;
  readonly categories = CATEGORIES;

  search = signal('');
  searchQuery = '';
  activeCategory = signal<DictionaryCategory | null>(null);
  menuOpenId = signal<string | null>(null);
  viewing = signal<'mine' | 'theirs'>('theirs');

  // Daily question
  dailyAnswer = '';
  savingDaily = signal(false);

  // Sheet
  sheetOpen = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);
  formCategory = signal<DictionaryCategory>('basics');
  formTerm = '';
  formTranslation = '';
  formDefinition = '';

  private me = computed(() => this.identityService.user());
  private partner = computed<'jesse' | 'abigail'>(() => this.me() === 'jesse' ? 'abigail' : 'jesse');

  partnerName = computed(() => this.partner() === 'jesse' ? 'Jesse' : 'Abigail');

  // Which person's page we're reading
  private viewedOwner = computed<'jesse' | 'abigail'>(() => this.viewing() === 'mine' ? this.me() : this.partner());

  // Questions she chose to skip this session (so "skip" advances to a fresh one).
  private skippedQuestions = signal<string[]>([]);

  // Every question she hasn't answered yet, rotated so today's daily one comes first.
  private unansweredQuestions = computed(() => {
    const lang = this.lang();
    const answered = new Set(
      this.dictionaryService.entries()
        .filter(e => e.about === this.me())
        .map(e => e.term.toLowerCase().trim())
    );
    const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_QUESTIONS.length;
    const rotated = [...DAILY_QUESTIONS.slice(dayIndex), ...DAILY_QUESTIONS.slice(0, dayIndex)];
    return rotated
      .map(q => (lang === 'es' ? q.es : q.en))
      .filter(text => !answered.has(text.toLowerCase().trim()));
  });

  // The question currently shown: the first unanswered one she hasn't skipped this session.
  currentQuestion = computed(() => {
    const skipped = new Set(this.skippedQuestions());
    return this.unansweredQuestions().find(q => !skipped.has(q)) ?? null;
  });

  groups = computed<Group[]>(() => {
    const q = this.search().trim().toLowerCase();
    const active = this.activeCategory();
    const owner = this.viewedOwner();
    const all = this.dictionaryService.entries().filter(e => e.about === owner);

    const matches = all.filter(e => {
      if (active && e.category !== active) return false;
      if (!q) return true;
      return (
        e.term.toLowerCase().includes(q) ||
        (e.translation ?? '').toLowerCase().includes(q) ||
        (e.definition ?? '').toLowerCase().includes(q)
      );
    });

    return CATEGORIES
      .map(meta => ({ meta, entries: matches.filter(e => e.category === meta.key) }))
      .filter(g => g.entries.length > 0);
  });

  // Presets + questions merged under one set of category headers (one "Suggested" section).
  groupedSuggestions = computed(() => {
    const lang = this.lang();
    const active = this.activeCategory();
    const answered = new Set(
      this.dictionaryService.entries()
        .filter(e => e.about === this.me())
        .map(e => e.term.toLowerCase().trim())
    );

    const presetsByCat = new Map<DictionaryCategory, { category: DictionaryCategory; en: string; es: string }[]>();
    for (const p of PRESETS) {
      if (answered.has(p.en.toLowerCase().trim()) || answered.has(p.es.toLowerCase().trim())) continue;
      (presetsByCat.get(p.category) ?? presetsByCat.set(p.category, []).get(p.category)!).push(p);
    }

    const questionsByCat = new Map<DictionaryCategory, string[]>();
    for (const g of QUESTION_GROUPS) {
      const cat = THEME_CATEGORY[g.en] ?? 'questions';
      for (const q of g.questions) {
        const text = lang === 'es' ? q.es : q.en;
        if (answered.has(text.toLowerCase().trim())) continue;
        (questionsByCat.get(cat) ?? questionsByCat.set(cat, []).get(cat)!).push(text);
      }
    }

    return CATEGORIES
      .filter(meta => !active || meta.key === active)
      .map(meta => ({
        meta,
        presets: presetsByCat.get(meta.key) ?? [],
        questions: questionsByCat.get(meta.key) ?? [],
      }))
      .filter(g => g.presets.length > 0 || g.questions.length > 0);
  });

  ngOnInit(): void {
    this.dictionaryService.loadAll();
  }

  catLabel(cat: CategoryMeta): string {
    return this.lang() === 'es' ? cat.es : cat.en;
  }

  catEmoji(key: DictionaryCategory): string {
    return CATEGORIES.find(c => c.key === key)?.emoji ?? '📌';
  }

  toggleMenu(id: string): void {
    this.menuOpenId.update(c => (c === id ? null : id));
  }

  openAdd(): void {
    this.editingId.set(null);
    this.formCategory.set(this.activeCategory() ?? 'basics');
    this.formTerm = '';
    this.formTranslation = '';
    this.formDefinition = '';
    this.sheetOpen.set(true);
  }

  openFromPreset(preset: { category: DictionaryCategory; en: string; es: string }): void {
    this.editingId.set(null);
    this.formCategory.set(preset.category);
    this.formTerm = this.lang() === 'es' ? preset.es : preset.en;
    this.formTranslation = '';
    this.formDefinition = '';
    this.sheetOpen.set(true);
  }

  // Tap a question → open the answer sheet pre-filled, filed under its mapped category.
  openFromQuestion(question: string, category: DictionaryCategory): void {
    this.editingId.set(null);
    this.formCategory.set(category);
    this.formTerm = question;
    this.formTranslation = '';
    this.formDefinition = '';
    this.sheetOpen.set(true);
  }

  openEdit(entry: DictionaryEntry): void {
    this.menuOpenId.set(null);
    this.editingId.set(entry.id);
    this.formCategory.set(entry.category);
    this.formTerm = entry.term;
    this.formTranslation = entry.translation ?? '';
    this.formDefinition = entry.definition ?? '';
    this.sheetOpen.set(true);
  }

  closeSheet(): void {
    this.sheetOpen.set(false);
    this.editingId.set(null);
  }

  async save(): Promise<void> {
    if (!this.formTerm.trim()) return;
    this.saving.set(true);
    const payload = {
      term: this.formTerm.trim(),
      translation: this.formTranslation.trim() || null,
      definition: this.formDefinition.trim() || null,
      category: this.formCategory(),
      about: this.me(),
    };
    const id = this.editingId();
    if (id) await this.dictionaryService.update(id, payload);
    else {
      await this.dictionaryService.create(payload);
      this.viewing.set('mine'); // jump to your page so you see what you added
    }
    this.saving.set(false);
    this.closeSheet();
  }

  async saveDaily(): Promise<void> {
    const q = this.currentQuestion();
    if (!q || !this.dailyAnswer.trim()) return;
    this.savingDaily.set(true);
    await this.dictionaryService.create({
      term: q,
      translation: null,
      definition: this.dailyAnswer.trim(),
      category: this.categoryForQuestion(q),
      about: this.me(),
    });
    this.savingDaily.set(false);
    this.dailyAnswer = '';
    // Answered question drops out of the unanswered list, so the next one appears automatically.
  }

  skipQuestion(): void {
    const q = this.currentQuestion();
    if (q) this.skippedQuestions.update(s => [...s, q]);
    this.dailyAnswer = '';
  }

  // Which category a question belongs to, via its theme (matches the browser grouping).
  private categoryForQuestion(text: string): DictionaryCategory {
    const lang = this.lang();
    for (const g of QUESTION_GROUPS) {
      if (g.questions.some(q => (lang === 'es' ? q.es : q.en) === text)) {
        return THEME_CATEGORY[g.en] ?? 'questions';
      }
    }
    return 'questions';
  }

  async deleteEntry(id: string): Promise<void> {
    this.menuOpenId.set(null);
    await this.dictionaryService.delete(id);
  }
}
