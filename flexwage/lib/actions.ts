"use server"

import { redirect } from "next/navigation"
import { users, shifts, claims, type User, type Shift, type Claim } from "./data"

// --- Data Access (Simulating a database) ---

// In-memory store
const mockShifts: Shift[] = [...shifts]
const mockClaims: Claim[] = [...claims]
const mockUsers: User[] = [...users]

function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((u) => u.email === email)
}

// --- Auth Actions ---

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = findUserByEmail(email)

  if (!user || user.password !== password) {
    return redirect("/login?error=InvalidCredentials")
  }

  if (user.role === "Admin") {
    redirect(`/admin?userId=${user.id}`)
  } else {
    redirect(`/dashboard?userId=${user.id}`)
  }
}

export async function signupUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "Barista" | "Cashier" | "Shift Lead"
  const location = formData.get("location") as "Downtown" | "Uptown"

  await new Promise((resolve) => setTimeout(resolve, 500))

  if (findUserByEmail(email)) {
    return redirect("/signup?error=UserExists")
  }

  const newUser: User = {
    id: mockUsers.length + 1,
    name,
    email,
    password,
    role,
    location,
  }
  mockUsers.push(newUser)

  redirect(`/dashboard?userId=${newUser.id}`)
}

// --- Worker Actions ---

export async function getWorkerData(userId: number) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const user = mockUsers.find((u) => u.id === userId)
  if (!user) throw new Error("User not found")

  const availableShifts = mockShifts.filter(
    (s) => s.status === "Open" && s.role === user.role && s.location === user.location,
  )

  const myClaimedShiftIds = mockClaims
    .filter((c) => c.claimedBy.id === userId && c.status === "Approved")
    .map((c) => c.shift.id)

  const myClaimedShifts = mockShifts.filter((s) => myClaimedShiftIds.includes(s.id))

  return { availableShifts, myClaimedShifts }
}

export async function claimShift(shiftId: string, userId: number) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const user = mockUsers.find((u) => u.id === userId)
  const shift = mockShifts.find((s) => s.id === shiftId)

  if (!user || !shift) return { success: false, error: "User or Shift not found." }
  if (shift.status !== "Open") return { success: false, error: "Shift is no longer available." }

  shift.status = "Pending Approval"
  const newClaim: Claim = {
    id: `claim-${Date.now()}`,
    shift,
    claimedBy: user,
    claimedAt: new Date(),
    status: "Pending",
  }
  mockClaims.push(newClaim)
  return { success: true, claim: newClaim }
}

// --- Admin Actions ---

export async function getAdminData(location: string) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const allShiftsInLocation = mockShifts.filter((s) => s.location === location)

  const openShifts = allShiftsInLocation.filter((s) => s.status === "Open")
  const pendingShifts = allShiftsInLocation.filter((s) => s.status === "Pending Approval")
  const filledShifts = allShiftsInLocation.filter((s) => s.status === "Filled")

  const pendingClaims = mockClaims.filter((c) => c.status === "Pending" && c.shift.location === location)

  return { pendingClaims, openShifts, pendingShifts, filledShifts }
}

export async function postShift(data: {
  startDate: Date
  endDate: Date
  role: string
  location: string
  postedBy: number
  note?: string
}) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const newShift: Shift = {
    id: `shift-${Date.now()}-${Math.random()}`,
    ...data,
    status: "Open",
    postedAt: new Date(),
  }
  mockShifts.unshift(newShift)
  return { success: true, shift: newShift }
}

export async function approveClaim(claimId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const claim = mockClaims.find((c) => c.id === claimId)
  if (!claim) return { success: false, error: "Claim not found." }
  if (claim.status !== "Pending") return { success: false, error: "Claim already resolved." }

  claim.status = "Approved"
  claim.shift.status = "Filled"
  return { success: true }
}

export async function rejectClaim(claimId: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const claim = mockClaims.find((c) => c.id === claimId)
  if (!claim) return { success: false, error: "Claim not found." }
  if (claim.status !== "Pending") return { success: false, error: "Claim already resolved." }

  claim.status = "Rejected"
  claim.shift.status = "Open" // Return to marketplace
  return { success: true }
}
