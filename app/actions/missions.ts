'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { missions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export interface MissionData {
  departurePlanet: string
  targetPlanet: string
  transferTime: number
  transferTimeDays: number
  deltaV: number
  departureVelocity: number
  arrivalVelocity: number
  fuelUsed: number
  fuelInitial: number
  rocketPreset: string
  status: 'landed' | 'failed' | 'in_flight'
}

export async function saveMission(data: MissionData) {
  const userId = await getUserId()
  
  const result = await db
    .insert(missions)
    .values({
      userId,
      departurePlanet: data.departurePlanet,
      targetPlanet: data.targetPlanet,
      transferTime: data.transferTime,
      transferTimeDays: data.transferTimeDays,
      deltaV: data.deltaV,
      departureVelocity: data.departureVelocity,
      arrivalVelocity: data.arrivalVelocity,
      fuelUsed: data.fuelUsed,
      fuelInitial: data.fuelInitial,
      rocketPreset: data.rocketPreset,
      status: data.status,
      launchedAt: new Date(),
      arrivedAt: data.status === 'landed' ? new Date() : null,
    })
    .returning()

  revalidatePath('/missions')
  return result[0]
}

export async function getMissions() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(missions)
    .where(eq(missions.userId, userId))
    .orderBy(desc(missions.createdAt))
}

export async function deleteMission(missionId: number) {
  const userId = await getUserId()
  
  await db
    .delete(missions)
    .where(eq(missions.id, missionId) && eq(missions.userId, userId))
  
  revalidatePath('/missions')
}

export async function getMissionStats() {
  const userId = await getUserId()
  
  const userMissions = await db
    .select()
    .from(missions)
    .where(eq(missions.userId, userId))

  const totalMissions = userMissions.length
  const successfulMissions = userMissions.filter(m => m.status === 'landed').length
  const totalFuelUsed = userMissions.reduce((sum, m) => sum + m.fuelUsed, 0)
  const avgTransferTime = userMissions.length > 0 
    ? userMissions.reduce((sum, m) => sum + m.transferTimeDays, 0) / userMissions.length 
    : 0

  return {
    totalMissions,
    successfulMissions,
    totalFuelUsed,
    avgTransferTime,
  }
}
