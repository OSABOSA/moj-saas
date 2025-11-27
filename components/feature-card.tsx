import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
}

export function FeatureCard({ icon: Icon, title, description, href }: FeatureCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        {href && (
          <Link href={href}>
            <a className="mt-4 inline-block text-sm font-medium text-primary hover:underline" data-testid={`link-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              Learn more →
            </a>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
