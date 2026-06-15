(function () {
  const GISCUS_SESSION_KEY = 'giscus-session';
  const SESSION_TTL_MS = 5 * 60 * 1000; // matches DEFAULT_VALIDITY_PERIOD in lib/oauth/state.ts
  const script = document.currentScript as HTMLScriptElement;
  const giscusOrigin = new URL(script.src).origin;

  function formatError(message: string) {
    return `[giscus] An error occurred. Error message: "${message}".`;
  }

  function getMetaContent(property: string, og = false) {
    const ogSelector = og ? `meta[property='og:${property}'],` : '';
    const element = document.querySelector<HTMLMetaElement>(
      ogSelector + `meta[name='${property}']`,
    );

    return element ? element.content : '';
  }

  // `localStorage` access can throw in several real-world contexts:
  //   * iOS WKWebView with `dom.storage.enabled = false`.
  //   * Safari ITP without a prior user gesture (third-party iframe).
  //   * Brave strict fingerprinting shields.
  //   * Privacy-focused browsers that block storage in cross-site contexts.
  // Every call site must go through `safeStorage` so the widget keeps loading
  // and degrades gracefully to a session-less render instead of failing the
  // whole script.
  const safeStorage = {
    getItem(key: string): string | null {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn(
          `${formatError(e?.message || 'localStorage read failed.')} Falling back to a session-less render.`,
        );
        return null;
      }
    },
    setItem(key: string, value: string): boolean {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn(
          `${formatError(e?.message || 'localStorage write failed.')} Session will not persist.`,
        );
        return false;
      }
    },
    removeItem(key: string): void {
      try {
        localStorage.removeItem(key);
      } catch {
        // Best-effort cleanup; nothing actionable for the user.
      }
    },
  };

  // Parse a session value that was previously written by this script. Returns
  // `null` if the value is missing, empty, or not a non-empty string. Strips
  // surrounding whitespace, mirroring how some auth providers normalize tokens.
  function parseStoredSession(raw: string | null): string | null {
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    // Stored values are JSON strings; require a top-level string literal.
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'string' && parsed.length ? parsed : null;
    } catch {
      // Some legacy entries are bare strings (pre-PR-#XXXX). Accept those.
      return trimmed;
    }
  }

  // Set up session and clear the session param on load
  const url = new URL(location.href);
  let session = url.searchParams.get('giscus') || '';
  const sessionWrittenAt = Date.now();
  const rawSavedSession = safeStorage.getItem(GISCUS_SESSION_KEY);
  const savedSession = parseStoredSession(rawSavedSession);
  url.searchParams.delete('giscus');
  url.hash = '';
  const cleanedLocation = url.toString();

  if (session) {
    if (safeStorage.setItem(GISCUS_SESSION_KEY, JSON.stringify(session))) {
      history.replaceState(undefined, document.title, cleanedLocation);
    }
  } else if (savedSession) {
    session = savedSession;
  } else if (rawSavedSession !== null) {
    // Storage held a value that was not a usable session. Clear it so the
    // next page load starts from a clean slate.
    safeStorage.removeItem(GISCUS_SESSION_KEY);
  }

  const attributes = script.dataset;
  const params: Record<string, string> = {};

  params.origin = cleanedLocation;
  params.session = session as string;
  params.theme = attributes.theme as string;
  params.reactionsEnabled = attributes.reactionsEnabled || '1';
  params.emitMetadata = attributes.emitMetadata || '0';
  params.inputPosition = attributes.inputPosition || 'bottom';
  params.repo = attributes.repo as string;
  params.repoId = attributes.repoId as string;
  params.category = attributes.category || '';
  params.categoryId = attributes.categoryId as string;
  params.strict = attributes.strict || '0';
  params.description = getMetaContent('description', true);
  params.backLink = getMetaContent('giscus:backlink') || cleanedLocation;

  switch (attributes.mapping) {
    case 'url':
      params.term = cleanedLocation;
      break;
    case 'title':
      params.term = document.title;
      break;
    case 'og:title':
      params.term = getMetaContent('title', true);
      break;
    case 'specific':
      params.term = attributes.term as string;
      break;
    case 'number':
      params.number = attributes.term as string;
      break;
    case 'pathname':
    default:
      params.term =
        location.pathname.length < 2
          ? 'index'
          : location.pathname.substring(1).replace(/\.\w+$/, '');
      break;
  }

  // Check anchor of the existing container and append it to origin URL
  const existingContainer = document.querySelector('.giscus');
  const id = existingContainer && existingContainer.id;
  if (id) {
    params.origin = `${cleanedLocation}#${id}`;
  }

  // Set up iframe src and loading attribute
  const locale = attributes.lang ? `/${attributes.lang}` : '';
  const src = `${giscusOrigin}${locale}/widget?${new URLSearchParams(params)}`;
  const loading = attributes.loading === 'lazy' ? 'lazy' : undefined;

  // Set up iframe element
  const iframeElement = document.createElement('iframe');
  const iframeAttributes = {
    class: 'giscus-frame giscus-frame--loading',
    title: 'Comments',
    scrolling: 'no',
    allow: 'clipboard-write',
    src,
    loading,
  };
  Object.entries(iframeAttributes).forEach(
    ([key, value]) => value && iframeElement.setAttribute(key, value),
  );
  // Prevent white flash on load
  iframeElement.style.opacity = '0';
  iframeElement.addEventListener('load', () => {
    iframeElement.style.removeProperty('opacity');
    iframeElement.classList.remove('giscus-frame--loading');
  });

  // Link default style and prepend as <head>'s first child to make override possible.
  const style =
    (document.getElementById('giscus-css') as HTMLLinkElement) || document.createElement('link');
  style.id = 'giscus-css';
  style.rel = 'stylesheet';
  style.href = `${giscusOrigin}/default.css`;
  document.head.prepend(style);

  // Insert iframe element
  if (!existingContainer) {
    const iframeContainer = document.createElement('div');
    iframeContainer.setAttribute('class', 'giscus');
    iframeContainer.appendChild(iframeElement);

    script.insertAdjacentElement('afterend', iframeContainer);
  } else {
    while (existingContainer.firstChild) existingContainer.firstChild.remove();
    existingContainer.appendChild(iframeElement);
  }
  const suggestion = `Please consider reporting this error at https://github.com/giscus/giscus/issues/new.`;

  function signOut() {
    delete params.session;
    const src = `${giscusOrigin}${locale}/widget?${new URLSearchParams(params)}`;
    iframeElement.src = src; // Force reload
  }

  // Cross-tab session sync. If the user signs out (or the session is cleared
  // for any other reason) in another tab, mirror that here so the widget
  // doesn't keep using a now-invalid token. Wrapped in a feature check so the
  // script still loads in very old browsers where the `storage` event is
  // missing.
  if (typeof window !== 'undefined' && 'addEventListener' in window) {
    window.addEventListener('storage', (event) => {
      if (event.key !== GISCUS_SESSION_KEY) return;
      if (event.newValue !== null) return; // another tab wrote a session; nothing to do
      if (safeStorage.getItem(GISCUS_SESSION_KEY) === null) {
        signOut();
      }
    });
  }

  // Defensive TTL check. The OAuth `state` already expires server-side after
  // 5 minutes, but the local cached session can outlive it. If we observed the
  // session more than `SESSION_TTL_MS` ago, drop it to avoid emitting auth
  // headers against a token that the server will reject.
  if (session && Date.now() - sessionWrittenAt > SESSION_TTL_MS) {
    safeStorage.removeItem(GISCUS_SESSION_KEY);
    session = '';
  }

  // Listen to messages
  window.addEventListener('message', (event) => {
    if (event.origin !== giscusOrigin) return;

    const { data } = event;
    if (!(typeof data === 'object' && data.giscus)) return;

    if (data.giscus.resizeHeight) {
      iframeElement.style.height = `${data.giscus.resizeHeight}px`;
    }

    if (data.giscus.signOut) {
      safeStorage.removeItem(GISCUS_SESSION_KEY);
      console.log(`[giscus] User has logged out. Session has been cleared.`);
      signOut();
      return;
    }

    if (!data.giscus.error) return;

    const message: string = data.giscus.error;

    if (
      message.includes('Bad credentials') ||
      message.includes('Invalid state value') ||
      message.includes('State has expired')
    ) {
      // Might be because token is expired or other causes
      if (safeStorage.getItem(GISCUS_SESSION_KEY) !== null) {
        safeStorage.removeItem(GISCUS_SESSION_KEY);
        console.warn(`${formatError(message)} Session has been cleared.`);
        signOut();
      } else if (!savedSession) {
        console.error(`${formatError(message)} No session is stored initially. ${suggestion}`);
      }
    } else if (message.includes('Discussion not found')) {
      console.warn(
        `[giscus] ${message}. A new discussion will be created if a comment/reaction is submitted.`,
      );
    } else if (message.includes('API rate limit exceeded')) {
      console.warn(formatError(message));
    } else {
      console.error(`${formatError(message)} ${suggestion}`);
    }
  });
})();
