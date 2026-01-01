/**
 * FontAwesome Icon Library Configuration
 * 
 * This file configures all FontAwesome icons used in the docs website.
 * Import only the icons you need to keep bundle size minimal.
 */

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

// Solid icons
import {
  faBolt,
  faBook,
  faBookOpen,
  faBreadSlice,
  faChevronRight,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faCode,
  faCog,
  faCopy,
  faCubesStacked,
  faDownload,
  faExclamationTriangle,
  faFire,
  faFlask,
  faGear,
  faGlobe,
  faHouse,
  faInfoCircle,
  faLightbulb,
  faLink,
  faList,
  faMagnifyingGlass,
  faMoon,
  faPlay,
  faPlug,
  faPuzzlePiece,
  faRocket,
  faServer,
  faShieldHalved,
  faStar,
  faSun,
  faTerminal,
  faTowerBroadcast,
  faUtensils,
  faWandMagicSparkles,
  faWheatAwn,
  faXmark,
  faBars,
  faArrowRight,
  faCheck,
  faBoxOpen,
  faCakeCandles,
  faMugHot,
  faHeart,
  faSeedling,
  faCookieBite,
  faHotdog,
  faBowlFood,
  faKitchenSet,
  faBell,
  faLayerGroup,
  faDiagramProject,
} from '@fortawesome/free-solid-svg-icons';

// Brand icons
import {
  faGithub,
  faNpm,
  faTwitter,
  faDiscord,
} from '@fortawesome/free-brands-svg-icons';

// Regular icons
import {
  faFile,
  faFolder,
  faCircle,
  faCopy as faCopyRegular,
  faLightbulb as faLightbulbRegular,
} from '@fortawesome/free-regular-svg-icons';

/**
 * Initialize the FontAwesome icon library with all needed icons
 */
export function initializeIcons(library: FaIconLibrary): void {
  // Add solid icons
  library.addIcons(
    faBolt,
    faBook,
    faBookOpen,
    faBreadSlice,
    faChevronRight,
    faCircleCheck,
    faCircleXmark,
    faClock,
    faCode,
    faCog,
    faCopy,
    faCubesStacked,
    faDownload,
    faExclamationTriangle,
    faFire,
    faFlask,
    faGear,
    faGlobe,
    faHouse,
    faInfoCircle,
    faLightbulb,
    faLink,
    faList,
    faMagnifyingGlass,
    faMoon,
    faPlay,
    faPlug,
    faPuzzlePiece,
    faRocket,
    faServer,
    faShieldHalved,
    faStar,
    faSun,
    faTerminal,
    faTowerBroadcast,
    faUtensils,
    faWandMagicSparkles,
    faWheatAwn,
    faXmark,
    faBars,
    faArrowRight,
    faCheck,
    faBoxOpen,
    faCakeCandles,
    faMugHot,
    faHeart,
    faSeedling,
    faCookieBite,
    faHotdog,
    faBowlFood,
    faKitchenSet,
    faBell,
    faLayerGroup,
    faDiagramProject,
  );

  // Add brand icons
  library.addIcons(
    faGithub,
    faNpm,
    faTwitter,
    faDiscord,
  );

  // Add regular icons
  library.addIcons(
    faFile,
    faFolder,
    faCircle,
    faCopyRegular,
    faLightbulbRegular,
  );
}

// Re-export commonly used icons for direct import
export {
  faBolt,
  faBook,
  faBookOpen,
  faBreadSlice,
  faChevronRight,
  faCircleCheck,
  faCode,
  faCopy,
  faFire,
  faGear,
  faGithub,
  faGlobe,
  faHouse,
  faPlug,
  faPuzzlePiece,
  faRocket,
  faServer,
  faTowerBroadcast,
  faWheatAwn,
  faBars,
  faXmark,
  faArrowRight,
  faCheck,
  faCakeCandles,
  faMugHot,
  faHeart,
  faSeedling,
  faCookieBite,
  faKitchenSet,
  faBell,
  faLayerGroup,
};
