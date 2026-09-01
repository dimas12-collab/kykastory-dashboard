export type UserRole = "SUPER_ADMIN" | "ADMIN" | "CLIENT";
export type DeliveryStatus = "NOT_SENT" | "SENT";
export type AttendanceStatus = "ATTENDING" | "NOT_ATTENDING" | "MAYBE" | "UNKNOWN";
export type Guest = { id:number; name:string; phone:string; category:string; seatCount:number; deliveryStatus:DeliveryStatus; slug:string; createdAt:string };
export type Rsvp = { id:number; guestName:string; attendanceStatus:AttendanceStatus; guestCount:number; message:string; submittedAt:string };
export type Project = { name:string; coupleName:string; eventDate:string; invitationUrl:string; coverImageUrl:string; status:"ACTIVE"|"DRAFT"|"ARCHIVED" };
export type ProjectStats = { totalGuests:number; sentGuests:number; totalRsvp:number; attendingRsvp:number; notAttendingRsvp:number; maybeRsvp:number; totalAttendance:number; totalMessages:number; totalViews:number };
