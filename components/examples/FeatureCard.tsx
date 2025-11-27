import { FeatureCard } from '../feature-card';
import { MousePointerClick } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <div className="p-8">
      <FeatureCard
        icon={MousePointerClick}
        title="Auto-clicking"
        description="Automated clicking on Discord buttons and interactions with precision timing and reliability."
        href="#"
      />
    </div>
  );
}
