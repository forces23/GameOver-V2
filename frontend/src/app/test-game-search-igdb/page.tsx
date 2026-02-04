"use client"

import Image from "next/image";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import axios from "axios";
import { formatUnixTime } from "@/utils/utils";


const URL_IGDB_T_THUMB = "https://images.igdb.com/igdb/image/upload/t_thumb/"
const URL_IGDB_T_ORIGINAL = "https://images.igdb.com/igdb/image/upload/t_original/"
const URL_IGDB_T_1080P = "https://images.igdb.com/igdb/image/upload/t_1080p/"
const URL_IGDB_T_COVER_BIG_2X = "https://images.igdb.com/igdb/image/upload/t_cover_big_2x/"
const URL_IGDB_T_SCREENSHOT_MED = "https://images.igdb.com/igdb/image/upload/t_screenshot_med/"
const URL_IGDB_T_SCREENSHOT_HUGE = "https://images.igdb.com/igdb/image/upload/t_screenshot_huge/"
const URL_IGDB_T_720P = "https://images.igdb.com/igdb/image/upload/t_720p/"


export default function Home() {
  const [gameTitle, setGameTitle] = useState("")
  const [searchResults, setSearchResults] = useState([])
  // const [loading, setLoading] = useState(false)

  const searchGame = async () => {
    if (!gameTitle) return;
    // setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/game-search", {
        params: { q: gameTitle },
      })
      console.log(response.data);
      setSearchResults(response.data);
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      // setLoading(false)
    }

  }

  // const getPlatformNames = async (platforms: Number[]) => {
  //   if (!platforms) return;
  //   try {
  //     const response = await axios.get("http://127.0.0.1:8000/platforms", {
  //       params: { platform_ids: platforms },
  //     })
  //     console.log(response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("API Error:", error);
  //   } finally {
  //     //loading turn off
  //   }
  // }

  return (
    <div className="flex min-h-screen items-center justify-center font-sans bg-background text-foreground">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center  py-32 px-16 bg-card text-card-foreground sm:items-start">
        <h1>Search a Game</h1>

        <Field>
          {/* <FieldLabel htmlFor="input-button-group">Search</FieldLabel> */}
          <ButtonGroup>
            <Input id="input-button-group" placeholder="Type to search..." onChange={(e) => setGameTitle(e.target.value)} value={gameTitle} />
            <Button variant="outline" onClick={searchGame}>Search</Button>
          </ButtonGroup>
        </Field>

        {searchResults.length < 1 ? ("No Results Found") :
          (
            searchResults.map((result: any, index: number) => {
              const releaseDate = formatUnixTime(result.first_release_date)
              // console.log(`ReleaseDate = ${releaseDate}`)

              // const platforms =  getPlatformNames(result.platforms)
              // console.log(platforms)


              return (
                <ul key={`${result.name}-${index}`}>
                  <li className={'flex py-3'}>
                      <Image src={`${URL_IGDB_T_ORIGINAL}${result.cover.image_id}.jpg`} alt={`${result.name}+Cover`} height={50} width={100} />
                      <h1>{result.name}</h1>
                  </li>
                  <li></li>
                </ul>
              )
            })
          )}

      </main>
    </div>
  );
}
