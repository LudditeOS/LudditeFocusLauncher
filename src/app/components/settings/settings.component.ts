import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppListService } from '../../services/applist.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-white p-6">
      <div class="max-w-md mx-auto mb-8 pt-6">
        <div class="flex items-center mb-6">
          <button
            (click)="goBack()"
            class="p-2 mr-4 rounded-full text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 class="text-xl font-bold text-gray-900">Luddite Settings</h1>
        </div>
      </div>

      <div
        class="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 class="text-lg font-semibold mb-4 text-gray-900">Sync App Data</h2>
        <p class="text-sm text-gray-600 mb-4">
          Sync all application data with the server to get the latest available
          apps and updates.
        </p>

        <button
          (click)="syncAllData()"
          class="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          [disabled]="isSyncing"
        >
          <span *ngIf="isSyncing" class="mr-2">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
          {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
        </button>

        <div
          *ngIf="syncSuccess"
          class="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 mr-2 text-green-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>App data successfully synced!</p>
          </div>
        </div>

        <div
          *ngIf="syncError"
          class="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800"
        >
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 mr-2 text-red-500"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p>{{ syncErrorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  isSyncing = false;
  syncSuccess = false;
  syncError = false;
  syncErrorMessage = '';

  constructor(private router: Router, private appListService: AppListService) {}

  goBack() {
    this.router.navigate(['']);
  }

  syncAllData() {
    this.isSyncing = true;
    this.syncSuccess = false;
    this.syncError = false;

    this.appListService.syncAll().subscribe({
      next: () => {
        this.isSyncing = false;
        this.syncSuccess = true;
        setTimeout(() => {
          this.syncSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error syncing apps:', error);
        this.isSyncing = false;
        this.syncError = true;
        this.syncErrorMessage = 'Failed to sync data. Please try again later.';
      },
    });
  }
}
