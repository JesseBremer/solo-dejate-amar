import { Injectable, computed, signal } from '@angular/core';
import { Lang, TRANSLATIONS, Translations } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private langSignal = signal<Lang>(
    (localStorage.getItem('sda_lang') as Lang) ?? 'en'
  );

  readonly lang = this.langSignal.asReadonly();
  readonly t = computed<Translations>(() => TRANSLATIONS[this.langSignal()]);

  set(lang: Lang): void {
    this.langSignal.set(lang);
    localStorage.setItem('sda_lang', lang);
  }

  formatRelative(iso: string): string {
    const lang = this.langSignal();
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return lang === 'es' ? 'ahora mismo' : 'just now';
    if (diff < 60) return lang === 'es' ? `hace ${diff}m` : `${diff}m ago`;
    const h = Math.floor(diff / 60);
    if (h < 24) return lang === 'es' ? `hace ${h}h` : `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return lang === 'es' ? 'ayer' : 'yesterday';
    if (d < 7) return lang === 'es' ? `hace ${d} días` : `${d} days ago`;
    return new Date(iso).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
  }
}
