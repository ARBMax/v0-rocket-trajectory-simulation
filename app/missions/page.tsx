'use client'

import { useEffect, useState } from 'react'
import { getMissions, deleteMission, getMissionStats } from '@/app/actions/missions'
import { Button } from '@/components/ui/button'
import { Trash2, Trophy, Rocket, Zap, Clock } from 'lucide-react'
import Link from 'next/link'

interface Mission {
  id: number
  departurePlanet: string
  targetPlanet: string
  transferTimeDays: number
  deltaV: number
  fuelUsed: number
  fuelInitial: number
  rocketPreset: string
  status: string
  createdAt: Date
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [stats, setStats] = useState({
    totalMissions: 0,
    successfulMissions: 0,
    totalFuelUsed: 0,
    avgTransferTime: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [missionsData, statsData] = await Promise.all([
          getMissions(),
          getMissionStats(),
        ])
        setMissions(missionsData as Mission[])
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load missions:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDelete = async (missionId: number) => {
    if (!confirm('Delete this mission?')) return
    try {
      await deleteMission(missionId)
      setMissions(missions.filter(m => m.id !== missionId))
    } catch (error) {
      console.error('Failed to delete mission:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Mission History</h1>
            <p className="mt-2 text-muted-foreground">Track your rocket trajectory missions</p>
          </div>
          <Link href="/">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
              <Rocket className="mr-2 h-4 w-4" />
              Launch New Mission
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Missions</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalMissions}</p>
              </div>
              <Rocket className="h-8 w-8 text-cyan-500" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful Landings</p>
                <p className="text-2xl font-bold text-foreground">{stats.successfulMissions}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fuel Used</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalFuelUsed.toFixed(0)}kg</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Transfer Time</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgTransferTime.toFixed(0)}d</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Missions Table */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading missions...</div>
          ) : missions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-4">No missions yet. Launch your first rocket!</p>
              <Link href="/">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                  <Rocket className="mr-2 h-4 w-4" />
                  Launch Mission
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Route</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Rocket</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Transfer Time</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Delta-V</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Fuel Used</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Date</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {missions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {mission.departurePlanet} → {mission.targetPlanet}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{mission.rocketPreset}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          mission.status === 'landed'
                            ? 'bg-green-100 text-green-800'
                            : mission.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {mission.transferTimeDays.toFixed(1)}d
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {mission.deltaV.toFixed(1)}m/s
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                        {mission.fuelUsed.toFixed(1)}kg
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                        {new Date(mission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(mission.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
