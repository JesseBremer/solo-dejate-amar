import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Song {
  title: string;
  artist: string;
  sharedBy: 'jesse' | 'abigail';
  spotifyUrl: string;
  youtubeUrl?: string;
}

@Component({
  selector: 'app-songs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center w-full p-5">
      <h1 class="text-romantic-coral font-romantic text-4xl md:text-5xl text-center mb-3"
          style="text-shadow: 2px 2px 4px rgba(255, 105, 180, 0.2);">
        The Soundtrack of Us
      </h1>
      <p class="text-lg mb-8 text-center text-gray-400">Every song is a piece of our story.</p>

      <div class="flex justify-center gap-5 mb-5 text-sm flex-col md:flex-row items-center">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-jesse-blue"></div>
          <span class="text-romantic-text">Shared by Jesse</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded bg-romantic-pink"></div>
          <span class="text-romantic-text">Shared by Abigail</span>
        </div>
      </div>

      <div class="w-full max-w-[600px] flex flex-col gap-4 mb-8">
        @for (song of songs; track song.title) {
          <div class="flex flex-col p-4 md:p-5 rounded-lg transition-transform duration-200 hover:-translate-y-1"
               [class]="song.sharedBy === 'jesse' ? 'border-l-4 border-l-jesse-blue bg-jesse-blue/5' : 'border-l-4 border-l-romantic-pink bg-romantic-pink/5'">
            <div class="text-xs mb-2 uppercase tracking-wider"
                 [class]="song.sharedBy === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
              Shared by {{ song.sharedBy === 'jesse' ? 'Jesse' : 'Abigail' }}
            </div>
            <h3 class="text-xl text-white m-0 mb-1">{{ song.title }}</h3>
            <p class="text-base text-gray-400 m-0 mb-4 italic">{{ song.artist }}</p>
            <div class="flex gap-3 flex-wrap">
              <a [href]="song.spotifyUrl"
                 target="_blank"
                 class="no-underline px-3 py-2 rounded text-sm transition-colors text-center flex-grow text-spotify-green border border-spotify-green hover:bg-spotify-green hover:text-black">
                {{ song.youtubeUrl ? 'Spotify' : 'Listen on Spotify' }}
              </a>
              @if (song.youtubeUrl) {
                <a [href]="song.youtubeUrl"
                   target="_blank"
                   class="no-underline px-3 py-2 rounded text-sm transition-colors text-center flex-grow text-youtube-red border border-youtube-red hover:bg-youtube-red hover:text-white">
                  YouTube Music
                </a>
              }
            </div>
          </div>
        }
      </div>

      <a routerLink="/"
         class="px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white">
        Back
      </a>
    </div>
  `
})
export class SongsComponent {
  songs: Song[] = [
    { title: "Do I Wanna Know?", artist: "Arctic Monkeys", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/track/5FVd6KXrgO9B3JPmC8OPst", youtubeUrl: "https://music.youtube.com/watch?v=bpOSxM0rNPM" },
    { title: "Hipnotizame", artist: "Wisin & Yandel", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Hipnotizame%20Wisin%20%26%20Yandel/tracks", youtubeUrl: "https://music.youtube.com/search?q=Hipnotizame+Wisin+%26+Yandel" },
    { title: "2/Catorce", artist: "Rauw Alejandro", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/2%2FCatorce%20Rauw%20Alejandro/tracks", youtubeUrl: "https://music.youtube.com/search?q=2%2FCatorce+Rauw+Alejandro" },
    { title: "Particles", artist: "Nothing But Thieves", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/Particles%20Nothing%20But%20Thieves/tracks", youtubeUrl: "https://music.youtube.com/search?q=Particles+Nothing+But+Thieves" },
    { title: "Adicto", artist: "Tainy, Anuel AA, Ozuna", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Adicto%20Tainy%20Anuel%20AA%20Ozuna/tracks", youtubeUrl: "https://music.youtube.com/search?q=Adicto+Tainy+Anuel+AA+Ozuna" },
    { title: "Cocina Playlist", artist: "Various Songs", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/playlist/3wVcWAmQS9M5IQSI9Bjgvn?si=fjJeUzc8Tzu02RMcSs1UVw&pi=rF_a3wFZRX6qc&pt_success=1&nd=1&dlsi=771ece5f58cd4c3c" },
    { title: "Miedo", artist: "Cazzu", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Miedo%20Cazzu/tracks", youtubeUrl: "https://music.youtube.com/search?q=Miedo+Cazzu" },
    { title: "Wait for Me", artist: "Kings of Leon", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/Wait%20for%20Me%20Kings%20of%20Leon/tracks", youtubeUrl: "https://music.youtube.com/search?q=Wait+for+Me+Kings+of+Leon" },
    { title: "Te Vi", artist: "Piso 21 & Micro TDH", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Te%20Vi%20Piso%2021%20Micro%20TDH/tracks", youtubeUrl: "https://music.youtube.com/search?q=Te+Vi+Piso+21+Micro+TDH" },
    { title: "If the World was Ending", artist: "JP Saxe ft. Julia Michaels", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/If%20the%20World%20was%20Ending%20JP%20Saxe/tracks", youtubeUrl: "https://music.youtube.com/search?q=If+the+World+was+Ending+JP+Saxe+Julia+Michaels" },
    { title: "Die with a Smile", artist: "Bruno Mars & Lady Gaga", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/Die%20with%20a%20Smile%20Bruno%20Mars/tracks", youtubeUrl: "https://music.youtube.com/search?q=Die+with+a+Smile+Bruno+Mars+Lady+Gaga" },
    { title: "Illegal", artist: "Cultura Profetica", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Illegal%20Cultura%20Profetica/tracks", youtubeUrl: "https://music.youtube.com/search?q=Illegal+Cultura+Profetica" },
    { title: "Un Ratito Mas", artist: "Bryant Myers & Bad Bunny", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Un%20Ratito%20Mas%20Bryant%20Myers%20Bad%20Bunny/tracks", youtubeUrl: "https://music.youtube.com/search?q=Un+Ratito+Mas+Bryant+Myers+Bad+Bunny" },
    { title: "Un Polvo", artist: "Maluma, Bad Bunny, Arcangel, Nengo Flow, De La Ghetto", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Un%20Polvo%20Maluma%20Bad%20Bunny/tracks", youtubeUrl: "https://music.youtube.com/search?q=Un+Polvo+Maluma+Bad+Bunny" },
    { title: "Spicy and Hot Playlist", artist: "Various Songs", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/playlist/29lacTyTVGXE6yXohtAPqr?si=1mtQcy1kTDKqeEWtvrNZGg&pi=eih0MownTEGOj&nd=1&dlsi=6c0a58d47b864a60" },
    { title: "I Wanna Be Yours", artist: "Arctic Monkeys", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/I%20Wanna%20Be%20Yours%20Arctic%20Monkeys/tracks", youtubeUrl: "https://music.youtube.com/search?q=I+Wanna+Be+Yours+Arctic+Monkeys" },
    { title: "Playa Marina", artist: "Ozuna and Beele", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Playa%20Marina%20Ozuna%20Beele/tracks", youtubeUrl: "https://music.youtube.com/search?q=Playa+Marina+Ozuna+Beele" },
    { title: "Mi Cuarto", artist: "Jerry Di", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Mi%20Cuarto%20Jerry%20Di/tracks", youtubeUrl: "https://music.youtube.com/search?q=Mi+Cuarto+Jerry+Di" },
    { title: "Dream Girl Remix", artist: "Ir Sais, Rauw Alejandro", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Dream%20Girl%20Remix%20Ir%20Sais%20Rauw%20Alejandro/tracks", youtubeUrl: "https://music.youtube.com/search?q=Dream+Girl+Remix+Ir+Sais+Rauw+Alejandro" },
    { title: "Magic", artist: "The Blue Stones", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/Magic%20The%20Blue%20Stones/tracks", youtubeUrl: "https://music.youtube.com/search?q=Magic+The+Blue+Stones" },
    { title: "Creo en Ti", artist: "Reik", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Creo%20en%20Ti%20Reik/tracks", youtubeUrl: "https://music.youtube.com/search?q=Creo+en+Ti+Reik" },
    { title: "Etereo y Celestial Playlist", artist: "Various Songs", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/playlist/1D92hWwIDkKgdnWhbe2xRh?si=ZDfpFT_QREydR_TSVe1fQg&pi=27kLvyTPRFKyf&nd=1&dlsi=71b766f27528430c" },
    { title: "Desnuda", artist: "Ricardo Arjona", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Desnuda%20Ricardo%20Arjona/tracks", youtubeUrl: "https://music.youtube.com/search?q=Desnuda+Ricardo+Arjona" },
    { title: "Ganas De Ti", artist: "Arcangel", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Ganas%20De%20Ti%20Arcangel/tracks", youtubeUrl: "https://music.youtube.com/search?q=Ganas+De+Ti+Arcangel" },
    { title: "The Other Side", artist: "Stephen Sanchez", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/The%20Other%20Side%20Stephen%20Sanchez/tracks", youtubeUrl: "https://music.youtube.com/search?q=The+Other+Side+Stephen+Sanchez" },
    { title: "Until I Found You", artist: "Stephen Sanchez", sharedBy: "jesse", spotifyUrl: "https://open.spotify.com/search/Until%20I%20Found%20You%20Stephen%20Sanchez/tracks", youtubeUrl: "https://music.youtube.com/search?q=Until+I+Found+You+Stephen+Sanchez" },
    { title: "Punto G (Remix)", artist: "Brytiago", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Punto%20G%20Remix%20Brytiago/tracks", youtubeUrl: "https://music.youtube.com/search?q=Punto+G+Remix+Brytiago" },
    { title: "La Ocasion", artist: "DJ Luian", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/La%20Ocasion%20DJ%20Luian/tracks", youtubeUrl: "https://music.youtube.com/search?q=La+Ocasion+DJ+Luian" },
    { title: "Bailando Bachata", artist: "Chayanne", sharedBy: "abigail", spotifyUrl: "https://open.spotify.com/search/Bailando%20Bachata%20Chayanne/tracks", youtubeUrl: "https://music.youtube.com/search?q=Bailando+Bachata+Chayanne" },
  ];
}
