import React from 'react'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { Field } from '../ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type PaginationDetails = {
    page?: string,
    limit?: string,
    hasMore?: boolean,
    contentCount?: string,
    maxPages?: string
} | null

export default function PaginationButtons(paginationDetails: PaginationDetails) {
    const params = useSearchParams();
    const router = useRouter();

    const currentPage = Math.max(1, Number(params.get("page") ?? paginationDetails?.page ?? 1));
    const maxPages = Math.max(1, Number(paginationDetails?.maxPages ?? 1));
    // start at current page, but clamp so we never go past max
    const startPage = Math.min(currentPage, Math.max(1, maxPages - 2));

    const length = Math.min(3, maxPages - startPage + 1);

    const updateParams = (param: "page" | "limit", value: string) => {
        const newParams = new URLSearchParams(params.toString())

        if (param === "page" && value != newParams.get("page")) {
            newParams.set("page", value)
        }
        if (param === "limit" && value != newParams.get("limit")) {
            console.log("limit")
            newParams.set("limit", value)
        }

        router.push(`/games?${newParams.toString()}`)
    }

    return (
        <div className='flex gap-3'>
            <Field orientation="horizontal" className="whitespace-nowrap">
                {/* TODO: need to figure out even when i do a search from the default /games endpoint why does it not update when limit is in params */}
                <Select defaultValue={params.get("limit") || "25"} onValueChange={(value) => updateParams("limit", value)}>
                    <SelectTrigger className="w-20" id="select-rows-per-page">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                        <SelectGroup>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>

                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            <Pagination className='mx-0 justify-end'>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => {
                                if (Number(paginationDetails?.page) > 1) {
                                    updateParams("page", String(Number(paginationDetails?.page) - 1))
                                }
                            }}
                            className={`${Number(paginationDetails?.page) > 1 ? "cursor-pointer" : "bg-gray-500/40 pointer-events-none"}`}
                            aria-disabled={Number(paginationDetails?.page) <= 1}
                        />
                    </PaginationItem>
                    {paginationDetails?.maxPages && Array.from(
                        { length: length },
                        (_, i) => startPage + i)
                        .map((page: number) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    onClick={() => updateParams("page", String(page))}
                                    isActive={currentPage === page}
                                    className='cursor-pointer'
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    {(Number(paginationDetails?.page) <= Number(paginationDetails?.maxPages) - 3) && (
                        <>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink
                                    onClick={() => updateParams("page", `${paginationDetails?.maxPages}`)}
                                    isActive={params.get("page") === `${paginationDetails?.maxPages}`}
                                    className='cursor-pointer'
                                >
                                    {paginationDetails?.maxPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => {
                                if (Number(paginationDetails?.page) != Number(paginationDetails?.maxPages)) {
                                    updateParams("page", String(Number(paginationDetails?.page) + 1))
                                }
                            }}
                            className={`${Number(paginationDetails?.page) != Number(paginationDetails?.maxPages) ? "cursor-pointer" : "bg-gray-500/40 pointer-events-none"}`}
                            aria-disabled={Number(paginationDetails?.page) >= Number(paginationDetails?.maxPages)}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}
