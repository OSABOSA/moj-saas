import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  onButtonClick: () => void;
}

export function PricingCard({
  name,
  price,
  period,
  features,
  highlighted = false,
  buttonText,
  onButtonClick,
}: PricingCardProps) {
  return (
    <Card
      className={`relative flex flex-col ${highlighted ? "border-primary shadow-lg" : ""}`}
      data-testid={`card-pricing-${name.toLowerCase()}`}
    >
      {highlighted && (
        <Badge
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          data-testid="badge-popular"
        >
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <h3 className="text-2xl font-bold">{name}</h3>
        <div className="mt-4">
          <span className="font-display text-5xl font-bold" data-testid={`text-price-${name.toLowerCase()}`}>
            {price}
          </span>
          <span className="text-muted-foreground"> {period}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3" data-testid={`text-feature-${name.toLowerCase()}-${index}`}>
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          onClick={onButtonClick}
          data-testid={`button-pricing-${name.toLowerCase()}`}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
