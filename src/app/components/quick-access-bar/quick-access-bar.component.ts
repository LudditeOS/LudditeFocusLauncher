import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLauncher } from '@capacitor/app-launcher';
import { NgOptimizedImage } from '@angular/common';
import { NativeAppListService } from '../../services/nativeapplist.service';
import { NativeApp } from '../../models/nativeapp.interface';
import { DomSanitizer } from '@angular/platform-browser';

interface DisplayApp {
  _id: string;
  name: string;
  url: string;
  icon: string;
  type: string;
}

@Component({
  selector: 'app-quick-access-bar',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="fixed bottom-12 left-0 right-0 z-20">
      <div class="relative mx-auto max-full px-4">
        <div class="flex justify-center gap-8">
          <div
            *ngFor="let app of displayApps"
            (click)="openApp(app)"
            class="size-16 flex-shrink-0 flex items-center justify-center rounded-2xl transition-transform active:scale-95 cursor-pointer mx-4"
          >
            <img
              [ngSrc]="getCustomIconPath(app.name)"
              width="72"
              height="72"
              alt="{{app.name}}"
              class="size-16 rounded-2xl opacity-90 filter brightness-90 contrast-90"
            />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QuickAccessBarComponent implements OnInit {
  // Component logic remains unchanged
  appNames = ['Phone', 'Messaging', 'WhatsApp', 'Camera'];
  displayApps: DisplayApp[] = [];

  constructor(
    private nativeAppService: NativeAppListService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadNativeApps();
  }

  loadNativeApps() {
    this.nativeAppService.apps$.subscribe({
      next: (apps) => {
        const filteredApps = apps
          .filter(app => this.shouldDisplayApp(app.name))
          .map(app => this.convertToDisplayApp(app))
          .sort((a, b) => {
            return this.appNames.indexOf(a.name) - this.appNames.indexOf(b.name);
          });

        this.displayApps = filteredApps;
      },
      error: (error) => console.error('Error loading native apps:', error)
    });

    this.nativeAppService.syncWithServer().subscribe();
  }

  shouldDisplayApp(name: string): boolean {
    return this.appNames.some(targetName =>
      name.toLowerCase().includes(targetName.toLowerCase())
    );
  }

  convertToDisplayApp(app: NativeApp): DisplayApp {
    return {
      _id: app._id,
      name: app.name,
      url: app.uri,
      icon: app.icon,
      type: 'nativeApp'
    };
  }

  getCustomIconPath(name: string): string {
    const iconMap: Record<string, string> = {
      'Phone': '/assets/images/Phone.png',
      'Messaging': '/assets/images/Messages.png',
      'WhatsApp': '/assets/images/Whatsapp.png',
      'Camera': '/assets/images/Camera.png',
    };

    return iconMap[name] || '';
  }

  async openApp(app: DisplayApp) {
    try {
      AppLauncher.openUrl({ url: app.url })
        .then(() => {
          console.log(`Successfully opened ${app.name}`);
        })
        .catch((error) => {
          console.error(`Error opening ${app.name}:`, error);
        });
    } catch (error) {
      console.error(`Error calling openUrl for ${app.name}:`, error);
    }
  }
}
