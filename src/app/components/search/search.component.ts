import {Component, OnInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {
  InAppBrowser,
  DefaultWebViewOptions
} from '@capacitor/inappbrowser';
import {Router} from '@angular/router';
import {AppListService} from '../../services/applist.service';
import {App} from '../../models/app.interface';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {AppLauncher} from '@capacitor/app-launcher';

interface AppWithSanitizedIcon extends App {
  safeIcon: SafeHtml;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeAnimation', [
      state('hidden', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      transition('hidden => visible', [
        animate('300ms ease-out')
      ]),
      transition('visible => hidden', [
        animate('200ms ease-in')
      ])
    ])
  ],
  template: `
    <div class="relative mx-auto max-w-2xl px-4 transform transition-all duration-300 ease-in-out"
         [ngClass]="isFocused ? 'pt-16' : 'pt-[10vh]'">

      <!-- Neumorphic Search Input Container -->
      <div
        class="relative rounded-xl bg-slate-100 shadow-neumorphic transition-all duration-300 ease-in-out"
        [ngClass]="{'shadow-neumorphic-inset': isFocused}"
        #searchContainer
      >
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterApps()"
          (focus)="onFocus()"
          (blur)="handleBlur()"
          #searchInput
          class="w-full rounded-xl bg-transparent px-11 py-4 text-base text-slate-700 transition-all placeholder:text-slate-400 focus:outline-none"
          placeholder="Search apps..."
        >
        <!-- Search Icon -->
        <svg
          class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>

        <!-- Clear Button -->
        <button
          *ngIf="searchTerm.trim()"
          (click)="clearSearch()"
          class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:text-slate-700 hover:shadow-neumorphic-sm active:shadow-neumorphic-inset-sm focus:outline-none transition-all duration-200"
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Results Panel -->
      <div
        *ngIf="isFocused || searchTerm.trim()"
        [@fadeAnimation]="showResults ? 'visible' : 'hidden'"
        class="mt-8 rounded-xl bg-slate-100 shadow-neumorphic p-3"
        #resultsPanel
      >
        <ul class="max-h-72 overflow-y-auto text-sm custom-scrollbar">
          <li
            *ngFor="let app of filteredSanitizedAppList; trackBy: trackById"
            (mousedown)="handleItemClick(app)"
            class="group flex cursor-pointer select-none items-center rounded-lg px-4 py-3 mb-2 text-slate-700 transition-all duration-200 ease-in-out hover:bg-slate-200 hover:shadow-neumorphic-inset-sm"
          >
            <div
              class="size-8 flex-none rounded-lg bg-slate-100 shadow-neumorphic-sm p-1.5 text-slate-600 flex items-center justify-center"
              [innerHTML]="app.safeIcon"
            ></div>
            <span class="ml-4 flex-auto font-medium truncate">{{ app.name }}</span>
            <span class="ml-3 text-slate-500 truncate url-display">{{ app.url }}</span>
          </li>

          <li
            *ngIf="filteredSanitizedAppList.length === 0 && searchTerm.trim()"
            class="p-4 text-center text-slate-500 rounded-lg bg-slate-200 shadow-neumorphic-inset-sm"
          >
            No apps found for "{{ searchTerm }}"
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    /* Custom Neumorphic Shadows */
    .shadow-neumorphic {
      box-shadow:
        6px 6px 12px rgba(166, 180, 200, 0.7),
        -6px -6px 12px rgba(255, 255, 255, 0.8);
    }

    .shadow-neumorphic-inset {
      box-shadow:
        inset 4px 4px 8px rgba(166, 180, 200, 0.7),
        inset -4px -4px 8px rgba(255, 255, 255, 0.8);
    }

    .shadow-neumorphic-sm {
      box-shadow:
        3px 3px 6px rgba(166, 180, 200, 0.6),
        -3px -3px 6px rgba(255, 255, 255, 0.7);
    }

    .shadow-neumorphic-inset-sm {
      box-shadow:
        inset 2px 2px 4px rgba(166, 180, 200, 0.6),
        inset -2px -2px 4px rgba(255, 255, 255, 0.7);
    }

    /* Custom Scrollbar */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.5) rgba(241, 245, 249, 0.5);
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
      display: block;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(241, 245, 249, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 116, 139, 0.6);
    }

    /* URL display with priority to app name */
    .url-display {
      flex-shrink: 1;
      flex-grow: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
      max-width: 40%;
    }

    @media (max-width: 768px) {
      .url-display {
        max-width: 30%;
      }
    }

    @media (max-width: 640px) {
      .url-display {
        display: none;
      }
    }
  `]
})
export class SearchComponent implements OnInit {
  searchTerm = '';
  sanitizedAppList: AppWithSanitizedIcon[] = [];
  filteredSanitizedAppList: AppWithSanitizedIcon[] = [];
  isFocused = false;
  itemClicked = false;
  showResults = false; // Control visibility separately for animation

  @ViewChild('searchContainer', {static: false}) searchContainer!: ElementRef;
  @ViewChild('resultsPanel', {static: false}) resultsPanel!: ElementRef;
  @ViewChild('searchInput', {static: false}) searchInput!: ElementRef;

  constructor(
    private appService: AppListService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (!this.isFocused) return;

    const clickedInside =
      this.searchContainer?.nativeElement.contains(event.target) ||
      this.resultsPanel?.nativeElement?.contains(event.target);

    if (!clickedInside && !this.itemClicked) {
      this.isFocused = false;
      this.showResults = false;
    }
  }

  ngOnInit() {
    this.showResults = this.searchTerm.trim().length > 0;

    this.appService.apps$.subscribe({
      next: (appList) => {
        const settingsApp: AppWithSanitizedIcon = {
          _id: 'settings',
          type: 'settings',
          url: '/settings',
          name: 'LudditeSettings',
          timeLimit: '0',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>`,
          safeIcon: this.sanitizer.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>`)
        };

        const sanitizedApps = appList.map(app => ({
          ...app,
          safeIcon: this.sanitizer.bypassSecurityTrustHtml(app.icon)
        }));

        this.sanitizedAppList = [settingsApp, ...sanitizedApps].sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        );
        this.filteredSanitizedAppList = [...this.sanitizedAppList];
      },
      error: (error) => console.error('Error subscribing to Apps:', error)
    });

    this.appService.syncAll().subscribe({
      next: (apps) => {
        console.log('Successfully synced apps with server');
      },
      error: (error) => console.error('Error syncing apps with server:', error)
    });
  }

  trackById(index: number, app: AppWithSanitizedIcon): string {
    return app._id;
  }

  onFocus() {
    this.isFocused = true;
    setTimeout(() => {
      this.showResults = true;
    }, 10);
  }

  handleBlur() {
    this.itemClicked = false;
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterApps();
    this.searchInput.nativeElement.focus();
  }

  filterApps() {
    if (!this.searchTerm.trim()) {
      this.filteredSanitizedAppList = this.sanitizedAppList;
      return;
    }

    const search = this.searchTerm.toLowerCase();
    this.filteredSanitizedAppList = this.sanitizedAppList.filter(app =>
      app.name.toLowerCase().includes(search) ||
      app.url.toLowerCase().includes(search)
    );
  }

  async handleItemClick(app: AppWithSanitizedIcon) {
    this.itemClicked = true;
    try {
      if (app.type === 'settings') {
        this.openSettings();
      } else {
        await this.openApp(app);
      }
    } catch (error) {
      console.error('Error in handleItemClick:', error);
    }
  }

  openSettings() {
    this.itemClicked = true;
    this.isFocused = false;
    this.showResults = false;
    this.router.navigate(['/settings']);
  }

  async openApp(app: AppWithSanitizedIcon) {
    if (app.type == "webApp") {
      this.isFocused = false;
      this.showResults = false;

      try {
        await InAppBrowser.openInWebView({
          url: app.url,
          options: DefaultWebViewOptions
        });
      } catch (error) {
        console.error('Error opening webView:', error);
      }
    }
    if (app.type == "nativeApp") {
      try {
        AppLauncher.openUrl({url: app.url})
          .then(() => {})
      } catch (error) {
        console.error('Error calling openUrl:', error);
      }
    }
  }
}
