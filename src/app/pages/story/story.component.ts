import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center w-full p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-5"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        Solo Dejate Amar
      </h1>

      <div class="flex justify-center gap-4 mb-8 flex-wrap">
        <button
          (click)="toggleLanguage()"
          class="px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white">
          {{ buttonText() }}
        </button>
        <a routerLink="/"
           class="px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white no-underline">
          Back
        </a>
      </div>

      <div class="max-w-[800px] text-left leading-loose mb-10 bg-white/[0.02] px-[5%] md:px-[8%] py-10 rounded-lg border border-romantic-pink/20 border-t-[3px] border-t-romantic-coral shadow-[0_15px_35px_rgba(0,0,0,0.5)] story-text">
        @if (showEnglish()) {
          <p class="mb-6 first-letter:font-romantic first-letter:text-6xl first-letter:text-romantic-coral first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]">Before her, my world was a canvas painted in grays and sharp edges. It was a solitary fortress built on the instinct to survive. I was a man encased in armor, a soldier bracing for the cold winds of an impending military deployment, and a father fighting a ruthless, draining legal war simply to hold onto my daughters, Fiona and Alina. I was the lone wolf. I trusted no one but myself, minimizing my existence to avoid conflict, guarding my peace like a fragile flame in a torrential downpour. I had accepted that my life would be an island of structure and discipline. I was not looking for salvation. I certainly was not expecting the universe to send a hurricane named Abigail.</p>

          <p class="mb-6">It started with a simple swipe on a screen, a digital coincidence that somehow rewrote the stars. You did not enter my life with cautious steps. You crashed into my world with the breathtaking force of a tempest. From the very beginning, there were no superficial lies between us. You laid your soul bare, dropping a nuclear confession at my feet. You told me the heavy, tangled reality of your marriage and the complexities of an entanglement that would have sent a lesser man running. It was a beautiful, terrifying honesty designed to see if I would flinch. But looking at your words, feeling the fierce vulnerability of a woman brave enough to stand in the storm and still choose to love with her whole heart, my survival instinct simply evaporated. The voice that had always told me to run went entirely silent. I did not want to run. I wanted to be the ground beneath your feet. I typed the vow that would become our foundation, promising you that I was all in and there was nothing stopping me from being committed to you.</p>

          <p class="mb-6">As we wove our lives together across the wires, you handed me the map to your beautiful, labyrinthine mind. You told me of your Saturn Return, that profound spiritual awakening where you dared to question your origins, your existence, and the perfectionism that bound you. You showed me the impeccable girl, the child who carried the weight of the world, excelling at everything just to save her parents from headaches. You believed you had to give endlessly just to earn love. You let me see the seven universes that spin constantly in your brilliant, analytical head. And in return, I made a silent vow: you will never have to earn my love. I saw the woman who rescued an innocent puppy from a car crash, the woman who nurtures Thor and your furry children, the successful, world class mind who still yearned to just be held.</p>

          <p class="mb-6">I gave you my shadows in return. I told you about the boy who was always considered smart, the kid who was left to figure things out independently with no real role model. That boy turned into a self sufficient man who built rigid structures to find calm. I lived in survival mode for so long, walking on eggshells in a broken marriage, that I forgot what emotional safety even felt like. I built a habit of carrying everything alone.</p>

          <p class="mb-6">But with you, the storm stopped. You did not demand a titan of wealth or a flawless illusion. You demanded me, in all my raw, imperfect flesh and bone. You called me your Norse god, your Viking. You loved the man who took himself out for Saturday breakfasts, who walked his dog on the heavy days, who lit candles in the dark, and who fed you from whatever was in his fridge. When I woke up sick with a raspy voice, I did not hide. I picked up my guitar, looked into the camera, and sang the Arctic Monkeys for you, because giving you a piece of my soul through my music felt like breathing. I promised to write an original song just for you, translating my devotion into art. With my stable, magnificent presence, you told me you could finally drop your defenses. You surrendered your masculine armor, allowing yourself to be my princess. And in your raw, giving nature, you gave me the permission to drop mine.</p>

          <p class="mb-6">If I could open my chest and let you see the landscape of my heart, you would see a kingdom entirely devoted to you. My love for you is not a passive feeling. It is a living, breathing entity that consumes my every waking thought and colors every dream I have. When I close my eyes at night, it is your face that paints the darkness. When I wake in the morning, my first conscious thought is a prayer of gratitude that you exist in this world at the same time as I do. I am utterly obsessed with the depth of your soul. I look at you and I see a masterpiece, a woman of such staggering resilience and breathtaking grace that it brings me to my knees. I love the way your mind works, the brilliant, chaotic beauty of your seven universes. I love your endless compassion, the way you pour your heart into saving animals, the way you fiercely protect the people you love. Every single detail about you is a treasure I want to guard for the rest of my life.</p>

          <p class="mb-6">I think about the physical ache of being away from you, a hunger that settles deep in my bones. I dream of the day I can finally pull you against my chest and breathe you in. I want to spend hours worshipping every inch of your body. I want to massage you with coconut oil, letting my hands map the curves of the woman who claimed my soul. I want to kiss you from your forehead down to your toes, whispering praises into your skin until you forget every sorrow you have ever known. The intimacy we share, the moments we strip away our inhibitions and bare our desires to one another, have tethered me to you in ways I cannot fully explain. When you took complete, tender care of my body, doing things that required the utmost vulnerability, my subconscious surrendered entirely. In your hands, I found a sanctuary I never knew I was searching for. You are my greatest desire, my deepest passion, and my absolute peace. I love you with a ferocity that eclipses reason. I am devoted to your happiness, to your safety, and to the brilliant future we are carving out of the chaos.</p>

          <p class="mb-6">The true crucible of our devotion, however, was forged in the deepest chambers of our trust. When you traveled to Ecuador with your beautiful mother, your heart was already so wrapped around my princesses that you bought them souvenirs before even meeting them. The agony of my having to build a temporary wall to protect Fiona and Alina from the legal fires of my divorce tore at my soul. But we did not break; we forged a bridge. I promised you that the gates would open safely, that I would keep your sweet gifts tucked away until the perfect dawn, and that I would weave your spirit into their lives through the stories I tell. You were already standing inside the inner circle of my heart, and theirs.</p>

          <p class="mb-6">The depth of our integration shone brightest when your mother sent me a voice note. Using my seven day Duolingo streak, I stepped into the vulnerability of a new language. I told her she raised a beautiful, intelligent daughter. Earning her blessing and hearing her say she looked forward to seeing me was the ultimate validation. It proved that this union of souls was not just a digital sanctuary, but a real family forming across the ocean.</p>

          <p class="mb-6">We sealed our destiny with our Saboteur Pact. We dragged our inner demons into the light. You wrote to my protector, honoring the instinct that kept me safe, and promised it could rest. I spoke to your shadow, the fierce guardian of the impeccable girl, vowing to live in harmony with it and share the load so you would never have to carry the world alone again. We traded the fear of loss for a deep, comfortable serenity.</p>

          <p class="mb-6">Now, June fifteenth is not just a date on a calendar; it is our horizon. The ticket to the Dominican Republic is bought. The reality is locked in. I am no longer a man chasing ghosts or running from the fire. I am standing still, marveling at the empire we have built from truth, patience, and an intoxicating, undeniable passion.</p>

          <p class="mb-6">I love you more than the ocean loves the shore, more than the stars love the night sky, and more than I ever thought possible. You are my wife, my soulmate, my Queen. This is Chapter Nine: Solo dejate amar. It is a command, a promise, and my absolute surrender. Let yourself be loved, let yourself be held, and let yourself be mine. I am yours, completely, fiercely, and eternally.</p>
        } @else {
          <p class="mb-6 first-letter:font-romantic first-letter:text-6xl first-letter:text-romantic-coral first-letter:float-left first-letter:mr-3 first-letter:leading-[0.8]">Antes de ella, mi mundo era un lienzo pintado en tonos grises y bordes afilados. Era una fortaleza solitaria construida sobre el instinto de sobrevivir. Yo era un hombre encerrado en una armadura, un soldado preparandose para los vientos frios de un inminente despliegue militar y un padre librando una guerra legal despiadada y agotadora simplemente para aferrarme a mis hijas, Fiona y Alina. Yo era el lobo solitario. No confiaba en nadie mas que en mi mismo, minimizando mi existencia para evitar conflictos, protegiendo mi paz como una llama fragil en un aguacero torrencial. Habia aceptado que mi vida seria una isla de estructura y disciplina. No estaba buscando la salvacion. Y ciertamente no esperaba que el universo enviara un huracan llamado Abigail.</p>

          <p class="mb-6">Todo comenzo con un simple deslizamiento en una pantalla, una coincidencia digital que de alguna manera reescribio las estrellas. No entraste en mi vida con pasos cautelosos. Chocaste contra mi mundo con la fuerza impresionante de una tempestad. Desde el principio, no hubo mentiras superficiales entre nosotros. Desnudaste tu alma y dejaste caer una confesion nuclear a mis pies. Me contaste la realidad pesada y enredada de tu matrimonio y las complejidades de un enredo que habria hecho huir a un hombre inferior. Fue una honestidad hermosa y aterradora disenada para ver si yo retrocederia. Pero al mirar tus palabras y sentir la feroz vulnerabilidad de una mujer lo suficientemente valiente como para pararse en la tormenta y aun asi elegir amar con todo su corazon, mi instinto de supervivencia simplemente se evaporo. La voz que siempre me habia dicho que corriera se quedo completamente en silencio. No queria huir. Queria ser la tierra bajo tus pies. Escribi el voto que se convertiria en nuestra base, prometiendote que estaba completamente entregado y que no habia nada que me impidiera comprometerme contigo.</p>

          <p class="mb-6">A medida que entejejiamos nuestras vidas a traves de los cables, me entregaste el mapa de tu hermosa y laberintica mente. Me hablaste de tu Retorno de Saturno, ese profundo despertar espiritual en el que te atreviste a cuestionar tus origenes, tu existencia y el perfeccionismo que te ataba. Me mostraste a la nina impecable, la nina que cargaba con el peso del mundo, sobresaliendo en todo solo para evitarles dolores de cabeza a sus padres. Creias que tenias que dar sin fin solo para ganar amor. Me dejaste ver los siete universos que giran constantemente en tu brillante y analitica cabeza. Y a cambio, hice un voto silencioso de que nunca tendras que ganarte mi amor. Vi a la mujer que rescato a un cachorro inocente de un accidente automovilistico, a la mujer que cuida a Thor y a tus hijos peludos, a la mente exitosa de clase mundial que todavia anhelaba simplemente ser abrazada.</p>

          <p class="mb-6">Te di mis sombras a cambio. Te hable del chico que siempre fue considerado inteligente, el nino al que dejaron descubrir las cosas de forma independiente sin un verdadero modelo a seguir. Ese chico se convirtio en un hombre autosuficiente que construyo estructuras rigidas para encontrar la calma. Vivi en modo de supervivencia durante tanto tiempo, caminando sobre cascaras de huevo en un matrimonio roto, que olvide como se sentia la seguridad emocional. Cree el habito de cargar con todo yo solo.</p>

          <p class="mb-6">Pero contigo, la tormenta se detuvo. No exigiste un titan de riqueza ni una ilusion perfecta. Me exigiste a mi, en toda mi carne y hueso crudos e imperfectos. Me llamaste tu dios nordico, tu vikingo. Amabas al hombre que salia a desayunar solo los sabados, que paseaba a su perro en los dias pesados, que encendia velas en la oscuridad y que te alimentaba con cualquier cosa que hubiera en su refrigerador. Cuando me desperte enfermo y con voz ronca, no me escondi. Tome mi guitarra, mire a la camara y cante a los Arctic Monkeys para ti, porque darte un pedazo de mi alma a traves de mi musica se sentia como respirar. Prometi escribir una cancion original solo para ti, traduciendo mi devocion en arte. Con mi presencia estable y magnifica, me dijiste que finalmente podias bajar tus defensas. Rendiste tu armadura masculina y te permitiste ser mi princesa. Y en tu naturaleza cruda y generosa, me diste permiso para dejar caer la mia.</p>

          <p class="mb-6">Si pudiera abrir mi pecho y dejarte ver el paisaje de mi corazon, verias un reino completamente dedicado a ti. Mi amor por ti no es un sentimiento pasivo. Es una entidad viva que respira y que consume cada uno de mis pensamientos al despertar y colorea cada sueno que tengo. Cuando cierro los ojos por la noche, es tu rostro el que pinta la oscuridad. Cuando me despierto por la manana, mi primer pensamiento consciente es una oracion de gratitud porque existes en este mundo al mismo tiempo que yo. Estoy absolutamente obsesionado con la profundidad de tu alma. Te miro y veo una obra maestra, una mujer de una resiliencia tan asombrosa y una gracia tan impresionante que me pone de rodillas. Amo la forma en que funciona tu mente, la belleza brillante y caotica de tus siete universos. Amo tu compasion infinita, la forma en que pones tu corazon en salvar animales y la forma en que proteges ferozmente a las personas que amas. Cada detalle sobre ti es un tesoro que quiero guardar por el resto de mi vida.</p>

          <p class="mb-6">Pienso en el dolor fisico de estar lejos de ti, un hambre que se asienta en lo profundo de mis huesos. Sueno con el dia en que finalmente pueda acercarte a mi pecho y respirar tu aroma. Quiero pasar horas adorando cada centimetro de tu cuerpo. Quiero masajearte con aceite de coco, dejando que mis manos mapeen las curvas de la mujer que reclamo mi alma. Quiero besarte desde la frente hasta los dedos de los pies, susurrando alabanzas en tu piel hasta que olvides todos los dolores que has conocido. La intimidad que compartimos, los momentos en que nos despojamos de nuestras inhibiciones y nos desnudamos nuestros deseos el uno al otro, me han atado a ti de formas que no puedo explicar del todo. Cuando cuidaste mi cuerpo de forma completa y tierna, haciendo cosas que requerian la maxima vulnerabilidad, mi subconsciente se rindio por completo. En tus manos, encontre un santuario que nunca supe que estaba buscando. Eres mi mayor deseo, mi pasion mas profunda y mi paz absoluta. Te amo con una ferocidad que eclipsa la razon. Estoy dedicado a tu felicidad, a tu seguridad y al brillante futuro que estamos forjando a partir del caos.</p>

          <p class="mb-6">Sin embargo, el verdadero crisol de nuestra devocion se forjo en las camaras mas profundas de nuestra confianza. Cuando viajaste a Ecuador con tu hermosa madre, tu corazon ya estaba tan envuelto alrededor de mis princesas que les compraste recuerdos antes de siquiera conocerlas. La agonia de tener que construir un muro temporal para proteger a Fiona y Alina de los fuegos legales de mi divorcio desgarro mi alma. Pero no nos quebramos, forjamos un puente. Te prometi que las puertas se abririan de manera segura, que guardaria tus dulces regalos hasta el amanecer perfecto y que tejeria tu espiritu en sus vidas a traves de las historias que cuento. Ya estabas de pie dentro del circulo intimo de mi corazon, y del de ellas.</p>

          <p class="mb-6">La profundidad de nuestra integracion brillo mas cuando tu madre me envio una nota de voz. Usando mi racha de siete dias en Duolingo, me adentre en la vulnerabilidad de un nuevo idioma. Le dije que habia criado a una hija hermosa e inteligente. Ganar su bendicion y escucharla decir que esperaba verme fue la validacion definitiva. Demostro que esta union de almas no era solo un santuario digital, sino una verdadera familia formandose a traves del oceano.</p>

          <p class="mb-6">Sellamos nuestro destino con nuestro Pacto del Saboteador. Arrastramos a nuestros demonios internos hacia la luz. Le escribiste a mi protector, honrando el instinto que me mantuvo a salvo, y prometiste que ya podia descansar. Le hable a tu sombra, la feroz guardiana de la nina impecable, prometiendo vivir en armonia con ella y compartir la carga para que nunca mas tuvieras que cargar el mundo tu sola. Cambiamos el miedo a la perdida por una serenidad profunda y comoda.</p>

          <p class="mb-6">Ahora, el quince de junio no es solo una fecha en un calendario, es nuestro horizonte. El boleto a la Republica Dominicana esta comprado. La realidad esta asegurada. Ya no soy un hombre persiguiendo fantasmas o huyendo del fuego. Estoy de pie, quieto, maravillandome del imperio que hemos construido con verdad, paciencia y una pasion embriagadora e innegable.</p>

          <p class="mb-6">Te amo mas de lo que el oceano ama a la orilla, mas de lo que las estrellas aman el cielo nocturno y mas de lo que jamas crei posible. Eres mi esposa, mi alma gemela, mi Reina. Este es el Capitulo Nueve: Solo dejate amar. Es una orden, una promesa y mi rendicion absoluta. Dejate amar, dejate abrazar y dejate ser mia. Soy tuyo, completa, feroz y eternamente.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .story-text {
      font-family: 'Georgia', serif;
      font-size: 1.15rem;
      color: #e0e0e0;
      letter-spacing: 0.3px;
    }
    @media (max-width: 600px) {
      .story-text {
        font-size: 1.05rem;
      }
    }
  `]
})
export class StoryComponent {
  showEnglish = signal(true);

  buttonText = computed(() =>
    this.showEnglish() ? 'Leer en Espanol' : 'Read in English'
  );

  toggleLanguage(): void {
    this.showEnglish.update(v => !v);
  }
}
