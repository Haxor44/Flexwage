import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

// Candid Interface Definition
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const UserType = IDL.Variant({
    'Worker': IDL.Null,
    'Business': IDL.Null,
  });

  const UserProfile = IDL.Record({
    'id': IDL.Text,
    'owner_principal': IDL.Principal,
    'user_type': UserType,
    'name': IDL.Text,
    'email': IDL.Text,
    'phone': IDL.Opt(IDL.Text),
    'location': IDL.Text,
    'created_at': IDL.Int,
    'updated_at': IDL.Int,
    'did_document': IDL.Opt(IDL.Text),
  });

  const WorkerProfile = IDL.Record({
    'user_id': IDL.Text,
    'skills': IDL.Vec(IDL.Text),
    'experience_level': IDL.Text,
    'availability': IDL.Vec(IDL.Text),
    'bio': IDL.Opt(IDL.Text),
    'total_shifts_completed': IDL.Nat64,
    'average_rating': IDL.Opt(IDL.Float32),
    'is_verified': IDL.Bool,
  });

  const BusinessProfile = IDL.Record({
    'user_id': IDL.Text,
    'business_name': IDL.Text,
    'business_type': IDL.Text,
    'business_size': IDL.Opt(IDL.Text),
    'address': IDL.Opt(IDL.Text),
    'description': IDL.Opt(IDL.Text),
    'is_verified': IDL.Bool,
  });

  const ShiftStatus = IDL.Variant({
    'Draft': IDL.Null,
    'Open': IDL.Null,
    'Claimed': IDL.Null,
    'Approved': IDL.Null,
    'InProgress': IDL.Null,
    'Completed': IDL.Null,
    'Cancelled': IDL.Null,
  });

  const Shift = IDL.Record({
    'id': IDL.Text,
    'business_id': IDL.Text,
    'role': IDL.Text,
    'date': IDL.Text,
    'start_time': IDL.Text,
    'end_time': IDL.Text,
    'pay_rate': IDL.Float32,
    'location': IDL.Text,
    'description': IDL.Opt(IDL.Text),
    'requirements': IDL.Vec(IDL.Text),
    'status': ShiftStatus,
    'assigned_worker': IDL.Opt(IDL.Text),
    'applicants': IDL.Vec(IDL.Text),
    'is_urgent': IDL.Bool,
    'created_at': IDL.Int,
    'updated_at': IDL.Int,
  });

  const WorkHistory = IDL.Record({
    'id': IDL.Text,
    'worker_id': IDL.Text,
    'business_id': IDL.Text,
    'shift_id': IDL.Text,
    'role': IDL.Text,
    'date_worked': IDL.Text,
    'hours_worked': IDL.Float32,
    'pay_earned': IDL.Float32,
    'business_name': IDL.Text,
    'location': IDL.Text,
    'completed_at': IDL.Int,
    'verification_hash': IDL.Text,
  });

  const Rating = IDL.Record({
    'id': IDL.Text,
    'worker_id': IDL.Text,
    'business_id': IDL.Text,
    'shift_id': IDL.Text,
    'rating': IDL.Nat8,
    'comment': IDL.Opt(IDL.Text),
    'business_name': IDL.Text,
    'role': IDL.Text,
    'date_worked': IDL.Text,
    'created_at': IDL.Int,
    'verification_hash': IDL.Text,
  });

  const DIDDocument = IDL.Record({
    'worker_id': IDL.Text,
    'work_history': IDL.Vec(IDL.Text),
    'ratings': IDL.Vec(IDL.Text),
    'total_shifts': IDL.Nat64,
    'average_rating': IDL.Opt(IDL.Float32),
    'skills_verified': IDL.Vec(IDL.Text),
    'created_at': IDL.Int,
    'updated_at': IDL.Int,
    'signature': IDL.Text,
  });

  const ApplicationStatus = IDL.Variant({
    'Pending': IDL.Null,
    'Approved': IDL.Null,
    'Rejected': IDL.Null,
  });

  const ShiftApplication = IDL.Record({
    'shift_id': IDL.Text,
    'worker_id': IDL.Text,
    'applied_at': IDL.Int,
    'message': IDL.Opt(IDL.Text),
    'status': ApplicationStatus,
  });

  const NotificationType = IDL.Variant({
    'ShiftPosted': IDL.Null,
    'ShiftClaimed': IDL.Null,
    'ShiftApproved': IDL.Null,
    'ShiftRejected': IDL.Null,
    'ShiftCompleted': IDL.Null,
    'ShiftCancelled': IDL.Null,
    'PaymentProcessed': IDL.Null,
  });

  const Notification = IDL.Record({
    'id': IDL.Text,
    'user_id': IDL.Text,
    'notification_type': NotificationType,
    'title': IDL.Text,
    'message': IDL.Text,
    'related_shift_id': IDL.Opt(IDL.Text),
    'is_read': IDL.Bool,
    'created_at': IDL.Int,
  });

  const Result_1 = IDL.Variant({ 'Ok': UserProfile, 'Err': IDL.Text });
  const Result_2 = IDL.Variant({ 'Ok': WorkerProfile, 'Err': IDL.Text });
  const Result_3 = IDL.Variant({ 'Ok': BusinessProfile, 'Err': IDL.Text });
  const Result_4 = IDL.Variant({ 'Ok': Shift, 'Err': IDL.Text });
  const Result_5 = IDL.Variant({ 'Ok': IDL.Vec(Shift), 'Err': IDL.Text });
  const Result_6 = IDL.Variant({ 'Ok': DIDDocument, 'Err': IDL.Text });
  const Result_7 = IDL.Variant({ 'Ok': IDL.Vec(WorkHistory), 'Err': IDL.Text });
  const Result_8 = IDL.Variant({ 'Ok': IDL.Vec(Rating), 'Err': IDL.Text });
  const Result_9 = IDL.Variant({ 'Ok': IDL.Bool, 'Err': IDL.Text });
  const Result_10 = IDL.Variant({ 'Ok': IDL.Vec(Notification), 'Err': IDL.Text });

  return IDL.Service({
    'create_user_profile': IDL.Func([UserProfile], [Result_1], []),
    'get_user_profile': IDL.Func([IDL.Principal], [Result_1], ['query']),
    'update_user_profile': IDL.Func([UserProfile], [Result_1], []),
    'create_worker_profile': IDL.Func([WorkerProfile], [Result_2], []),
    'get_worker_profile': IDL.Func([IDL.Text], [Result_2], ['query']),
    'update_worker_profile': IDL.Func([WorkerProfile], [Result_2], []),
    'create_business_profile': IDL.Func([BusinessProfile], [Result_3], []),
    'get_business_profile': IDL.Func([IDL.Text], [Result_3], ['query']),
    'update_business_profile': IDL.Func([BusinessProfile], [Result_3], []),
    'create_shift': IDL.Func([Shift], [Result_4], []),
    'get_shift': IDL.Func([IDL.Text], [Result_4], ['query']),
    'update_shift': IDL.Func([IDL.Text, Shift], [Result_4], []),
    'delete_shift': IDL.Func([IDL.Text], [Result_9], []),
    'get_shifts_by_business': IDL.Func([IDL.Text], [Result_5], ['query']),
    'get_available_shifts': IDL.Func([IDL.Opt(IDL.Text)], [Result_5], ['query']),
    'apply_to_shift': IDL.Func([IDL.Text, IDL.Opt(IDL.Text)], [Result_9], []),
    'get_shift_applications': IDL.Func([IDL.Text], [IDL.Vec(ShiftApplication)], ['query']),
    'approve_application': IDL.Func([IDL.Text, IDL.Text], [Result_9], []),
    'reject_application': IDL.Func([IDL.Text, IDL.Text], [Result_9], []),
    'create_work_history': IDL.Func([WorkHistory], [Result_9], []),
    'get_worker_history': IDL.Func([IDL.Text], [Result_7], ['query']),
    'create_rating': IDL.Func([Rating], [Result_9], []),
    'get_worker_ratings': IDL.Func([IDL.Text], [Result_8], ['query']),
    'get_worker_did': IDL.Func([IDL.Text], [Result_6], ['query']),
    'export_worker_did': IDL.Func([IDL.Text], [Result_6], ['query']),
    'create_notification': IDL.Func([Notification], [Result_9], []),
    'get_user_notifications': IDL.Func([IDL.Text], [Result_10], ['query']),
    'mark_notification_read': IDL.Func([IDL.Text], [Result_9], []),
    'get_caller_principal': IDL.Func([], [IDL.Principal], ['query']),
    'health_check': IDL.Func([], [IDL.Bool], ['query']),
  });
};

// TypeScript types
export interface UserProfile {
  id: string;
  owner_principal: Principal;
  user_type: { Worker: null } | { Business: null };
  name: string;
  email: string;
  phone?: string;
  location: string;
  created_at: bigint;
  updated_at: bigint;
  did_document?: string;
}

export interface WorkerProfile {
  user_id: string;
  skills: string[];
  experience_level: string;
  availability: string[];
  bio?: string;
  total_shifts_completed: bigint;
  average_rating?: number;
  is_verified: boolean;
}

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  business_type: string;
  business_size?: string;
  address?: string;
  description?: string;
  is_verified: boolean;
}

export interface Shift {
  id: string;
  business_id: string;
  role: string;
  date: string;
  start_time: string;
  end_time: string;
  pay_rate: number;
  location: string;
  description?: string;
  requirements: string[];
  status: ShiftStatus;
  assigned_worker?: string;
  applicants: string[];
  is_urgent: boolean;
  created_at: bigint;
  updated_at: bigint;
}

export type ShiftStatus = 
  | { Draft: null }
  | { Open: null }
  | { Claimed: null }
  | { Approved: null }
  | { InProgress: null }
  | { Completed: null }
  | { Cancelled: null };

export interface WorkHistory {
  id: string;
  worker_id: string;
  business_id: string;
  shift_id: string;
  role: string;
  date_worked: string;
  hours_worked: number;
  pay_earned: number;
  business_name: string;
  location: string;
  completed_at: bigint;
  verification_hash: string;
}

export interface Rating {
  id: string;
  worker_id: string;
  business_id: string;
  shift_id: string;
  rating: number;
  comment?: string;
  business_name: string;
  role: string;
  date_worked: string;
  created_at: bigint;
  verification_hash: string;
}

export interface DIDDocument {
  worker_id: string;
  work_history: string[];
  ratings: string[];
  total_shifts: bigint;
  average_rating?: number;
  skills_verified: string[];
  created_at: bigint;
  updated_at: bigint;
  signature: string;
}

// Configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

// Get canister ID from environment or use local development ID
const getCanisterId = () => {
  if (isDevelopment) {
    // Use the actual local canister ID from .dfx/local/canister_ids.json
    return process.env.CANISTER_ID_FLEXWAGE_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
  }
  return process.env.NEXT_PUBLIC_CANISTER_ID_FLEXWAGE_BACKEND;
};

const CANISTER_ID = getCanisterId();
const II_CANISTER_ID = 'uzt4z-lp777-77774-qaabq-cai';
// Use production Internet Identity to avoid local signature verification issues
const II_URL = 'https://identity.ic0.app';
const HOST = isDevelopment ? 'http://127.0.0.1:4943' : 'https://ic0.app';

// Debug configuration (only in browser)
if (typeof window !== 'undefined') {
  console.log('🔧 ICP Service Configuration:');
  console.log('  - Environment:', isDevelopment ? 'development' : 'production');
  console.log('  - Backend Canister ID:', CANISTER_ID);
  console.log('  - Internet Identity URL:', II_URL);
  console.log('  - Host:', HOST);
  console.log('  - Process env CANISTER_ID_FLEXWAGE_BACKEND:', process.env.CANISTER_ID_FLEXWAGE_BACKEND);
}

export class ICPService {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private identity: any = null;

  async init(): Promise<void> {
    console.log('🔄 Initializing ICP service...');
    this.authClient = await AuthClient.create({
      idleOptions: {
        disableIdle: true,
        disableDefaultIdleCallback: true,
      },
    });
    console.log('✅ AuthClient created');

    const isAuthenticated = await this.authClient.isAuthenticated();
    console.log('🔐 Authentication status:', isAuthenticated);
    
    if (isAuthenticated) {
      this.identity = this.authClient.getIdentity();
      console.log('👤 Identity obtained:', this.identity.getPrincipal().toString());
      await this.createActor();
      console.log('🎭 Actor created successfully');
    }
  }

  private async createActor(): Promise<void> {
    if (!this.identity) return;

    console.log('🎭 Creating actor with:', {
      host: HOST,
      canisterId: CANISTER_ID,
      isDevelopment
    });

    const agent = new HttpAgent({
      identity: this.identity,
      host: HOST,
    });

    if (isDevelopment) {
      console.log('🔑 Fetching root key for local development...');
      try {
        await agent.fetchRootKey();
        console.log('✅ Root key fetched successfully');
      } catch (error) {
        console.error('❌ Failed to fetch root key:', error);
        throw error;
      }
    }

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: CANISTER_ID,
    });
    
    console.log('✅ Actor created successfully');
  }

  async login(): Promise<boolean> {
    console.log('🔑 Starting login process...');
    
    try {
      if (!this.authClient) {
        console.log('⏳ AuthClient not initialized, initializing...');
        await this.init();
      }

      // Check if already authenticated
      const alreadyAuth = await this.authClient!.isAuthenticated();
      if (alreadyAuth) {
        console.log('✅ Already authenticated!');
        this.identity = this.authClient!.getIdentity();
        await this.createActor();
        return true;
      }

      console.log('🌐 Starting Internet Identity login...');
      console.log('🔗 Identity Provider URL:', II_URL);
      
      return new Promise((resolve) => {
        console.log('📞 Calling authClient.login()...');
        
        let resolved = false;
        const resolveOnce = (result: boolean) => {
          if (!resolved) {
            resolved = true;
            resolve(result);
          }
        };
        
        // Simplified login options to avoid ES module issues
        const loginOptions = {
          identityProvider: II_URL,
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
          onSuccess: async () => {
            console.log('✅ Internet Identity login successful!');
            
            try {
              this.identity = this.authClient!.getIdentity();
              console.log('👤 New identity obtained:', this.identity.getPrincipal().toString());
              
              await this.createActor();
              console.log('🎭 Actor created after login');
              
              // Verify authentication worked
              const isAuth = await this.authClient!.isAuthenticated();
              console.log('🔐 Post-login authentication status:', isAuth);
              
              resolveOnce(true);
            } catch (error) {
              console.error('❌ Error in login success handler:', error);
              resolveOnce(false);
            }
          },
          onError: (error: any) => {
            console.error('❌ Internet Identity login failed:', error);
            
            // Check if this is the ES module import error
            if (error && error.toString && error.toString().includes('import statement outside a module')) {
              console.warn('🔧 Detected ES module import error - this is a known issue with Internet Identity assets');
              console.log('💡 Suggestion: Try refreshing the page or clearing browser cache');
            }
            
            resolveOnce(false);
          },
        };
        
        try {
          console.log('🔌 Attempting login...');
          this.authClient!.login(loginOptions);
        } catch (error) {
          console.error('❌ Login call failed:', error);
          
          if (error && error.toString && error.toString().includes('import statement outside a module')) {
            console.warn('🔧 ES module import error caught during login call');
            console.log('💡 This is likely due to Internet Identity asset loading issues');
          }
          
          resolveOnce(false);
        }
      });
      
    } catch (error) {
      console.error('❌ Login process failed:', error);
      
      if (error && error.toString && error.toString().includes('import statement outside a module')) {
        console.warn('🔧 ES module import error in login process');
        console.log('💡 Try clearing browser cache and refreshing the page');
      }
      
      return false;
    }
  }
  
  private injectAssetFixer(): void {
    console.log('🔧 Injecting asset URL fixer for Internet Identity...');
    
    // Store the current open function to intercept popup windows
    const originalOpen = window.open;
    
    window.open = function(...args) {
      console.log('📝 Intercepting window.open call...', args[0]);
      
      // Call original open first
      const popup = originalOpen.apply(this, args as any);
      
      if (popup && args[0] && args[0].includes('canisterId=uzt4z-lp777-77774-qaabq-cai')) {
        console.log('🎯 Detected Internet Identity popup, will inject asset fixer...');
        
        // Give the popup a moment to load, then inject our fix
        setTimeout(() => {
          try {
            if (popup && !popup.closed) {
              console.log('🔌 Injecting asset URL fix script into popup...');
              
              const fixScript = `
                console.log('🔧 Asset URL fixer loaded!');
                
                // Function to fix asset URLs
                function fixAssetUrls() {
                  const canisterId = 'uzt4z-lp777-77774-qaabq-cai';
                  console.log('🔄 Fixing asset URLs for canister:', canisterId);
                  
                  // Fix existing script and link tags
                  const scripts = document.querySelectorAll('script[src^="/_app"]');
                  scripts.forEach(script => {
                    const currentSrc = script.src;
                    if (!currentSrc.includes('canisterId=')) {
                      const newSrc = currentSrc + '?canisterId=' + canisterId;
                      console.log('🔧 Fixing script:', currentSrc, '->', newSrc);
                      script.src = newSrc;
                    }
                  });
                  
                  const links = document.querySelectorAll('link[href^="/_app"]');
                  links.forEach(link => {
                    const currentHref = link.href;
                    if (!currentHref.includes('canisterId=')) {
                      const newHref = currentHref + '?canisterId=' + canisterId;
                      console.log('🔧 Fixing link:', currentHref, '->', newHref);
                      link.href = newHref;
                    }
                  });
                  
                  // Also fix modulepreload links
                  const modulePreloads = document.querySelectorAll('link[rel="modulepreload"][href^="/_app"]');
                  modulePreloads.forEach(link => {
                    const currentHref = link.href;
                    if (!currentHref.includes('canisterId=')) {
                      const newHref = currentHref + '?canisterId=' + canisterId;
                      console.log('🔧 Fixing modulepreload:', currentHref, '->', newHref);
                      link.href = newHref;
                    }
                  });
                }
                
                // Fix URLs immediately and also watch for new elements
                fixAssetUrls();
                
                // Watch for DOM changes and fix new elements
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                          const element = node as Element;
                          if ((element.tagName === 'SCRIPT' && element.getAttribute('src')?.startsWith('/_app')) ||
                              (element.tagName === 'LINK' && element.getAttribute('href')?.startsWith('/_app'))) {
                            console.log('🆕 Fixing newly added asset:', element);
                            fixAssetUrls();
                          }
                        }
                      });
                    }
                  });
                });
                
                observer.observe(document, { childList: true, subtree: true });
                console.log('👁️ Asset URL observer started');
              `;
              
              // Inject the script into the popup
              const scriptElement = popup.document.createElement('script');
              scriptElement.textContent = fixScript;
              popup.document.head.appendChild(scriptElement);
              
              console.log('✅ Asset URL fixer injected successfully!');
            }
          } catch (error) {
            console.warn('⚠️ Could not inject asset fixer into popup:', error);
          }
        }, 1000); // Wait 1 second for popup to load
      }
      
      return popup;
    };
    
    // Clean up the override after a reasonable time
    setTimeout(() => {
      window.open = originalOpen;
      console.log('🧽 Restored original window.open function');
    }, 60000); // Clean up after 60 seconds
  }

  private async loginWithAlternativeMethod(): Promise<boolean> {
    console.log('🔀 Using alternative login method...');
    
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve) => {
      // Try direct window redirect approach
      console.log('🪟 Attempting direct redirect to Internet Identity...');
      
      const redirectUrl = `${II_URL}#authorize`;
      console.log('🔗 Redirecting to:', redirectUrl);
      
      // Store the current URL so we can return after auth
      localStorage.setItem('pre_auth_url', window.location.href);
      
      this.authClient!.login({
        identityProvider: II_URL,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        windowOpenerFeatures: undefined, // This should force redirect
        onSuccess: async () => {
          console.log('✅ Alternative login successful!');
          this.identity = this.authClient!.getIdentity();
          console.log('👤 Identity obtained via alternative method:', this.identity.getPrincipal().toString());
          
          try {
            await this.createActor();
            console.log('🎭 Actor created after alternative login');
            
            const isAuth = await this.authClient!.isAuthenticated();
            console.log('🔐 Post-alternative authentication status:', isAuth);
            
            // Clear the stored URL
            localStorage.removeItem('pre_auth_url');
            
            resolve(true);
          } catch (error) {
            console.error('❌ Error creating actor after alternative login:', error);
            resolve(false);
          }
        },
        onError: (error) => {
          console.error('❌ Alternative login failed:', error);
          localStorage.removeItem('pre_auth_url');
          resolve(false);
        },
      });
    });
  }
  
  private async loginWithWindowRedirect(): Promise<boolean> {
    console.log('🌐 Using window redirect method for asset loading issues...');
    
    if (!this.authClient) {
      await this.init();
    }

    // For asset loading issues, we'll redirect the entire window to II
    console.log('🚀 Redirecting entire window to Internet Identity...');
    
    // Store the current URL and state
    localStorage.setItem('flexwage_pre_auth_url', window.location.href);
    localStorage.setItem('flexwage_auth_in_progress', 'true');
    
    // Redirect to Internet Identity with proper return URL
    const returnUrl = encodeURIComponent(window.location.origin);
    const iiRedirectUrl = `${II_URL}&returnTo=${returnUrl}#authorize`;
    
    console.log('🔗 Full window redirect to:', iiRedirectUrl);
    window.location.href = iiRedirectUrl;
    
    // This won't actually resolve since we're redirecting
    return new Promise(() => {});
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.identity = null;
      this.actor = null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      await this.init();
    }
    return this.authClient!.isAuthenticated();
  }

  getPrincipal(): Principal | null {
    return this.identity?.getPrincipal() || null;
  }

  // User Profile Methods
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'owner_principal' | 'created_at' | 'updated_at'>): Promise<UserProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const fullProfile: UserProfile = {
      ...profile,
      id: '',
      owner_principal: this.getPrincipal()!,
      created_at: BigInt(0),
      updated_at: BigInt(0),
    };

    const result = await this.actor.create_user_profile(fullProfile);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getUserProfile(principal?: Principal): Promise<UserProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const targetPrincipal = principal || this.getPrincipal()!;
    const result = await this.actor.get_user_profile(targetPrincipal);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.update_user_profile(profile);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Worker Profile Methods
  async createWorkerProfile(profile: WorkerProfile): Promise<WorkerProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.create_worker_profile(profile);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getWorkerProfile(userId: string): Promise<WorkerProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_worker_profile(userId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async updateWorkerProfile(profile: WorkerProfile): Promise<WorkerProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.update_worker_profile(profile);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Business Profile Methods
  async createBusinessProfile(profile: BusinessProfile): Promise<BusinessProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.create_business_profile(profile);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getBusinessProfile(userId: string): Promise<BusinessProfile> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_business_profile(userId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Shift Methods
  async createShift(shift: Omit<Shift, 'id' | 'created_at' | 'updated_at' | 'applicants'>): Promise<Shift> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const fullShift: Shift = {
      ...shift,
      id: '',
      applicants: [],
      created_at: BigInt(0),
      updated_at: BigInt(0),
    };

    const result = await this.actor.create_shift(fullShift);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getShift(shiftId: string): Promise<Shift> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_shift(shiftId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getAvailableShifts(locationFilter?: string): Promise<Shift[]> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_available_shifts([locationFilter]);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getShiftsByBusiness(businessId: string): Promise<Shift[]> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_shifts_by_business(businessId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async updateShift(shiftId: string, shift: Shift): Promise<Shift> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.update_shift(shiftId, shift);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async deleteShift(shiftId: string): Promise<boolean> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.delete_shift(shiftId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Shift Application Methods
  async applyToShift(shiftId: string, message?: string): Promise<boolean> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.apply_to_shift(shiftId, message ? [message] : []);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async approveApplication(shiftId: string, workerId: string): Promise<boolean> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.approve_application(shiftId, workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async rejectApplication(shiftId: string, workerId: string): Promise<boolean> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.reject_application(shiftId, workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // DID Methods
  async getWorkerDID(workerId: string): Promise<DIDDocument> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_worker_did(workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async exportWorkerDID(workerId: string): Promise<DIDDocument> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.export_worker_did(workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getWorkerHistory(workerId: string): Promise<WorkHistory[]> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_worker_history(workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async getWorkerRatings(workerId: string): Promise<Rating[]> {
    if (!this.actor) throw new Error('Not authenticated');
    
    const result = await this.actor.get_worker_ratings(workerId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Utility Methods
  async healthCheck(): Promise<boolean> {
    if (!this.actor) return false;
    
    try {
      return await this.actor.health_check();
    } catch {
      return false;
    }
  }

  // Test anonymous connection to backend
  async testAnonymousConnection(): Promise<boolean> {
    console.log('🧪 Testing anonymous connection to backend...');
    
    try {
      const agent = new HttpAgent({
        host: HOST,
      });

      if (isDevelopment) {
        console.log('🔑 Fetching root key for anonymous connection...');
        await agent.fetchRootKey();
      }

      const anonymousActor = Actor.createActor(idlFactory, {
        agent,
        canisterId: CANISTER_ID,
      });

      const result = await anonymousActor.health_check();
      console.log('✅ Anonymous health check result:', result);
      return result;
    } catch (error) {
      console.error('❌ Anonymous connection test failed:', error);
      return false;
    }
  }

  // Internet Identity Health Check
  async checkInternetIdentityHealth(): Promise<boolean> {
    try {
      const response = await fetch(II_URL);
      return response.ok;
    } catch (error) {
      console.error('❌ Internet Identity health check failed:', error);
      return false;
    }
  }

  // Test asset loading with canister ID
  async testAssetLoading(): Promise<boolean> {
    try {
      // Test a known asset with canister ID
      const testUrl = `http://127.0.0.1:4943/_app/immutable/bundle.5FJYIH91.js?canisterId=${II_CANISTER_ID}`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      console.log('🧪 Asset test result:', response.status, response.statusText);
      return response.ok;
    } catch (error) {
      console.error('❌ Asset loading test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const icpService = new ICPService();
