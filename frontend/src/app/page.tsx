"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AllTimeFavs, UpcomingEvents, UpcomingReleases } from "@/lib/types";
import { useRouter } from "next/navigation";
import { formatUnixTime } from "@/utils/utils";
import Autoplay from "embla-carousel-autoplay";
import { getAllTimeFavorites, getUpcomingEvents, getUpcomingReleases } from "@/lib/api/igdb";

const url_igdb_t_original = process.env.NEXT_PUBLIC_URL_IGDB_T_ORIGINAL

export default function Home() {
  const router = useRouter();
  const [upcomingReleases, setUpcomingReleases] = useState<UpcomingReleases[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvents[]>([]);
  const [allTimeFavs, setAllTimeFavs] = useState<AllTimeFavs[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const ueData = await getUpcomingEvents();
      const urData = await getUpcomingReleases();
      const atfData = await getAllTimeFavorites();

      // TODO: implement error handling for below
      if (ueData.ok) setUpcomingEvents(ueData.data);
      if (urData.ok) setUpcomingReleases(urData.data);
      if (atfData.ok) setAllTimeFavs(atfData.data);
    }
    fetchAllData();
  }, [])

  return (
    <main className="flex py-8 grow w-full  flex-col items-center  gap-5  text-card-foreground sm:items-start">
      
      <div className="pb-16 w-full">
        {/* UPCOMING EVENTS */
          upcomingEvents && upcomingEvents.length > 0 &&
          <section className='w-full'>
            <div className='flex justify-center'>
              <Carousel
                className="w-full max-w-500"
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
                        onClick={() => { router.push(`/game-info?gameId=${event.id}`) }}
                      >
                        <Card className="relative" >
                          <CardContent className='aspect-9/3'>
                            <Image
                              src={`${url_igdb_t_original}${event.event_logo?.image_id}.jpg`}
                              alt={`cover-${event.id}`}
                              layout="fill"
                              className="rounded-lg"
                            />
                          </CardContent>
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
      </div>

      <div className="w-full ">
        {/* UPCOMING RELEASES */
          upcomingReleases && upcomingReleases.length > 0 &&
          <section className='w-full px-4'>
            <h4 className="text-2xl font-semibold mb-2">Upcoming Releases</h4>
            <div className='flex justify-center'>
              <Carousel className="w-full max-w-480">
                <CarouselContent className="-ml-1">
                  {upcomingReleases.map((game, index) => (
                    <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/7 cursor-pointer ">
                      <div
                        className="p-2 rounded-lg"
                        onClick={() => { router.push(`/game-info?gameId=${game.id}`) }}
                      >
                        <Card className="relative" >
                          <CardContent className='aspect-3/4'>
                            <Image
                              src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                              alt={`cover-${game.id}`}
                              layout="fill"
                              className="rounded-lg"
                            />
                          </CardContent>
                        </Card>
                        <div className='w-full flex flex-col justify-center'>
                          <p>{game.name}</p>
                          <p>{formatUnixTime(game.first_release_date)}</p>
                        </div>
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
      </div>

      <div className="w-full">
        {/* ALL TIME FAVORITES */
          allTimeFavs && allTimeFavs.length > 0 &&
          <section className='w-full px-4'>
            <h4 className="text-2xl font-semibold mb-2">All Time Favorites</h4>
            <div className='flex justify-center'>
              <Carousel className="w-full max-w-480">
                <CarouselContent className="-ml-1">
                  {allTimeFavs.map((game, index) => (
                    <CarouselItem key={index} className="basis-1/2 pl-1 sm:basis-1/3 md:basis-1/5 lg:basis-1/7 cursor-pointer ">
                      <div
                        className="p-2 bg-background rounded-lg"
                        onClick={() => { router.push(`/game-info?gameId=${game.id}`) }}
                      >
                        <Card className="relative" >
                          <CardContent className='aspect-3/4'>
                            <Image
                              src={`${url_igdb_t_original}${game.cover?.image_id}.jpg`}
                              alt={`cover-${game.id}`}
                              layout="fill"
                              className="rounded-lg"
                            />
                          </CardContent>
                        </Card>
                        <div className='w-full flex flex-col justify-center'>
                          <p>{game.name}</p>
                          <p>{formatUnixTime(game.first_release_date)}</p>
                        </div>
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
      </div>

    </main>
  );
}


