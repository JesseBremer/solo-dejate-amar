import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface GalleryImage {
  src: string;
  loaded: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center w-full mt-5">
      <h2 class="text-romantic-coral mb-3 font-romantic text-3xl md:text-4xl text-center">Our Beautiful Memories</h2>

      <div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4 w-full max-w-[600px] mt-5 mb-8">
        @for (img of images(); track img.src) {
          <img
            [src]="img.src"
            alt="Our Memory"
            (click)="openLightbox(img.src)"
            class="w-full h-[120px] object-cover rounded-lg border border-romantic-pink transition-transform duration-300 cursor-pointer hover:scale-105" />
        }
      </div>

      <a routerLink="/"
         class="mt-8 px-5 py-3 cursor-pointer bg-transparent border border-romantic-coral text-romantic-coral rounded-md transition-all duration-300 font-serif hover:bg-romantic-coral hover:text-white">
        Back
      </a>
    </div>

    @if (lightboxSrc()) {
      <div
        (click)="closeLightbox()"
        class="fixed z-[1000] left-0 top-0 w-full h-full bg-black/90 flex items-center justify-center flex-col">
        <span class="absolute top-5 right-8 text-romantic-coral text-4xl font-bold cursor-pointer hover:text-white">&times;</span>
        <img
          [src]="lightboxSrc()"
          alt="Enlarged Memory"
          class="max-w-[90%] max-h-[90%] rounded-lg border-2 border-romantic-pink shadow-[0_0_20px_rgba(255,105,180,0.3)]" />
      </div>
    }
  `
})
export class GalleryComponent implements OnInit {
  images = signal<GalleryImage[]>([]);
  lightboxSrc = signal<string | null>(null);

  ngOnInit(): void {
    this.loadImages();
  }

  private loadImages(): void {
    const loadedImages: GalleryImage[] = [];
    let index = 1;

    const loadNext = () => {
      const img = new Image();
      img.src = `assets/images/gallery/${index}.jpg`;

      img.onload = () => {
        loadedImages.push({ src: img.src, loaded: true });
        this.images.set([...loadedImages]);
        index++;
        loadNext();
      };
    };

    loadNext();
  }

  openLightbox(src: string): void {
    this.lightboxSrc.set(src);
  }

  closeLightbox(): void {
    this.lightboxSrc.set(null);
  }
}
