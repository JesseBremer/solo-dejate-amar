import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SongsService } from '../../services/songs.service';

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
        @for (song of songsService.songs(); track song.id) {
          <div class="flex flex-col p-4 md:p-5 rounded-lg transition-transform duration-200 hover:-translate-y-1"
               [class]="song.shared_by === 'jesse' ? 'border-l-4 border-l-jesse-blue bg-jesse-blue/5' : 'border-l-4 border-l-romantic-pink bg-romantic-pink/5'">
            <div class="text-xs mb-2 uppercase tracking-wider"
                 [class]="song.shared_by === 'jesse' ? 'text-jesse-blue' : 'text-romantic-pink'">
              Shared by {{ song.shared_by === 'jesse' ? 'Jesse' : 'Abigail' }}
            </div>
            <h3 class="text-xl text-white m-0 mb-1">{{ song.title }}</h3>
            <p class="text-base text-gray-400 m-0 mb-4 italic">{{ song.artist }}</p>
            <div class="flex gap-3 flex-wrap">
              <a [href]="song.spotify_url"
                 target="_blank"
                 class="no-underline px-3 py-2 rounded text-sm transition-colors text-center flex-grow text-spotify-green border border-spotify-green hover:bg-spotify-green hover:text-black">
                {{ song.youtube_url ? 'Spotify' : 'Listen on Spotify' }}
              </a>
              @if (song.youtube_url) {
                <a [href]="song.youtube_url"
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
export class SongsComponent implements OnInit {
  songsService = inject(SongsService);

  ngOnInit(): void {
    this.songsService.loadAll();
  }
}
