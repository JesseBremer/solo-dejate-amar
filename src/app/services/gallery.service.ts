import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { GalleryImage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private supabase = inject(SupabaseService);
  private readonly BUCKET_NAME = 'gallery';

  private imagesSignal = signal<GalleryImage[]>([]);
  readonly images = this.imagesSignal.asReadonly();

  async loadAll(): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading gallery images:', error);
      return;
    }

    this.imagesSignal.set(data ?? []);
  }

  getPublicUrl(storagePath: string): string {
    const { data } = this.supabase.client.storage.from(this.BUCKET_NAME).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  async upload(file: File): Promise<string | null> {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await this.supabase.client.storage.from(this.BUCKET_NAME).upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    return fileName;
  }

  async create(storagePath: string, caption?: string, journalEntryId?: string): Promise<GalleryImage | null> {
    const currentImages = this.imagesSignal();
    const maxSortOrder = currentImages.reduce((max, img) => Math.max(max, img.sort_order), -1);

    const { data, error } = await this.supabase.client
      .from('gallery_images')
      .insert({
        storage_path: storagePath,
        caption: caption ?? null,
        sort_order: maxSortOrder + 1,
        journal_entry_id: journalEntryId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery image record:', error);
      return null;
    }

    this.imagesSignal.update((images) => [...images, data]);
    return data;
  }

  async update(id: string, updates: Partial<Omit<GalleryImage, 'id' | 'created_at'>>): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('gallery_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gallery image:', error);
      return;
    }

    this.imagesSignal.update((images) => images.map((img) => (img.id === id ? data : img)));
  }

  async delete(id: string): Promise<void> {
    const image = this.imagesSignal().find((img) => img.id === id);
    if (!image) return;

    const { error: deleteStorageError } = await this.supabase.client.storage
      .from(this.BUCKET_NAME)
      .remove([image.storage_path]);

    if (deleteStorageError) {
      console.error('Error deleting file from storage:', deleteStorageError);
    }

    const { error } = await this.supabase.client.from('gallery_images').delete().eq('id', id);

    if (error) {
      console.error('Error deleting gallery image record:', error);
      return;
    }

    this.imagesSignal.update((images) => images.filter((img) => img.id !== id));
  }

  async reorder(images: GalleryImage[]): Promise<void> {
    const updates = images.map((image, index) => ({
      id: image.id,
      sort_order: index,
    }));

    for (const update of updates) {
      await this.supabase.client.from('gallery_images').update({ sort_order: update.sort_order }).eq('id', update.id);
    }

    this.imagesSignal.set(images);
  }
}
