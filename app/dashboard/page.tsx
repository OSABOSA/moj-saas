"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { MousePointerClick, Server, Clock, Zap, Settings } from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Pobieramy link z env
const DISCORD_INVITE_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#";

type UserSubscriptionState = {
  planName: string;
  is_subscribed: boolean;
  features: {
    is_pro: boolean;
    has_music_bot: boolean;
    has_watch_bot: boolean;
    has_manager_bot: boolean;
  }
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [subData, setSubData] = useState<UserSubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return;
      try {
        const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('clerk_id', user.id)
            .single();

        if (!userData) return;

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (!error && data) {
          const type = data.subscribe_type; 
          
          setSubData({
            planName: type,
            is_subscribed: data.is_subscribed,
            features: {
              is_pro: type === 'ENTERPRICE', 
              // Music Bot jest teraz dostępny dla każdego (nawet FREE)
              has_music_bot: true, 
              has_manager_bot: type === 'PRO' || type === 'ENTERPRICE', 
              has_watch_bot: type === 'ENTERPRICE', 
            }
          });
        }
      } catch (err) {
        console.error("Błąd pobierania subskrypcji:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) fetchSubscription();
  }, [user, isLoaded]);

  // Obliczamy aktywne boty (teraz Music Bot jest zawsze dostępny)
  const activeBotsCount = [
    true, // Music bot zawsze aktywny
    subData?.features.has_watch_bot,
    subData?.features.has_manager_bot
  ].filter(Boolean).length;

  const stats = [
    { 
      title: "Active Bots", 
      value: activeBotsCount.toString(), 
      icon: Server, 
      trend: `${activeBotsCount}/3 licenses` 
    },
    { 
      title: "Total Uptime", 
      value: "99.9%", 
      icon: Clock, 
      trend: "Last 30 days" 
    },
    { 
      title: "Server Actions", 
      value: subData?.features.is_pro ? "Unlimited" : "Limited", 
      icon: Zap, 
      trend: subData?.planName || "Free Tier" 
    },
    { 
      title: "Commands Used", 
      value: "1,240", 
      icon: MousePointerClick, 
      trend: "+12% this week" 
    },
  ];

  const recentActivity = [
    { time: "2 minutes ago", action: "Music Bot joined voice channel", server: "Gaming Lounge" },
    { time: "15 minutes ago", action: "Server backup completed", server: "Main Community" },
    { time: "1 hour ago", action: "WatchTogether session started", server: "Movie Night" },
    { time: "3 hours ago", action: "New member verify", server: "Main Community" },
  ];

  const displayPlanName = subData?.planName === 'ENTERPRICE' ? 'PRO Bundle' : (subData?.planName || 'Free');
  // Uznajemy, że konto jest aktywne, bo ma darmowy plan Music Bot
  const isActive = true; 

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SignedOut>
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-2xl font-bold">Please log in to view dashboard</h2>
                <RedirectToSignIn />
            </div>
        </SignedOut>

        <SignedIn>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your discord bots and subscriptions.
                </p>
              </div>
              
              {loading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="default" 
                    className="px-3 py-1 text-sm"
                  >
                    {displayPlanName}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="px-3 py-1 text-sm text-green-600 border-green-600"
                  >
                    Active
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <StatCard 
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  trend={stat.trend}
                />
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.server}
                          </p>
                        </div>
                        <div className="ml-auto font-medium text-xs text-muted-foreground">
                          {activity.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Bots
                  </Button>
                  
                  {/* --- POPRAWIONY PRZYCISK ADD TO SERVER --- */}
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    // Usuwamy disabled, bo bot jest darmowy
                    // disabled={!isActive} 
                    asChild // Ważne: pozwala na użycie linku wewnątrz
                  >
                    {/* Ten link otwiera zaproszenie bota w nowej karcie */}
                    <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                        <Server className="mr-2 h-4 w-4" />
                        Add to Server
                    </a>
                  </Button>
                  {/* ----------------------------------------- */}

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/pricing">
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade Plan
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
        </SignedIn>
      </div>
      <Footer />
    </div>
  );
}