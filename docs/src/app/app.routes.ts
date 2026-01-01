import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout';

export const routes: Routes = [
  // Homepage without layout
  {
    path: '',
    loadComponent: () => import('./pages/home').then(m => m.HomeComponent),
    title: 'Leaven - High-Performance GraphQL for Bun'
  },
  // Documentation pages with layout
  {
    path: '',
    component: LayoutComponent,
    children: [
      // Getting Started
      {
        path: 'quick-start',
        loadComponent: () => import('./pages/quick-start').then(m => m.QuickStartComponent),
        title: 'Quick Start | Leaven Documentation'
      },
      {
        path: 'installation',
        loadComponent: () => import('./pages/installation').then(m => m.InstallationComponent),
        title: 'Installation | Leaven Documentation'
      },
      // Core Concepts
      {
        path: 'executor',
        loadComponent: () => import('./pages/executor').then(m => m.ExecutorComponent),
        title: 'Executor | Leaven Documentation'
      },
      {
        path: 'schema',
        loadComponent: () => import('./pages/schema').then(m => m.SchemaComponent),
        title: 'Schema Building | Leaven Documentation'
      },
      {
        path: 'context',
        loadComponent: () => import('./pages/context').then(m => m.ContextComponent),
        title: 'Request Context | Leaven Documentation'
      },
      {
        path: 'plugins',
        loadComponent: () => import('./pages/plugins').then(m => m.PluginsComponent),
        title: 'Plugin System | Leaven Documentation'
      },
      {
        path: 'errors',
        loadComponent: () => import('./pages/errors').then(m => m.ErrorsComponent),
        title: 'Error Handling | Leaven Documentation'
      },
      // Integrations
      {
        path: 'http',
        loadComponent: () => import('./pages/http').then(m => m.HttpComponent),
        title: 'HTTP Server | Leaven Documentation'
      },
      {
        path: 'websockets',
        loadComponent: () => import('./pages/websockets').then(m => m.WebsocketsComponent),
        title: 'WebSocket Subscriptions | Leaven Documentation'
      },
      {
        path: 'nestjs',
        loadComponent: () => import('./pages/nestjs').then(m => m.NestjsComponent),
        title: 'NestJS Integration | Leaven Documentation'
      },
      {
        path: 'playground',
        loadComponent: () => import('./pages/playground').then(m => m.PlaygroundComponent),
        title: 'GraphQL Playground | Leaven Documentation'
      },
      // Catch-all redirect to quick-start
      {
        path: '**',
        redirectTo: 'quick-start'
      }
    ],
  },
];
