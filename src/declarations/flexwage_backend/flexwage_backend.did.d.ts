import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BusinessProfile {
  'business_name' : string,
  'description' : [] | [string],
  'business_size' : [] | [string],
  'business_type' : string,
  'user_id' : UserId,
  'is_verified' : boolean,
  'address' : [] | [string],
}
export interface DIDDocument {
  'updated_at' : Time,
  'signature' : string,
  'ratings' : Array<RatingId>,
  'created_at' : Time,
  'total_shifts' : bigint,
  'worker_id' : UserId,
  'average_rating' : [] | [number],
  'skills_verified' : Array<string>,
  'work_history' : Array<WorkHistoryId>,
}
export interface Notification {
  'id' : string,
  'is_read' : boolean,
  'title' : string,
  'created_at' : Time,
  'user_id' : UserId,
  'notification_type' : NotificationType,
  'message' : string,
  'related_shift_id' : [] | [ShiftId],
}
export type NotificationType = { 'ShiftPosted' : null } |
  { 'PaymentProcessed' : null } |
  { 'ShiftCancelled' : null } |
  { 'ShiftClaimed' : null } |
  { 'ShiftApproved' : null } |
  { 'ShiftCompleted' : null } |
  { 'ShiftRejected' : null };
export interface Rating {
  'id' : RatingId,
  'business_id' : UserId,
  'role' : string,
  'business_name' : string,
  'created_at' : Time,
  'comment' : [] | [string],
  'date_worked' : string,
  'shift_id' : ShiftId,
  'worker_id' : UserId,
  'verification_hash' : string,
  'rating' : number,
}
export type RatingId = string;
export type Result_1 = { 'Ok' : UserProfile } |
  { 'Err' : string };
export type Result_10 = { 'Ok' : Array<Notification> } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : WorkerProfile } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : BusinessProfile } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : Shift } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : Array<Shift> } |
  { 'Err' : string };
export type Result_6 = { 'Ok' : DIDDocument } |
  { 'Err' : string };
export type Result_7 = { 'Ok' : Array<WorkHistory> } |
  { 'Err' : string };
export type Result_8 = { 'Ok' : Array<Rating> } |
  { 'Err' : string };
export type Result_9 = { 'Ok' : boolean } |
  { 'Err' : string };
export interface Shift {
  'id' : ShiftId,
  'status' : ShiftStatus,
  'updated_at' : Time,
  'pay_rate' : number,
  'business_id' : UserId,
  'date' : string,
  'role' : string,
  'is_urgent' : boolean,
  'description' : [] | [string],
  'created_at' : Time,
  'end_time' : string,
  'assigned_worker' : [] | [UserId],
  'start_time' : string,
  'requirements' : Array<string>,
  'location' : string,
  'applicants' : Array<UserId>,
}
export interface ShiftApplication {
  'status' : { 'Approved' : null } |
    { 'Rejected' : null } |
    { 'Pending' : null },
  'applied_at' : Time,
  'shift_id' : ShiftId,
  'message' : [] | [string],
  'worker_id' : UserId,
}
export type ShiftId = string;
export type ShiftStatus = { 'Claimed' : null } |
  { 'Open' : null } |
  { 'Approved' : null } |
  { 'Draft' : null } |
  { 'Cancelled' : null } |
  { 'InProgress' : null } |
  { 'Completed' : null };
export type Time = bigint;
export type UserId = string;
export interface UserProfile {
  'id' : UserId,
  'updated_at' : Time,
  'user_type' : UserType,
  'name' : string,
  'created_at' : Time,
  'email' : string,
  'did_document' : [] | [string],
  'phone' : [] | [string],
  'owner_principal' : Principal,
  'location' : string,
}
export type UserType = { 'Business' : null } |
  { 'Worker' : null };
export interface WorkHistory {
  'id' : WorkHistoryId,
  'pay_earned' : number,
  'business_id' : UserId,
  'role' : string,
  'hours_worked' : number,
  'business_name' : string,
  'date_worked' : string,
  'shift_id' : ShiftId,
  'worker_id' : UserId,
  'verification_hash' : string,
  'completed_at' : Time,
  'location' : string,
}
export type WorkHistoryId = string;
export interface WorkerProfile {
  'bio' : [] | [string],
  'total_shifts_completed' : bigint,
  'user_id' : UserId,
  'availability' : Array<string>,
  'is_verified' : boolean,
  'average_rating' : [] | [number],
  'experience_level' : string,
  'skills' : Array<string>,
}
export interface _SERVICE {
  'apply_to_shift' : ActorMethod<[ShiftId, [] | [string]], Result_9>,
  'approve_application' : ActorMethod<[ShiftId, UserId], Result_9>,
  'create_business_profile' : ActorMethod<[BusinessProfile], Result_3>,
  'create_notification' : ActorMethod<[Notification], Result_9>,
  'create_rating' : ActorMethod<[Rating], Result_9>,
  'create_shift' : ActorMethod<[Shift], Result_4>,
  'create_user_profile' : ActorMethod<[UserProfile], Result_1>,
  'create_work_history' : ActorMethod<[WorkHistory], Result_9>,
  'create_worker_profile' : ActorMethod<[WorkerProfile], Result_2>,
  'delete_shift' : ActorMethod<[ShiftId], Result_9>,
  'export_worker_did' : ActorMethod<[UserId], Result_6>,
  'get_available_shifts' : ActorMethod<[[] | [string]], Result_5>,
  'get_business_profile' : ActorMethod<[UserId], Result_3>,
  'get_caller_principal' : ActorMethod<[], Principal>,
  'get_shift' : ActorMethod<[ShiftId], Result_4>,
  'get_shift_applications' : ActorMethod<[ShiftId], Array<ShiftApplication>>,
  'get_shifts_by_business' : ActorMethod<[UserId], Result_5>,
  'get_user_notifications' : ActorMethod<[UserId], Result_10>,
  'get_user_profile' : ActorMethod<[Principal], Result_1>,
  'get_worker_did' : ActorMethod<[UserId], Result_6>,
  'get_worker_history' : ActorMethod<[UserId], Result_7>,
  'get_worker_profile' : ActorMethod<[UserId], Result_2>,
  'get_worker_ratings' : ActorMethod<[UserId], Result_8>,
  'health_check' : ActorMethod<[], boolean>,
  'mark_notification_read' : ActorMethod<[string], Result_9>,
  'reject_application' : ActorMethod<[ShiftId, UserId], Result_9>,
  'update_business_profile' : ActorMethod<[BusinessProfile], Result_3>,
  'update_shift' : ActorMethod<[ShiftId, Shift], Result_4>,
  'update_user_profile' : ActorMethod<[UserProfile], Result_1>,
  'update_worker_profile' : ActorMethod<[WorkerProfile], Result_2>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
