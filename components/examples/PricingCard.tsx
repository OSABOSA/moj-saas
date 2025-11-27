import { PricingCard } from '../pricing-card';

export default function PricingCardExample() {
  return (
    <div className="p-8">
      <PricingCard
        name="Pro"
        price="49 zł"
        period="/month"
        features={[
          "5 Discord servers",
          "Advanced auto-clicking",
          "Unlimited clicks",
          "Custom intervals",
          "Analytics dashboard",
          "Priority support",
        ]}
        highlighted={true}
        buttonText="Start Free Trial"
        onButtonClick={() => console.log('Pro plan selected')}
      />
    </div>
  );
}
