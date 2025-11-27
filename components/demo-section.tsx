import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import discordImage from "@assets/generated_images/Discord_bot_interface_mockup_3fa6d67c.png";
import configImage from "@assets/generated_images/Bot_configuration_dashboard_fba22eca.png";
import { useState } from "react";

export function DemoSection() {
  const [interval, setInterval] = useState([2000]);
  const [enabled, setEnabled] = useState(true);

  return (
    <section id="demo" className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            See ClickBot in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Interactive demo of Discord bot configuration and control
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[60%_40%]">
          <div className="order-2 lg:order-1">
            <Card>
              <CardContent className="p-0">
                <img
                  src="/generated_images/Discord_bot_interface_mockup_3fa6d67c.png"
                  alt="Discord bot interface"
                  className="h-full w-full rounded-lg object-cover"
                  data-testid="img-demo-discord"
                />
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="mb-4 text-xl font-semibold">Control Panel</h3>
                  <Badge variant="secondary" data-testid="badge-status">
                    {enabled ? "Active" : "Paused"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bot-enabled">Enable Bot</Label>
                    <Switch
                      id="bot-enabled"
                      checked={enabled}
                      onCheckedChange={setEnabled}
                      data-testid="switch-bot-enabled"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Click Interval: {interval[0]}ms</Label>
                    <Slider
                      value={interval}
                      onValueChange={setInterval}
                      min={500}
                      max={10000}
                      step={100}
                      data-testid="slider-interval"
                    />
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <img
                      src="/generated_images/Bot_configuration_dashboard_fba22eca.png"
                      alt="Bot configuration"
                      className="w-full rounded"
                      data-testid="img-demo-config"
                    />
                  </div>

                  <div className="space-y-2 rounded-lg border p-4">
                    <h4 className="font-medium">Activity Log</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p data-testid="text-log-1">• Click executed at 14:32:15</p>
                      <p data-testid="text-log-2">• Waiting {interval[0]}ms...</p>
                      <p data-testid="text-log-3">• Bot status: {enabled ? "Running" : "Stopped"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
