import { Injectable } from '@angular/core';
import { BaseappService } from './baseapp.service';
import { WebApp } from '../models/webapp.interface';

@Injectable({
  providedIn: 'root',
})
export class WebAppListService extends BaseappService<WebApp> {
  protected get STORAGE_KEY(): string {
    return 'webAppList';
  }

  protected get API_URL(): string {
    return 'https://download.luddite-os.ch/api/webapps';
  }

  constructor() {
    super();
  }
}
