"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card"; // <--- NOWY IMPORT
import { MousePointerClick, Server, Clock, Zap, Settings, Shield, Music, MonitorPlay } from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type UserProfile = {
  is_pro: boolean;
  has_music_bot: boolean;
  has_watch_bot: boolean;
  has_manager_bot: boolean;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Błąd:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) fetchProfile();
  }, [user, isLoaded]);

  const activeBotsCount = [
    profile?.has_music_bot,
    profile?.has_watch_bot,
    profile?.has_manager_bot
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
      value: profile?.is_pro ? "Unlimited" : "Limited", 
      icon: Zap, 
      trend: profile?.is_pro ? "Pro Plan" : "Free Tier" 
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

  const planName = profile?.is_pro ? "Pro Bundle" : (activeBotsCount > 0 ? "Starter" : "Free");
  const isActive = activeBotsCount > 0 || profile?.is_pro;

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
                    variant={isActive ? "default" : "secondary"} 
                    className="px-3 py-1 text-sm"
                  >
                    {planName} Plan
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`px-3 py-1 text-sm ${isActive ? "text-green-600 border-green-600" : "text-slate-500"}`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              )}
            </div>

            {!loading && !isActive && (
              <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Unlock the full potential</h3>
                    <p className="text-sm text-muted-foreground">
                      Get access to premium music quality, 4K streaming, and server protection.
                    </p>
                  </div>
                  <Button asChild size="lg">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* UŻYCIE TWOJEGO KOMPONENTU STATCARD */}
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
                  <Button 
                    className="w-full justify-start" 
                    variant="outline" 
                    disabled={!isActive}
                  >
                    <Server className="mr-2 h-4 w-4" />
                    Add to Server
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/pricing">
                        <Zap className="mr-2 h-4 w-4" />
                        Buy More Bots
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