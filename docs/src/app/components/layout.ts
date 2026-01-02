import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBolt,
  faBoxOpen,
  faGlobe,
  faTowerBroadcast,
  faLayerGroup,
  faBowlFood,
  faPuzzlePiece,
  faBell,
  faUtensils,
  faCakeCandles,
  faFire,
  faServer,
  faBars,
  faXmark,
  faBreadSlice,
  faWheatAwn,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

interface NavItem {
  label: string;
  path: string;
  icon: IconDefinition;
}

interface NavSection {
  title: string;
  icon: IconDefinition;
  items: NavItem[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FontAwesomeModule],
  template: `
    <div class="min-h-screen flex">
      <!-- Skip to main content link for accessibility -->
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-amber-950 focus:rounded-lg focus:font-semibold">
        Skip to main content
      </a>

      <!-- Sidebar - Bakery Menu Board -->
      <aside
        class="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-amber-950/95 via-orange-950/90 to-amber-950/95 backdrop-blur-xl border-r border-amber-800/30 z-40 flex flex-col transition-transform duration-300"
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        [class.lg:translate-x-0]="true"
        role="navigation"
        aria-label="Main navigation"
      >
        <!-- Logo - Bakery Sign -->
        <div class="p-6 border-b border-amber-800/30">
          <a routerLink="/" class="flex items-center gap-4 group" aria-label="Leaven - Back to homepage">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-400 to-yellow-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform glow-honey" aria-hidden="true">
              <fa-icon [icon]="faBreadSlice" class="text-amber-900 text-xl"></fa-icon>
            </div>
            <div>
              <h1 class="text-xl font-bold text-amber-100" style="font-family: 'Fraunces', serif;">Leaven</h1>
              <p class="text-xs text-amber-500/60">Artisan GraphQL</p>
            </div>
          </a>
        </div>

        <!-- Navigation - Menu Board -->
        <nav class="flex-1 overflow-y-auto p-4 space-y-6" aria-label="Documentation sections">
          @for (section of navSections; track section.title) {
            <div role="group" [attr.aria-labelledby]="'nav-' + section.title.toLowerCase().replace(' ', '-')">
              <h2 
                [id]="'nav-' + section.title.toLowerCase().replace(' ', '-')"
                class="flex items-center gap-2 text-xs font-semibold text-amber-600/60 uppercase tracking-wider mb-3 px-3"
              >
                <fa-icon [icon]="section.icon" class="text-amber-600/40"></fa-icon>
                <span>{{ section.title }}</span>
              </h2>
              <ul class="space-y-1" role="list">
                @for (item of section.items; track item.path) {
                  <li>
                    <a
                      [routerLink]="item.path"
                      routerLinkActive="active"
                      [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                      class="nav-link"
                      [attr.aria-label]="item.label"
                    >
                      <fa-icon [icon]="item.icon" class="text-lg w-5 text-center"></fa-icon>
                      <span>{{ item.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
        </nav>

        <!-- Footer - Bakery Hours -->
        <div class="p-4 border-t border-amber-800/30 bg-amber-950/50">
          <div class="flex items-center justify-between text-xs text-amber-600/50 mb-3">
            <span class="flex items-center gap-1">
              <fa-icon [icon]="faBreadSlice" class="text-amber-600/40"></fa-icon>
              v0.1.0
            </span>
            <span class="text-amber-700/40">Fresh Daily</span>
          </div>
          <a
            href="https://github.com/pegasusheavy/leaven-graphql"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-amber-900/30 border border-amber-800/30 text-amber-400/70 hover:text-amber-300 hover:bg-amber-900/50 transition-colors text-sm"
            aria-label="View Leaven source code on GitHub"
          >
            <fa-icon [icon]="faGithub"></fa-icon>
            Recipe Book (GitHub)
          </a>
        </div>
      </aside>

      <!-- Mobile Menu Button - Bakery Bell -->
      <button
        class="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-br from-amber-900/90 to-orange-900/80 border border-amber-700/40 text-amber-300 hover:text-amber-100 transition-colors shadow-lg"
        (click)="toggleSidebar()"
        [attr.aria-expanded]="sidebarOpen()"
        aria-controls="sidebar"
        aria-label="Toggle navigation menu"
      >
        <fa-icon [icon]="sidebarOpen() ? faXmark : faBars" class="text-xl"></fa-icon>
      </button>

      <!-- Main Content - Kitchen -->
      <main id="main-content" class="flex-1 lg:ml-72" role="main">
        <router-outlet />
      </main>

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div
          class="lg:hidden fixed inset-0 bg-amber-950/70 backdrop-blur-sm z-30"
          (click)="closeSidebar()"
          aria-hidden="true"
        ></div>
      }
    </div>
  `,
})
export class LayoutComponent {
  // Icons
  protected readonly faBreadSlice = faBreadSlice;
  protected readonly faGithub = faGithub;
  protected readonly faBars = faBars;
  protected readonly faXmark = faXmark;

  protected readonly sidebarOpen = signal(false);

  protected readonly navSections: NavSection[] = [
    {
      title: 'Getting Started',
      icon: faWheatAwn,
      items: [
        { label: 'Quick Start', path: '/quick-start', icon: faBolt },
        { label: 'Installation', path: '/installation', icon: faBoxOpen },
      ],
    },
    {
      title: 'Core Recipes',
      icon: faLayerGroup,
      items: [
        { label: 'Executor', path: '/executor', icon: faFire },
        { label: 'Schema', path: '/schema', icon: faLayerGroup },
        { label: 'Context', path: '/context', icon: faBowlFood },
        { label: 'Plugins', path: '/plugins', icon: faPuzzlePiece },
        { label: 'Errors', path: '/errors', icon: faBell },
      ],
    },
    {
      title: 'Bakery Services',
      icon: faUtensils,
      items: [
        { label: 'HTTP Server', path: '/http', icon: faGlobe },
        { label: 'WebSockets', path: '/websockets', icon: faTowerBroadcast },
        { label: 'NestJS', path: '/nestjs', icon: faServer },
        { label: 'Playground', path: '/playground', icon: faCakeCandles },
      ],
    },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
