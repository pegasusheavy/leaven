import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

import { routes } from './app.routes';
import { initializeIcons } from './icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: (library: FaIconLibrary) => () => initializeIcons(library),
      deps: [FaIconLibrary],
      multi: true,
    },
  ]
};
