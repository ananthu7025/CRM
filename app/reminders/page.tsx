import { Bell } from 'lucide-react'

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Reminders</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Your upcoming reminders and deadlines</p>
      </div>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FF5E8D]/10 flex items-center justify-center mb-4">
          <Bell size={24} className="text-[#FF5E8D]" />
        </div>
        <p className="text-[#0F172A] font-semibold mb-1">Reminders coming soon</p>
        <p className="text-sm text-[#94A3B8]">This feature is under development.</p>
      </div>
    </div>
  )
}
