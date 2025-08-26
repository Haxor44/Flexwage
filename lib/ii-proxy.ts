// Internet Identity Proxy Service
// This handles the asset loading issues by ensuring all II assets include the canister ID

export class IIProxyService {
  private readonly canisterId = 'uzt4z-lp777-77774-qaabq-cai';
  private readonly baseUrl = `http://127.0.0.1:4943/?canisterId=${this.canisterId}`;
  
  // Create a properly formatted Internet Identity URL with asset fixes
  getProxiedIIUrl(): string {
    return this.baseUrl;
  }

  // Inject asset URL fixes into the current window
  injectAssetFixes(): void {
    console.log('🔧 Injecting Internet Identity asset URL fixes...');
    
    // Override the fetch function to add canister ID to II asset requests
    const originalFetch = window.fetch;
    window.fetch = async (input, init?) => {
      let url = typeof input === 'string' ? input : input.url;
      
      // If this is an II asset request without canister ID, add it
      if (url.includes('127.0.0.1:4943/_app/') && !url.includes('canisterId=')) {
        url = `${url}?canisterId=${this.canisterId}`;
        console.log('🔧 Fixed II asset URL:', url);
        
        if (typeof input === 'string') {
          input = url;
        } else {
          input = new Request(url, input);
        }
      }
      
      return originalFetch.call(window, input, init);
    };

    // Also fix dynamic imports
    const originalImport = window.eval('import');
    if (originalImport) {
      window.eval(`
        const originalImport = window.import || ((url) => import(url));
        window.import = (url) => {
          if (url.includes('127.0.0.1:4943/_app/') && !url.includes('canisterId=')) {
            url = url + '?canisterId=${this.canisterId}';
            console.log('🔧 Fixed II import URL:', url);
          }
          return originalImport(url);
        };
      `);
    }

    // Fix existing script and link elements
    this.fixExistingAssets();
    
    // Watch for new assets being added
    this.watchForNewAssets();
  }

  private fixExistingAssets(): void {
    console.log('🔍 Scanning for existing II assets to fix...');
    
    // Fix script tags
    document.querySelectorAll('script[src*="127.0.0.1:4943/_app/"]').forEach(script => {
      const currentSrc = script.getAttribute('src')!;
      if (!currentSrc.includes('canisterId=')) {
        const newSrc = `${currentSrc}?canisterId=${this.canisterId}`;
        console.log('🔧 Fixing script:', currentSrc, '->', newSrc);
        script.setAttribute('src', newSrc);
      }
    });

    // Fix link tags
    document.querySelectorAll('link[href*="127.0.0.1:4943/_app/"]').forEach(link => {
      const currentHref = link.getAttribute('href')!;
      if (!currentHref.includes('canisterId=')) {
        const newHref = `${currentHref}?canisterId=${this.canisterId}`;
        console.log('🔧 Fixing link:', currentHref, '->', newHref);
        link.setAttribute('href', newHref);
      }
    });
  }

  private watchForNewAssets(): void {
    console.log('👁️ Starting asset watcher...');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              
              // Check if it's a script or link that needs fixing
              if (element.tagName === 'SCRIPT') {
                const src = element.getAttribute('src');
                if (src && src.includes('127.0.0.1:4943/_app/') && !src.includes('canisterId=')) {
                  const newSrc = `${src}?canisterId=${this.canisterId}`;
                  console.log('🆕 Fixing new script:', src, '->', newSrc);
                  element.setAttribute('src', newSrc);
                }
              } else if (element.tagName === 'LINK') {
                const href = element.getAttribute('href');
                if (href && href.includes('127.0.0.1:4943/_app/') && !href.includes('canisterId=')) {
                  const newHref = `${href}?canisterId=${this.canisterId}`;
                  console.log('🆕 Fixing new link:', href, '->', newHref);
                  element.setAttribute('href', newHref);
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document, { childList: true, subtree: true });
  }

  // Clean up overrides
  cleanup(): void {
    console.log('🧽 Cleaning up II proxy service...');
    // Note: In a real implementation, we'd restore original fetch and import
    // For now, we'll leave them in place as they're beneficial
  }
}

// Export singleton instance
export const iiProxyService = new IIProxyService();
