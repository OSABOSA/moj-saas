import { StatCard } from '../stat-card';
import { MousePointerClick } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-8">
      <StatCard
        title="Active Clicks"
        value="12,453"
        icon={MousePointerClick}
        trend="+20% from last month"
      />
    </div>
  );
}
