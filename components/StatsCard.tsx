interface Props {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
}

export default function StatsCard({ label, value, icon, color = '#FF5E8D' }: Props) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{label}</p>
      </div>
    </div>
  )
}
