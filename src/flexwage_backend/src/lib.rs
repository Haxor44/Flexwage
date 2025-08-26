use candid::{CandidType, Deserialize, Principal};
use ic_cdk::{api, query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::borrow::Cow;
use std::cell::RefCell;

// Type aliases
type Memory = VirtualMemory<DefaultMemoryImpl>;
type UserId = String;
type ShiftId = String;
type WorkHistoryId = String;
type RatingId = String;

// User Types
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum UserType {
    Worker,
    Business,
}

// User Profile
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub id: UserId,
    pub owner_principal: Principal,
    pub user_type: UserType,
    pub name: String,
    pub email: String,
    pub phone: Option<String>,
    pub location: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub did_document: Option<String>,
}

// Worker Profile
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WorkerProfile {
    pub user_id: UserId,
    pub skills: Vec<String>,
    pub experience_level: String,
    pub availability: Vec<String>,
    pub bio: Option<String>,
    pub total_shifts_completed: u64,
    pub average_rating: Option<f32>,
    pub is_verified: bool,
}

// Business Profile
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BusinessProfile {
    pub user_id: UserId,
    pub business_name: String,
    pub business_type: String,
    pub business_size: Option<String>,
    pub address: Option<String>,
    pub description: Option<String>,
    pub is_verified: bool,
}

// Shift Status
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum ShiftStatus {
    Draft,
    Open,
    Claimed,
    Approved,
    InProgress,
    Completed,
    Cancelled,
}

// Shift
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Shift {
    pub id: ShiftId,
    pub business_id: UserId,
    pub role: String,
    pub date: String,
    pub start_time: String,
    pub end_time: String,
    pub pay_rate: f32,
    pub location: String,
    pub description: Option<String>,
    pub requirements: Vec<String>,
    pub status: ShiftStatus,
    pub assigned_worker: Option<UserId>,
    pub applicants: Vec<UserId>,
    pub is_urgent: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

// Work History Entry
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WorkHistory {
    pub id: WorkHistoryId,
    pub worker_id: UserId,
    pub business_id: UserId,
    pub shift_id: ShiftId,
    pub role: String,
    pub date_worked: String,
    pub hours_worked: f32,
    pub pay_earned: f32,
    pub business_name: String,
    pub location: String,
    pub completed_at: i64,
    pub verification_hash: String,
}

// Rating Entry
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Rating {
    pub id: RatingId,
    pub worker_id: UserId,
    pub business_id: UserId,
    pub shift_id: ShiftId,
    pub rating: u8,
    pub comment: Option<String>,
    pub business_name: String,
    pub role: String,
    pub date_worked: String,
    pub created_at: i64,
    pub verification_hash: String,
}

// DID Document
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct DIDDocument {
    pub worker_id: UserId,
    pub work_history: Vec<WorkHistoryId>,
    pub ratings: Vec<RatingId>,
    pub total_shifts: u64,
    pub average_rating: Option<f32>,
    pub skills_verified: Vec<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub signature: String,
}

// Shift Application
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShiftApplication {
    pub shift_id: ShiftId,
    pub worker_id: UserId,
    pub applied_at: i64,
    pub message: Option<String>,
    pub status: ApplicationStatus,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
}

// Notification Types
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum NotificationType {
    ShiftPosted,
    ShiftClaimed,
    ShiftApproved,
    ShiftRejected,
    ShiftCompleted,
    ShiftCancelled,
    PaymentProcessed,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Notification {
    pub id: String,
    pub user_id: UserId,
    pub notification_type: NotificationType,
    pub title: String,
    pub message: String,
    pub related_shift_id: Option<ShiftId>,
    pub is_read: bool,
    pub created_at: i64,
}

// Storable trait implementations for stable structures
impl ic_stable_structures::Storable for UserProfile {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for WorkerProfile {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for BusinessProfile {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for Shift {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for WorkHistory {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for Rating {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(&self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for DIDDocument {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 4096,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for ShiftApplication {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 512,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

impl ic_stable_structures::Storable for Notification {
    const BOUND: ic_stable_structures::storable::Bound = ic_stable_structures::storable::Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };
    
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(candid::encode_one(self).unwrap())
    }
    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }
}

// Memory Manager
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static USER_PROFILES: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    
    static PRINCIPAL_TO_USERID: RefCell<StableBTreeMap<Principal, UserId, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
    
    static WORKER_PROFILES: RefCell<StableBTreeMap<UserId, WorkerProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
    
    static BUSINESS_PROFILES: RefCell<StableBTreeMap<UserId, BusinessProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );
    
    static SHIFTS: RefCell<StableBTreeMap<ShiftId, Shift, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );
    
    static WORK_HISTORY: RefCell<StableBTreeMap<WorkHistoryId, WorkHistory, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        )
    );
    
    static RATINGS: RefCell<StableBTreeMap<RatingId, Rating, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6)))
        )
    );
    
    static DID_DOCUMENTS: RefCell<StableBTreeMap<UserId, DIDDocument, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7)))
        )
    );
    
    static APPLICATIONS: RefCell<StableBTreeMap<String, ShiftApplication, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(8)))
        )
    );
    
    static NOTIFICATIONS: RefCell<StableBTreeMap<String, Notification, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(9)))
        )
    );
}

// Helper functions
fn get_current_time() -> i64 {
    api::time() as i64 / 1_000_000 // Convert to milliseconds
}

fn generate_id() -> String {
    // Generate ID using timestamp and caller principal for uniqueness
    format!("{}_{}", api::time(), api::caller().to_text().chars().take(8).collect::<String>())
}

fn generate_verification_hash(data: &str) -> String {
    // Simple hash generation - in production, use a proper cryptographic hash
    format!("{:x}", data.len() as u64 * api::time())
}

fn calculate_average_rating(ratings: &[Rating]) -> Option<f32> {
    if ratings.is_empty() {
        return None;
    }
    let sum: u32 = ratings.iter().map(|r| r.rating as u32).sum();
    Some(sum as f32 / ratings.len() as f32)
}

// User Management Functions
#[update]
fn create_user_profile(mut profile: UserProfile) -> Result<UserProfile, String> {
    let caller = api::caller();
    
    // Check if user already exists
    if USER_PROFILES.with(|profiles| profiles.borrow().contains_key(&caller)) {
        return Err("User profile already exists".to_string());
    }
    
    let user_id = generate_id();
    profile.id = user_id.clone();
    profile.owner_principal = caller;
    profile.created_at = get_current_time();
    profile.updated_at = get_current_time();
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(caller, profile.clone())
    });
    
    PRINCIPAL_TO_USERID.with(|mapping| {
        mapping.borrow_mut().insert(caller, user_id)
    });
    
    Ok(profile)
}

#[query]
fn get_user_profile(principal: Principal) -> Result<UserProfile, String> {
    USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&principal)
            .ok_or_else(|| "User profile not found".to_string())
    })
}

#[update]
fn update_user_profile(mut profile: UserProfile) -> Result<UserProfile, String> {
    let caller = api::caller();
    
    // Verify caller owns this profile
    if profile.owner_principal != caller {
        return Err("Unauthorized: Cannot update another user's profile".to_string());
    }
    
    profile.updated_at = get_current_time();
    
    USER_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(caller, profile.clone())
    });
    
    Ok(profile)
}

// Worker Profile Functions
#[update]
fn create_worker_profile(profile: WorkerProfile) -> Result<WorkerProfile, String> {
    let caller = api::caller();
    
    // Verify user exists and is a worker
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.user_type != UserType::Worker {
        return Err("User is not registered as a worker".to_string());
    }
    
    if profile.user_id != user_profile.id {
        return Err("User ID mismatch".to_string());
    }
    
    WORKER_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(profile.user_id.clone(), profile.clone())
    });
    
    // Initialize empty DID document
    let did_doc = DIDDocument {
        worker_id: profile.user_id.clone(),
        work_history: Vec::new(),
        ratings: Vec::new(),
        total_shifts: 0,
        average_rating: None,
        skills_verified: profile.skills.clone(),
        created_at: get_current_time(),
        updated_at: get_current_time(),
        signature: generate_verification_hash(&format!("did_{}", profile.user_id)),
    };
    
    DID_DOCUMENTS.with(|docs| {
        docs.borrow_mut().insert(profile.user_id.clone(), did_doc)
    });
    
    Ok(profile)
}

#[query]
fn get_worker_profile(user_id: UserId) -> Result<WorkerProfile, String> {
    WORKER_PROFILES.with(|profiles| {
        profiles.borrow().get(&user_id)
            .ok_or_else(|| "Worker profile not found".to_string())
    })
}

#[update]
fn update_worker_profile(profile: WorkerProfile) -> Result<WorkerProfile, String> {
    let caller = api::caller();
    
    // Verify caller owns this profile
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if profile.user_id != user_profile.id {
        return Err("Unauthorized: Cannot update another user's profile".to_string());
    }
    
    WORKER_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(profile.user_id.clone(), profile.clone())
    });
    
    Ok(profile)
}

// Business Profile Functions
#[update]
fn create_business_profile(profile: BusinessProfile) -> Result<BusinessProfile, String> {
    let caller = api::caller();
    
    // Verify user exists and is a business
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.user_type != UserType::Business {
        return Err("User is not registered as a business".to_string());
    }
    
    if profile.user_id != user_profile.id {
        return Err("User ID mismatch".to_string());
    }
    
    BUSINESS_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(profile.user_id.clone(), profile.clone())
    });
    
    Ok(profile)
}

#[query]
fn get_business_profile(user_id: UserId) -> Result<BusinessProfile, String> {
    BUSINESS_PROFILES.with(|profiles| {
        profiles.borrow().get(&user_id)
            .ok_or_else(|| "Business profile not found".to_string())
    })
}

#[update]
fn update_business_profile(profile: BusinessProfile) -> Result<BusinessProfile, String> {
    let caller = api::caller();
    
    // Verify caller owns this profile
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if profile.user_id != user_profile.id {
        return Err("Unauthorized: Cannot update another user's profile".to_string());
    }
    
    BUSINESS_PROFILES.with(|profiles| {
        profiles.borrow_mut().insert(profile.user_id.clone(), profile.clone())
    });
    
    Ok(profile)
}

// Shift Management Functions
#[update]
fn create_shift(mut shift: Shift) -> Result<Shift, String> {
    let caller = api::caller();
    
    // Verify caller is a business
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.user_type != UserType::Business {
        return Err("Only businesses can create shifts".to_string());
    }
    
    if shift.business_id != user_profile.id {
        return Err("Business ID mismatch".to_string());
    }
    
    let shift_id = generate_id();
    shift.id = shift_id.clone();
    shift.created_at = get_current_time();
    shift.updated_at = get_current_time();
    shift.applicants = Vec::new();
    
    SHIFTS.with(|shifts| {
        shifts.borrow_mut().insert(shift_id, shift.clone())
    });
    
    Ok(shift)
}

#[query]
fn get_shift(shift_id: ShiftId) -> Result<Shift, String> {
    SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })
}

#[update]
fn update_shift(shift_id: ShiftId, mut shift: Shift) -> Result<Shift, String> {
    let caller = api::caller();
    
    // Get existing shift
    let existing_shift = SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })?;
    
    // Verify caller owns this shift
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if existing_shift.business_id != user_profile.id {
        return Err("Unauthorized: Cannot update another business's shift".to_string());
    }
    
    shift.id = shift_id.clone();
    shift.updated_at = get_current_time();
    
    SHIFTS.with(|shifts| {
        shifts.borrow_mut().insert(shift_id, shift.clone())
    });
    
    Ok(shift)
}

#[update]
fn delete_shift(shift_id: ShiftId) -> Result<bool, String> {
    let caller = api::caller();
    
    // Get existing shift
    let existing_shift = SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })?;
    
    // Verify caller owns this shift
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if existing_shift.business_id != user_profile.id {
        return Err("Unauthorized: Cannot delete another business's shift".to_string());
    }
    
    SHIFTS.with(|shifts| {
        shifts.borrow_mut().remove(&shift_id)
    });
    
    Ok(true)
}

#[query]
fn get_shifts_by_business(business_id: UserId) -> Result<Vec<Shift>, String> {
    let shifts: Vec<Shift> = SHIFTS.with(|shifts| {
        shifts.borrow().iter()
            .filter(|(_, shift)| shift.business_id == business_id)
            .map(|(_, shift)| shift)
            .collect()
    });
    
    Ok(shifts)
}

#[query]
fn get_available_shifts(location_filter: Option<String>) -> Result<Vec<Shift>, String> {
    let shifts: Vec<Shift> = SHIFTS.with(|shifts| {
        shifts.borrow().iter()
            .filter(|(_, shift)| {
                shift.status == ShiftStatus::Open && 
                location_filter.as_ref().map_or(true, |loc| shift.location.contains(loc))
            })
            .map(|(_, shift)| shift)
            .collect()
    });
    
    Ok(shifts)
}

// Shift Application Functions
#[update]
fn apply_to_shift(shift_id: ShiftId, message: Option<String>) -> Result<bool, String> {
    let caller = api::caller();
    
    // Verify caller is a worker
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.user_type != UserType::Worker {
        return Err("Only workers can apply to shifts".to_string());
    }
    
    // Get shift and verify it's open
    let mut shift = SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })?;
    
    if shift.status != ShiftStatus::Open {
        return Err("Shift is not open for applications".to_string());
    }
    
    // Check if worker already applied
    if shift.applicants.contains(&user_profile.id) {
        return Err("Already applied to this shift".to_string());
    }
    
    // Add application
    let application = ShiftApplication {
        shift_id: shift_id.clone(),
        worker_id: user_profile.id.clone(),
        applied_at: get_current_time(),
        message,
        status: ApplicationStatus::Pending,
    };
    
    let app_key = format!("{}_{}", shift_id, user_profile.id);
    APPLICATIONS.with(|apps| {
        apps.borrow_mut().insert(app_key, application)
    });
    
    // Update shift with new applicant
    shift.applicants.push(user_profile.id);
    shift.updated_at = get_current_time();
    
    SHIFTS.with(|shifts| {
        shifts.borrow_mut().insert(shift_id, shift)
    });
    
    Ok(true)
}

#[query]
fn get_shift_applications(shift_id: ShiftId) -> Vec<ShiftApplication> {
    APPLICATIONS.with(|apps| {
        apps.borrow().iter()
            .filter(|(key, _)| key.starts_with(&shift_id))
            .map(|(_, app)| app)
            .collect()
    })
}

#[update]
fn approve_application(shift_id: ShiftId, worker_id: UserId) -> Result<bool, String> {
    let caller = api::caller();
    
    // Verify caller owns the shift
    let mut shift = SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })?;
    
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if shift.business_id != user_profile.id {
        return Err("Unauthorized: Cannot approve applications for another business's shift".to_string());
    }
    
    // Update application status
    let app_key = format!("{}_{}", shift_id, worker_id);
    APPLICATIONS.with(|apps| {
        if let Some(mut app) = apps.borrow_mut().get(&app_key) {
            app.status = ApplicationStatus::Approved;
            apps.borrow_mut().insert(app_key, app);
        }
    });
    
    // Update shift
    shift.assigned_worker = Some(worker_id);
    shift.status = ShiftStatus::Approved;
    shift.updated_at = get_current_time();
    
    SHIFTS.with(|shifts| {
        shifts.borrow_mut().insert(shift_id, shift)
    });
    
    Ok(true)
}

#[update]
fn reject_application(shift_id: ShiftId, worker_id: UserId) -> Result<bool, String> {
    let caller = api::caller();
    
    // Verify caller owns the shift
    let shift = SHIFTS.with(|shifts| {
        shifts.borrow().get(&shift_id)
            .ok_or_else(|| "Shift not found".to_string())
    })?;
    
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if shift.business_id != user_profile.id {
        return Err("Unauthorized: Cannot reject applications for another business's shift".to_string());
    }
    
    // Update application status
    let app_key = format!("{}_{}", shift_id, worker_id);
    APPLICATIONS.with(|apps| {
        if let Some(mut app) = apps.borrow_mut().get(&app_key) {
            app.status = ApplicationStatus::Rejected;
            apps.borrow_mut().insert(app_key, app);
        }
    });
    
    Ok(true)
}

// Work History & DID Functions
#[update]
fn create_work_history(work_history: WorkHistory) -> Result<bool, String> {
    let caller = api::caller();
    
    // Verify caller is the business who created the shift
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.id != work_history.business_id {
        return Err("Unauthorized: Only the business can create work history".to_string());
    }
    
    WORK_HISTORY.with(|history| {
        history.borrow_mut().insert(work_history.id.clone(), work_history.clone())
    });
    
    // Update worker's DID document
    DID_DOCUMENTS.with(|docs| {
        if let Some(mut did_doc) = docs.borrow_mut().get(&work_history.worker_id) {
            did_doc.work_history.push(work_history.id.clone());
            did_doc.total_shifts += 1;
            did_doc.updated_at = get_current_time();
            docs.borrow_mut().insert(work_history.worker_id.clone(), did_doc);
        }
    });
    
    Ok(true)
}

#[query]
fn get_worker_history(worker_id: UserId) -> Result<Vec<WorkHistory>, String> {
    let history: Vec<WorkHistory> = WORK_HISTORY.with(|history| {
        history.borrow().iter()
            .filter(|(_, entry)| entry.worker_id == worker_id)
            .map(|(_, entry)| entry)
            .collect()
    });
    
    Ok(history)
}

#[update]
fn create_rating(rating: Rating) -> Result<bool, String> {
    let caller = api::caller();
    
    // Verify caller is the business who created the shift
    let user_profile = USER_PROFILES.with(|profiles| {
        profiles.borrow().get(&caller)
            .ok_or_else(|| "User profile not found".to_string())
    })?;
    
    if user_profile.id != rating.business_id {
        return Err("Unauthorized: Only the business can create ratings".to_string());
    }
    
    RATINGS.with(|ratings| {
        ratings.borrow_mut().insert(rating.id.clone(), rating.clone())
    });
    
    // Update worker's DID document and average rating
    DID_DOCUMENTS.with(|docs| {
        if let Some(mut did_doc) = docs.borrow_mut().get(&rating.worker_id) {
            did_doc.ratings.push(rating.id.clone());
            
            // Recalculate average rating
            let all_ratings: Vec<Rating> = RATINGS.with(|ratings| {
                ratings.borrow().iter()
                    .filter(|(_, r)| r.worker_id == rating.worker_id)
                    .map(|(_, r)| r)
                    .collect()
            });
            
            did_doc.average_rating = calculate_average_rating(&all_ratings);
            did_doc.updated_at = get_current_time();
            docs.borrow_mut().insert(rating.worker_id.clone(), did_doc);
        }
    });
    
    // Update worker profile with new rating
    WORKER_PROFILES.with(|profiles| {
        if let Some(mut profile) = profiles.borrow_mut().get(&rating.worker_id) {
            let all_ratings: Vec<Rating> = RATINGS.with(|ratings| {
                ratings.borrow().iter()
                    .filter(|(_, r)| r.worker_id == rating.worker_id)
                    .map(|(_, r)| r)
                    .collect()
            });
            profile.average_rating = calculate_average_rating(&all_ratings);
            profiles.borrow_mut().insert(rating.worker_id.clone(), profile);
        }
    });
    
    Ok(true)
}

#[query]
fn get_worker_ratings(worker_id: UserId) -> Result<Vec<Rating>, String> {
    let ratings: Vec<Rating> = RATINGS.with(|ratings| {
        ratings.borrow().iter()
            .filter(|(_, rating)| rating.worker_id == worker_id)
            .map(|(_, rating)| rating)
            .collect()
    });
    
    Ok(ratings)
}

#[query]
fn get_worker_did(worker_id: UserId) -> Result<DIDDocument, String> {
    DID_DOCUMENTS.with(|docs| {
        docs.borrow().get(&worker_id)
            .ok_or_else(|| "DID document not found".to_string())
    })
}

#[query]
fn export_worker_did(worker_id: UserId) -> Result<DIDDocument, String> {
    // Same as get_worker_did but intended for portability
    get_worker_did(worker_id)
}

// Notification Functions
#[update]
fn create_notification(notification: Notification) -> Result<bool, String> {
    NOTIFICATIONS.with(|notifications| {
        notifications.borrow_mut().insert(notification.id.clone(), notification)
    });
    Ok(true)
}

#[query]
fn get_user_notifications(user_id: UserId) -> Result<Vec<Notification>, String> {
    let notifications: Vec<Notification> = NOTIFICATIONS.with(|notifications| {
        notifications.borrow().iter()
            .filter(|(_, notif)| notif.user_id == user_id)
            .map(|(_, notif)| notif)
            .collect()
    });
    
    Ok(notifications)
}

#[update]
fn mark_notification_read(notification_id: String) -> Result<bool, String> {
    NOTIFICATIONS.with(|notifications| {
        if let Some(mut notif) = notifications.borrow_mut().get(&notification_id) {
            notif.is_read = true;
            notifications.borrow_mut().insert(notification_id, notif);
            Ok(true)
        } else {
            Err("Notification not found".to_string())
        }
    })
}

// Utility Functions
#[query]
fn get_caller_principal() -> Principal {
    api::caller()
}

#[query]
fn health_check() -> bool {
    true
}

// Canister initialization
#[ic_cdk::init]
fn init() {
    // Canister initialized
}
