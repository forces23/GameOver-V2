"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { AllTimeFavs, ApiError, GameData, IGDBPlatform, UpcomingEvents, UpcomingReleases } from "@/lib/types";
import { useRouter } from "next/navigation";
import Autoplay from "embla-carousel-autoplay";
import { getAllTimeFavorites, getMultiplePlatforms, getUpcomingEvents, getUpcomingReleases } from "@/lib/api/igdb";
import { outOfOrder, top15Consoles, url_igdb_t_original } from "@/lib/constants";
import GamesCarousel from "@/components/info-pages/GamesCarousel";
import ConsoleCarousel from "@/components/info-pages/ConsoleCarousel";
import PageSkeleton from "@/components/PageSkeleton";
import PageError from "@/components/PageError";

export default function Home() {
  const router = useRouter();
  const [upcomingReleases, setUpcomingReleases] = useState<GameData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvents[]>([]);
  const [allTimeFavs, setAllTimeFavs] = useState<GameData[]>([]);
  const [popularConsoles, setPopularConsoles] = useState<IGDBPlatform[]>([]);
  const [error, setError] = useState<ApiError | null>(null)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    let active = true;

    const run = async () => {
      setStatus("loading")
      const ueData = await getUpcomingEvents();
      const urData = await getUpcomingReleases(25);
      const atfData = await getAllTimeFavorites();
      const popConData = await getMultiplePlatforms(top15Consoles);
      if (!active) return;

      // TODO: implement error handling for below
      if (ueData.ok) {
        setUpcomingEvents(ueData.data);
        setStatus("success");
      } else {
        setStatus("error");
        setError(ueData.error)
      }

      if (urData.ok) {
        setUpcomingReleases(urData.data);
        setStatus("success");
      } else {
        setStatus("error");
        setError(urData.error)
      }

      if (atfData.ok) {
        setAllTimeFavs(atfData.data);
        setStatus("success");
      } else {
        setStatus("error");
        setError(atfData.error)
      }

      if (popConData.ok) {
        setPopularConsoles(popConData.data);
        setStatus("success");
      } else {
        setStatus("error");
        setError(popConData.error)
      }

    }
    run();
    return () => { active = false }
  }, []);

  if (status === "loading") return <PageSkeleton />
  if (status === "error") return <PageError />

  return (
    <main className="flex py-8 grow w-full  flex-col items-center  gap-5  text-card-foreground sm:items-start">
      {/* UPCOMING EVENTS */}
      {upcomingEvents && upcomingEvents.length > 0 &&
        <section className='pb-4 md:pb-16 w-full max-w-500'>
          <div className='flex justify-center'>
            <Carousel
              className="w-full "
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
            >
              <CarouselContent className="-ml-1">
                {upcomingEvents.map((event, index) => (
                  <CarouselItem key={index} className="pl-1 basis-1/1 cursor-pointer relative">
                    <div
                      className="p-2  rounded-lg flex flex-col justify-center "
                      onClick={() => { router.push(`/info/event-info?eventId=${event.id}`) }}
                    >
                      <Card className="relative aspect-9/5 md:aspect-9/3" >
                        <Image
                          src={event.event_logo?.image_id && event.event_logo?.image_id !== undefined ? `${url_igdb_t_original}${event.event_logo?.image_id}.jpg` : outOfOrder}
                          alt={`cover-${event.checksum}`}
                          fill
                          loading="eager"
                          sizes="(max-width: 1024px) 100vw, 80vw"
                          className="rounded-lg"
                        />
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='left-2' />
              <CarouselNext className='right-2' />
            </Carousel>
          </div>
        </section>
      }
      {popularConsoles && popularConsoles.length > 0 && (
        <ConsoleCarousel title="" consoles={popularConsoles} />
      )}


      {/* UPCOMING RELEASES */}
      {upcomingReleases && upcomingReleases.length > 0 &&
        <GamesCarousel title="Biggest Upcoming Releases" games={upcomingReleases} moreUrl="/game-new-releases" />
      }

      {/* ALL TIME FAVORITES */}
      {allTimeFavs && allTimeFavs.length > 0 &&
        <GamesCarousel title="All Time Favorites" games={allTimeFavs} moreUrl="/games" />
      }

    </main>
  );
}

