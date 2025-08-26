export const idlFactory = ({ IDL }) => {
  const ShiftId = IDL.Text;
  const Result_9 = IDL.Variant({ 'Ok' : IDL.Bool, 'Err' : IDL.Text });
  const UserId = IDL.Text;
  const BusinessProfile = IDL.Record({
    'business_name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'business_size' : IDL.Opt(IDL.Text),
    'business_type' : IDL.Text,
    'user_id' : UserId,
    'is_verified' : IDL.Bool,
    'address' : IDL.Opt(IDL.Text),
  });
  const Result_3 = IDL.Variant({ 'Ok' : BusinessProfile, 'Err' : IDL.Text });
  const Time = IDL.Int;
  const NotificationType = IDL.Variant({
    'ShiftPosted' : IDL.Null,
    'PaymentProcessed' : IDL.Null,
    'ShiftCancelled' : IDL.Null,
    'ShiftClaimed' : IDL.Null,
    'ShiftApproved' : IDL.Null,
    'ShiftCompleted' : IDL.Null,
    'ShiftRejected' : IDL.Null,
  });
  const Notification = IDL.Record({
    'id' : IDL.Text,
    'is_read' : IDL.Bool,
    'title' : IDL.Text,
    'created_at' : Time,
    'user_id' : UserId,
    'notification_type' : NotificationType,
    'message' : IDL.Text,
    'related_shift_id' : IDL.Opt(ShiftId),
  });
  const RatingId = IDL.Text;
  const Rating = IDL.Record({
    'id' : RatingId,
    'business_id' : UserId,
    'role' : IDL.Text,
    'business_name' : IDL.Text,
    'created_at' : Time,
    'comment' : IDL.Opt(IDL.Text),
    'date_worked' : IDL.Text,
    'shift_id' : ShiftId,
    'worker_id' : UserId,
    'verification_hash' : IDL.Text,
    'rating' : IDL.Nat8,
  });
  const ShiftStatus = IDL.Variant({
    'Claimed' : IDL.Null,
    'Open' : IDL.Null,
    'Approved' : IDL.Null,
    'Draft' : IDL.Null,
    'Cancelled' : IDL.Null,
    'InProgress' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Shift = IDL.Record({
    'id' : ShiftId,
    'status' : ShiftStatus,
    'updated_at' : Time,
    'pay_rate' : IDL.Float32,
    'business_id' : UserId,
    'date' : IDL.Text,
    'role' : IDL.Text,
    'is_urgent' : IDL.Bool,
    'description' : IDL.Opt(IDL.Text),
    'created_at' : Time,
    'end_time' : IDL.Text,
    'assigned_worker' : IDL.Opt(UserId),
    'start_time' : IDL.Text,
    'requirements' : IDL.Vec(IDL.Text),
    'location' : IDL.Text,
    'applicants' : IDL.Vec(UserId),
  });
  const Result_4 = IDL.Variant({ 'Ok' : Shift, 'Err' : IDL.Text });
  const UserType = IDL.Variant({ 'Business' : IDL.Null, 'Worker' : IDL.Null });
  const UserProfile = IDL.Record({
    'id' : UserId,
    'updated_at' : Time,
    'user_type' : UserType,
    'name' : IDL.Text,
    'created_at' : Time,
    'email' : IDL.Text,
    'did_document' : IDL.Opt(IDL.Text),
    'phone' : IDL.Opt(IDL.Text),
    'owner_principal' : IDL.Principal,
    'location' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text });
  const WorkHistoryId = IDL.Text;
  const WorkHistory = IDL.Record({
    'id' : WorkHistoryId,
    'pay_earned' : IDL.Float32,
    'business_id' : UserId,
    'role' : IDL.Text,
    'hours_worked' : IDL.Float32,
    'business_name' : IDL.Text,
    'date_worked' : IDL.Text,
    'shift_id' : ShiftId,
    'worker_id' : UserId,
    'verification_hash' : IDL.Text,
    'completed_at' : Time,
    'location' : IDL.Text,
  });
  const WorkerProfile = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'total_shifts_completed' : IDL.Nat64,
    'user_id' : UserId,
    'availability' : IDL.Vec(IDL.Text),
    'is_verified' : IDL.Bool,
    'average_rating' : IDL.Opt(IDL.Float32),
    'experience_level' : IDL.Text,
    'skills' : IDL.Vec(IDL.Text),
  });
  const Result_2 = IDL.Variant({ 'Ok' : WorkerProfile, 'Err' : IDL.Text });
  const DIDDocument = IDL.Record({
    'updated_at' : Time,
    'signature' : IDL.Text,
    'ratings' : IDL.Vec(RatingId),
    'created_at' : Time,
    'total_shifts' : IDL.Nat64,
    'worker_id' : UserId,
    'average_rating' : IDL.Opt(IDL.Float32),
    'skills_verified' : IDL.Vec(IDL.Text),
    'work_history' : IDL.Vec(WorkHistoryId),
  });
  const Result_6 = IDL.Variant({ 'Ok' : DIDDocument, 'Err' : IDL.Text });
  const Result_5 = IDL.Variant({ 'Ok' : IDL.Vec(Shift), 'Err' : IDL.Text });
  const ShiftApplication = IDL.Record({
    'status' : IDL.Variant({
      'Approved' : IDL.Null,
      'Rejected' : IDL.Null,
      'Pending' : IDL.Null,
    }),
    'applied_at' : Time,
    'shift_id' : ShiftId,
    'message' : IDL.Opt(IDL.Text),
    'worker_id' : UserId,
  });
  const Result_10 = IDL.Variant({
    'Ok' : IDL.Vec(Notification),
    'Err' : IDL.Text,
  });
  const Result_7 = IDL.Variant({
    'Ok' : IDL.Vec(WorkHistory),
    'Err' : IDL.Text,
  });
  const Result_8 = IDL.Variant({ 'Ok' : IDL.Vec(Rating), 'Err' : IDL.Text });
  return IDL.Service({
    'apply_to_shift' : IDL.Func([ShiftId, IDL.Opt(IDL.Text)], [Result_9], []),
    'approve_application' : IDL.Func([ShiftId, UserId], [Result_9], []),
    'create_business_profile' : IDL.Func([BusinessProfile], [Result_3], []),
    'create_notification' : IDL.Func([Notification], [Result_9], []),
    'create_rating' : IDL.Func([Rating], [Result_9], []),
    'create_shift' : IDL.Func([Shift], [Result_4], []),
    'create_user_profile' : IDL.Func([UserProfile], [Result_1], []),
    'create_work_history' : IDL.Func([WorkHistory], [Result_9], []),
    'create_worker_profile' : IDL.Func([WorkerProfile], [Result_2], []),
    'delete_shift' : IDL.Func([ShiftId], [Result_9], []),
    'export_worker_did' : IDL.Func([UserId], [Result_6], ['query']),
    'get_available_shifts' : IDL.Func(
        [IDL.Opt(IDL.Text)],
        [Result_5],
        ['query'],
      ),
    'get_business_profile' : IDL.Func([UserId], [Result_3], ['query']),
    'get_caller_principal' : IDL.Func([], [IDL.Principal], ['query']),
    'get_shift' : IDL.Func([ShiftId], [Result_4], ['query']),
    'get_shift_applications' : IDL.Func(
        [ShiftId],
        [IDL.Vec(ShiftApplication)],
        ['query'],
      ),
    'get_shifts_by_business' : IDL.Func([UserId], [Result_5], ['query']),
    'get_user_notifications' : IDL.Func([UserId], [Result_10], ['query']),
    'get_user_profile' : IDL.Func([IDL.Principal], [Result_1], ['query']),
    'get_worker_did' : IDL.Func([UserId], [Result_6], ['query']),
    'get_worker_history' : IDL.Func([UserId], [Result_7], ['query']),
    'get_worker_profile' : IDL.Func([UserId], [Result_2], ['query']),
    'get_worker_ratings' : IDL.Func([UserId], [Result_8], ['query']),
    'health_check' : IDL.Func([], [IDL.Bool], ['query']),
    'mark_notification_read' : IDL.Func([IDL.Text], [Result_9], []),
    'reject_application' : IDL.Func([ShiftId, UserId], [Result_9], []),
    'update_business_profile' : IDL.Func([BusinessProfile], [Result_3], []),
    'update_shift' : IDL.Func([ShiftId, Shift], [Result_4], []),
    'update_user_profile' : IDL.Func([UserProfile], [Result_1], []),
    'update_worker_profile' : IDL.Func([WorkerProfile], [Result_2], []),
  });
};
export const init = ({ IDL }) => { return []; };
