"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaGamepad, FaLayerGroup, FaSearch } from "react-icons/fa";
import SearchBar from "@/components/search/SearchBar";
import AnimatedLoading from "@/components/AnimatedLoading";
import PageError from "@/components/PageError";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllPlatforms } from "@/lib/api/igdb";
import { missingImgGrey, url_igdb_t_original } from "@/lib/constants";
import { IGDBPlatformDetail } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.18em]">
            {label}
          </CardDescription>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [consoles, setConsoles] = useState<IGDBPlatformDetail[]>([]);
  const [filteredConsoles, setFilteredConsoles] = useState<IGDBPlatformDetail[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let active = true;

    const run = async () => {
      setStatus("loading");
      const result = await getAllPlatforms();
      if (!active) return;

      if (result.ok) {
        setStatus("success");
        setConsoles(result.data);
        console.log(result.data)
        setFilteredConsoles(result.data);
      } else {
        setStatus("error");
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  if (status === "error") return <PageError />;

  return (
    <main className="mx-auto flex w-full max-w-500 flex-col gap-6 px-4 py-8 text-card-foreground">
      {/* <section className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-[radial-gradient(circle_at_top_left,hsl(var(--secondary))_0%,transparent_35%),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--background))_100%)] px-6 py-8 shadow-sm md:px-8 md:py-10">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/40 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Platform Library</Badge>
            <Badge variant="outline">Browse Consoles</Badge>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Explore gaming platforms with a stronger visual index.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Move through home consoles, handhelds, computers, and niche hardware from one place,
              then jump directly into platform details when something catches your eye.
            </p>
          </div>
        </div>
      </section> */}

      {/* <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Platforms"
          value={consoles.length}
          description="Total systems currently available to browse."
          icon={<FaLayerGroup />}
        />
        <StatCard
          label="Visible Results"
          value={filteredConsoles.length}
          description="Platforms matching your current search."
          icon={<FaSearch />}
        />
        <StatCard
          label="Catalog Focus"
          value="Retro to modern"
          description="From early hardware oddities to current-generation systems."
          icon={<FaGamepad />}
        />
      </section> */}

      <Card className="border-border/60 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Find a platform</CardTitle>
          <CardDescription>
            Search by platform name and narrow the console grid without leaving the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar originalData={consoles} setData={setFilteredConsoles} searchType="console" />
        </CardContent>
      </Card>

      {status === "loading" ? (
        <AnimatedLoading />
      ) : filteredConsoles.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-card/40">
          <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <Badge variant="outline">No platforms found</Badge>
            <h2 className="text-2xl font-semibold">Your search did not match any consoles.</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Try a broader platform name or clear the current query to return to the full catalog.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredConsoles.map((console) => (
            <Link
              key={`console-${console.id}-${console.slug}`}
              href={`/info/console-info?consoleId=${console.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden border-border/60 bg-card/85 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-0">
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-border/50 bg-[linear-gradient(180deg,hsl(var(--secondary))_0%,hsl(var(--muted))_100%)]">
                    <Image
                      src={
                        console.platform_logo?.image_id
                          ? `${url_igdb_t_original}${console.platform_logo.image_id}.jpg`
                          : missingImgGrey
                      }
                      alt={`icon-${console.id}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className="object-contain object-center p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-fit">
                        {console.platform_type?.name ? toTitleCase(console.platform_type?.name) : "Unknown"}
                      </Badge>
                      <h2 className="line-clamp-2 text-xl font-semibold tracking-tight">
                        {console.name}
                      </h2>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>Open details</span>
                      <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
