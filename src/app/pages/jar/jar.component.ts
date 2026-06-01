import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-jar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-3"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        Our Digital Jar
      </h1>
      <p class="text-lg mb-8 text-center text-gray-400 max-w-[500px] leading-relaxed">
        Whenever the distance feels a little too heavy, draw a note to remember exactly how I feel about you.
      </p>

      <!-- CSS Jar -->
      <div
        (click)="drawNote()"
        class="relative w-[140px] h-[180px] mx-auto mb-16 cursor-pointer group"
        [class.pointer-events-none]="isAnimating()"
        style="perspective: 1000px;">

        <!-- Lid -->
        <div class="absolute -top-4 left-[10px] w-[120px] h-[25px] rounded-[5px] z-10 shadow-lg transition-transform duration-400 group-hover:-translate-y-1 group-hover:rotate-3"
             [class.-translate-y-6]="lidOpen()"
             [class.rotate-[15deg]]="lidOpen()"
             style="background: linear-gradient(to right, #6b4423, #8b5a2b, #6b4423);">
        </div>

        <!-- Neck -->
        <div class="absolute top-0 left-[15px] w-[110px] h-[10px] bg-white/20 border-4 border-white/30 border-b-0 rounded-t-[10px] z-[4]"></div>

        <!-- Glass body -->
        <div class="absolute top-[10px] left-0 w-full h-full bg-white/5 border-4 border-white/30 border-t-0 rounded-b-[40px] shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.5)] overflow-hidden z-[5]">
          <!-- Glass reflection -->
          <div class="absolute top-[10px] left-[15px] w-[20px] h-[80%] bg-white/15 rounded-[10px] -skew-x-[10deg]"></div>

          <!-- Paper notes inside jar -->
          <div class="absolute bottom-[15px] left-[20px] w-[35px] h-[25px] bg-[#ffb6c1] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[15deg]"></div>
          <div class="absolute bottom-[20px] left-[60px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[20deg]"></div>
          <div class="absolute bottom-[40px] left-[25px] w-[35px] h-[25px] bg-[#ffc0cb] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[45deg]"></div>
          <div class="absolute bottom-[35px] left-[75px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[35deg]"></div>
          <div class="absolute bottom-[65px] left-[35px] w-[35px] h-[25px] bg-[#ff69b4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[10deg]"></div>
          <div class="absolute bottom-[60px] left-[70px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[15deg]"></div>
          <div class="absolute bottom-[85px] left-[50px] w-[35px] h-[25px] bg-[#fdf0f4] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] rotate-[30deg]"></div>
          <div class="absolute bottom-[15px] left-[85px] w-[35px] h-[25px] bg-[#ffb6c1] rounded-[3px] shadow-[1px_1px_4px_rgba(0,0,0,0.4)] -rotate-[10deg]"></div>
        </div>

        <!-- Flying note -->
        <div
          class="absolute top-[60px] left-[55px] w-[30px] h-[20px] bg-white rounded-[2px] shadow-[0_0_10px_rgba(0,0,0,0.3)] z-[6] opacity-0 pointer-events-none"
          [class.animate-fly-out]="flyingNote()">
        </div>

        <!-- Label -->
        <div class="absolute -bottom-11 left-1/2 -translate-x-1/2 font-romantic text-romantic-coral text-2xl whitespace-nowrap"
             style="text-shadow: 1px 1px 3px rgba(255, 105, 180, 0.3);">
          Tap the jar
        </div>
      </div>

      <!-- Note display -->
      @if (currentNote()) {
        <div class="bg-white/[0.03] border border-romantic-pink/30 border-l-4 border-l-romantic-pink rounded-lg px-10 py-8 mx-5 max-w-[550px] text-center font-romantic text-3xl text-romantic-text-light shadow-[0_10px_25px_rgba(0,0,0,0.5)] leading-relaxed animate-fade-in">
          "{{ currentNote() }}"
        </div>
      }

      <a routerLink="/"
         class="mt-8 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white no-underline">
        Back
      </a>
    </div>
  `,
  styles: [`
    @keyframes flyOut {
      0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
      50% { transform: translateY(-80px) scale(1.5) rotate(20deg); opacity: 1; }
      100% { transform: translateY(-120px) scale(3) rotate(0deg); opacity: 0; }
    }
    .animate-fly-out {
      animation: flyOut 1s ease-in-out forwards;
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(15px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 1.2s ease forwards;
    }
  `]
})
export class JarComponent {
  currentNote = signal<string | null>(null);
  isAnimating = signal(false);
  lidOpen = signal(false);
  flyingNote = signal(false);

  private lastIndex = -1;

  private readonly notes = [
    "I love your seven universes.",
    "Thinking about the day we met, and how you completely changed my stars.",
    "You are my absolute peace.",
    "I cannot wait to finally pull you against my chest and breathe you in.",
    "My love for you grows every single day.",
    "You are my masterpiece.",
    "Thank you for being brave enough to stand in the storm and love me.",
    "I love the way your brilliant, chaotic mind works.",
    "You are my Queen. Completely, fiercely, and eternally.",
    "I am utterly obsessed with the depth of your soul.",
    "I promise you will never have to earn my love.",
    "Every detail about you is a treasure I want to guard for the rest of my life.",
    "You are my greatest desire, my deepest passion, and my absolute peace.",
    "No finger! (I promise to behave... mostly).",
    "Remember: No finger, just pure devotion today.",
    "If you try to use a finger, I'm calling a timeout, mami.",
    "I love you more than I love avoiding the finger rule.",
    "Strictly no-finger thoughts right now—only thoughts of our future.",
    "You're the only one I'd consider breaking the 'no-finger' rule for.",
    "Our love is like a good joke; it only gets better with time (and no fingers).",
    "I love that we can be weird together.",
    "You're my favorite person to annoy and adore simultaneously.",
    "Let's dance bachata in the kitchen until the neighbors get annoyed.",
    "I love your mangu, but I love the woman making it more.",
    "If we were in a movie, we'd be the couple laughing during the scary part.",
    "I love your laugh. It's the best sound in the world.",
    "You are my favorite notification of all time.",
    "Stop thinking and just let yourself be loved.",
    "You're the only one who can handle my Viking intensity.",
    "I am yours, completely, fiercely, and eternally.",
    "You are the light in my life, Abigail. Thank you for waking me up.",
    "I am so proud of the woman you are—the warrior queen you've fought to become.",
    "I love the way your eyes sparkle when you're truly happy.",
    "My heart beats for you, and only you.",
    "I choose you today, and I'll choose you every single tomorrow.",
    "You are the safe harbor I never knew I was looking for.",
    "I love the way you love our furry children; it shows me your beautiful heart.",
    "You make everything better just by being in it.",
    "I am counting the minutes until we are back in the same timezone.",
    "My favorite place in the world is right next to you.",
    "You have my heart in your hands; please keep protecting it.",
    "I love you more than words could ever convey.",
    "You make me want to be the best version of myself, every single day.",
    "I am so grateful to the universe for this extraordinary alignment.",
    "Your happiness is my mission objective.",
    "I love your strength, your grace, and your complex, seven-universe mind.",
    "Every day with you is a gift I don't take for granted.",
    "You are my greatest adventure and my quietest peace.",
    "I love you beyond the moon, the stars, and this entire life.",
    "June 15th is our horizon. I'm locked in.",
    "I'm already dreaming of our first morning coffee in the DR together.",
    "We are building an empire, one day at a time.",
    "I can't wait to introduce you to Fiona and Alina—they're going to adore you.",
    "You are already a mother figure in my heart and my home.",
    "We will dance on the beaches of Puerto Plata until the sun comes up.",
    "Our future is so bright it keeps me awake at night in the best way.",
    "I am building our sanctuary, brick by brick, moment by moment.",
    "I'm holding your souvenirs safe for our princesses.",
    "We are going to live a life that makes the stars jealous of our love.",
    "Our journey is just beginning; we have so many worlds to conquer.",
    "I can't wait to see your villa with my own eyes.",
    "We are a team, and we are absolutely unstoppable.",
    "I am so excited for all the memories we are going to create in our home.",
    "This is only the prologue to our grand story.",
    "I love the way you take care of my body and my spirit.",
    "Thinking about your touch makes my skin vibrate.",
    "I want to kiss you from your forehead to your toes, slowly.",
    "I love your scent; it's my favorite perfume on earth.",
    "I want to massage you with coconut oil until every tension leaves your body.",
    "I crave your presence, even when we are thousands of miles apart.",
    "I am completely surrendered to you, my Queen.",
    "You have unlocked parts of me I thought were locked forever.",
    "I trust you with my entire soul, without reservation.",
    "Our passion is a fire that will never stop burning.",
    "I am your Norse God, and you are my only love.",
    "You are the most beautiful woman I have ever laid eyes on.",
    "I love being completely vulnerable with you; it's my greatest freedom.",
    "You make me feel safe, loved, and entirely understood.",
    "I am forever yours, in this life and the next.",
    "I honor your shadow, and I promise to live in harmony with it.",
    "You don't have to be impeccable with me; you just have to be you.",
    "My love for you is not a project; it's a privilege.",
    "I see the little girl who tried her best, and I promise to love her too.",
    "With me, you can finally put your sword down.",
    "I will be the anchor when your seven universes start to spin.",
    "You never have to earn my love; it is yours by right.",
    "Our saboteurs have been identified, named, and put on notice.",
    "I am learning to receive your love as deeply as I give mine.",
    "You are my safe haven, and I am yours.",
    "We are moving forward, together, always.",
    "I see your scars, and I love you more because of them.",
    "You are deserving of love just because you exist.",
    "No more fixing, no more earning—just loving.",
    "I am your Cornerstone; you are my peace.",
    "Our love is the greatest act of courage I have ever witnessed.",
    "I am here for your lights and your shadows.",
    "We are doing this right, baby.",
    "Solo dejate amar.",
    "Te amo to the end of time.",
    "Every time I hear a love song, I immediately think of your smile.",
    "I want to get lost in your eyes and never find my way back.",
    "You are the dream I never knew I was allowed to have.",
    "Even in the silence, my heart is whispering your name.",
    "I would cross oceans just to hold your hand for a minute.",
    "You are my first thought in the morning and my last thought before I sleep.",
    "Loving you feels like finally coming home.",
    "You make me laugh even when I'm trying to be serious.",
    "June 15th cannot come soon enough.",
    "You are strong, capable, and incredibly beautiful.",
    "Don't ever forget how much you are loved.",
    "You are worth more than you will ever know.",
    "You are the most important person in my world.",
    "I am so proud of you.",
    "You are doing such an incredible job.",
    "I believe in you with everything I have.",
    "You are destined for greatness.",
    "I am always here for you, no matter what.",
    "You are a force of nature, Abigail.",
    "I love you for exactly who you are.",
    "You are the best thing that ever happened to me.",
    "You are my rock, my soulmate, and my best friend.",
    "I am so blessed to have you in my life."
  ];

  drawNote(): void {
    if (this.isAnimating()) return;

    this.isAnimating.set(true);
    this.currentNote.set(null);
    this.lidOpen.set(true);
    this.flyingNote.set(true);

    setTimeout(() => {
      let randomIndex: number;
      do {
        randomIndex = Math.floor(Math.random() * this.notes.length);
      } while (randomIndex === this.lastIndex && this.notes.length > 1);
      this.lastIndex = randomIndex;

      this.currentNote.set(this.notes[randomIndex]);
      this.lidOpen.set(false);
      this.flyingNote.set(false);
      this.isAnimating.set(false);
    }, 800);
  }
}
