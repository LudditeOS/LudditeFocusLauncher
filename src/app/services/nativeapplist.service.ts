import { Injectable } from '@angular/core';
import { BaseappService } from './baseapp.service';
import { NativeApp } from '../models/nativeapp.interface';

@Injectable({
  providedIn: 'root',
})
export class NativeAppListService extends BaseappService<NativeApp> {
  protected get STORAGE_KEY(): string {
    return 'nativeAppList';
  }

  protected get API_URL(): string {
    return 'https://download.luddite-os.ch/api/nativeapps';
  }

  constructor() {
    super();
  }
}
