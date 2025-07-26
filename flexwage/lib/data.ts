export type User = {
  id: number
  name: string
  email: string
  password?: string // Should be hashed in a real app
  role: "Barista" | "Cashier" | "Shift Lead" | "Admin"
  location: "Downtown" | "Uptown"
}

export type Shift = {
  id: string
  postedBy: number // Admin who posted it
  startDate: Date
  endDate: Date
  role: string
  location: string
  status: "Open" | "Pending Approval" | "Filled" | "Expired"
  note?: string
  postedAt: Date
}

export type Claim = {
  id: string
  shift: Shift
  claimedBy: User
  claimedAt: Date
  status: "Pending" | "Approved" | "Rejected"
}

export const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", password: "password123", role: "Barista", location: "Downtown" },
  { id: 2, name: "Bob", email: "bob@example.com", password: "password123", role: "Barista", location: "Downtown" },
  {
    id: 3,
    name: "Charlie",
    email: "charlie@example.com",
    password: "password123",
    role: "Cashier",
    location: "Downtown",
  },
  {
    id: 4,
    name: "Diana (Admin)",
    email: "diana@example.com",
    password: "password123",
    role: "Admin",
    location: "Downtown",
  },
  { id: 5, name: "Eve", email: "eve@example.com", password: "password123", role: "Barista", location: "Uptown" },
  {
    id: 6,
    name: "Frank (Admin)",
    email: "frank@example.com",
    password: "password123",
    role: "Admin",
    location: "Uptown",
  },
]

const createDate = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date
}

export const shifts: Shift[] = [
  {
    id: "shift-1",
    postedBy: 4, // Diana (Admin)
    startDate: createDate(0, 16), // Today 4pm
    endDate: createDate(0, 22), // Today 10pm
    role: "Cashier",
    location: "Downtown",
    status: "Open",
    note: "Evening rush cover",
    postedAt: new Date(new Date().setHours(new Date().getHours() - 1)),
  },
  {
    id: "shift-2",
    postedBy: 4, // Diana (Admin)
    startDate: createDate(1, 9), // Tomorrow 9am
    endDate: createDate(1, 13), // Tomorrow 1pm
    role: "Barista",
    location: "Downtown",
    status: "Open",
    note: "Morning shift, someone called in sick.",
    postedAt: new Date(),
  },
  {
    id: "shift-3",
    postedBy: 6, // Frank (Admin)
    startDate: createDate(1, 14), // Tomorrow 2pm
    endDate: createDate(1, 18), // Tomorrow 6pm
    role: "Barista",
    location: "Uptown",
    status: "Open",
    postedAt: new Date(),
  },
]

export const claims: Claim[] = []
