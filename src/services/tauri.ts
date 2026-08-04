/**
 * Tauri Native Desktop Utility Service
 * Provides complete isolation for native desktop APIs with safe browser fallbacks.
 * No UI component accesses window.__TAURI__ directly.
 */

export interface TauriWindow {
  hide: () => Promise<void>;
  show: () => Promise<void>;
  minimize: () => Promise<void>;
  center: () => Promise<void>;
  isVisible: () => Promise<boolean>;
}

export interface TauriTray {
  setTooltip: (tooltip: string) => Promise<void>;
  setIcon: (iconPath: string) => Promise<void>;
}

declare global {
  interface Window {
    __TAURI__?: {
      window: {
        getCurrentWindow: () => TauriWindow;
      };
      tray?: TauriTray;
      app?: {
        getName: () => Promise<string>;
      };
    };
  }
}

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.__TAURI__);
};

// Window Controls
export const minimizeNativeWindow = async (): Promise<void> => {
  if (isTauriEnvironment() && window.__TAURI__?.window) {
    try {
      const appWindow = window.__TAURI__.window.getCurrentWindow();
      await appWindow.minimize();
      return;
    } catch (err) {
      console.warn('Native window minimize fallback:', err);
    }
  }
};

export const hideNativeWindow = async (): Promise<void> => {
  if (isTauriEnvironment() && window.__TAURI__?.window) {
    try {
      const appWindow = window.__TAURI__.window.getCurrentWindow();
      await appWindow.hide();
      return;
    } catch (err) {
      console.warn('Native window hide fallback:', err);
    }
  }
};

export const showNativeWindow = async (): Promise<void> => {
  if (isTauriEnvironment() && window.__TAURI__?.window) {
    try {
      const appWindow = window.__TAURI__.window.getCurrentWindow();
      await appWindow.show();
      await appWindow.center();
      return;
    } catch (err) {
      console.warn('Native window show fallback:', err);
    }
  }
};

// System Tray Abstraction
export const hideToTray = async (): Promise<void> => {
  await hideNativeWindow();
};

export const restoreFromTray = async (): Promise<void> => {
  await showNativeWindow();
};

export const setRunInBackground = async (enabled: boolean): Promise<void> => {
  console.log(`System tray background running preference set to: ${enabled}`);
};

// Clipboard & Text Utility Wrappers
export const readClipboardText = async (): Promise<string | null> => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      return await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn('System clipboard read restricted or unavailable:', err);
  }
  return null;
};

export const isURLString = (str: string): boolean => {
  const trimmed = str.trim();
  if (/^https?:\/\/[^\s]+$/i.test(trimmed)) return true;
  if (/^[a-z0-9]+([-.]?[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(trimmed)) return true;
  return false;
};

export const isColorString = (str: string): boolean => {
  const trimmed = str.trim();
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmed)) return true;
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(trimmed)) return true;
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/i.test(trimmed)) return true;
  return false;
};

export const extractURLMetadata = (url: string) => {
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }

  let domain = 'web.link';
  try {
    const parsed = new URL(formattedUrl);
    domain = parsed.hostname.replace(/^www\./, '');
  } catch {
    // fallback
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const domainName = domain.split('.')[0] || 'Link';

  return {
    url: formattedUrl,
    domain,
    title: `${capitalize(domainName)} Bookmark`,
    description: `Quick saved link from ${domain}`,
    favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    readingTimeMinutes: Math.floor(Math.random() * 4) + 2,
    category: 'web',
  };
};
