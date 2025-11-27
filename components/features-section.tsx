import { FeatureCard } from "./feature-card";
import { Music, MonitorPlay, ShieldAlert, Mic2, Users, Activity } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Music,
      title: "Music Bot Pro",
      description: "Krystalicznie czysty dźwięk. Obsługa Spotify, YouTube, SoundCloud. System playlist i filtrów audio.",
    },
    {
      icon: MonitorPlay,
      title: "WatchTogether",
      description: "Oglądaj Netflixa, YouTube i Disney+ ze znajomymi. Idealna synchronizacja wideo 4K bez opóźnień.",
    },
    {
      icon: ShieldAlert,
      title: "Server Guardian",
      description: "Zaawansowany anty-raid i anty-spam. Automatyczna moderacja czatu 24/7, która chroni Twoją społeczność.",
    },
    {
      icon: Mic2,
      title: "Voice Master",
      description: "Twórz tymczasowe kanały głosowe. Użytkownicy mogą sami zarządzać nazwą i limitem miejsc swojego kanału.",
    },
    {
      icon: Users,
      title: "System Ról",
      description: "Reaction Roles, Leveling i nagrody za aktywność. Zwiększ zaangażowanie użytkowników na serwerze.",
    },
    {
      icon: Activity,
      title: "Logi & Statystyki",
      description: "Pełny wgląd w to, co dzieje się na serwerze. Wykresy aktywności, logi usuniętych wiadomości i banów.",
    },
  ];

  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Wszystko, czego potrzebuje Twój serwer
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Jeden panel, wiele możliwości. Wybierz moduły, które Cię interesują.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}