import { AxiosError } from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ApiError, ParamsObj } from "./types";
import { ReadonlyURLSearchParams } from "next/dist/client/components/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toApiError = (err: unknown): ApiError => {
  const e = err as AxiosError<any>;
  const detail = e.response?.data?.detail;
  return {
    status: e.response?.status ?? 0,
    code: detail?.code ?? "UNKNOWN_ERROR",
    message: detail?.message ?? e.message ?? "Request failed",
  }
}

export const formatUnixTime = (unixDate: any) => {
  const timestamp = Number(unixDate) * 1000
  const date = new Date(timestamp);
  return date.toLocaleDateString()
}

export const formatUnixTimeToDateTime = (unixDate: any) => {
  const timestamp = Number(unixDate) * 1000
  const date = new Date(timestamp);


  const datePart = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  return {
    date: datePart.replace(",", ""),
    time: timePart,
  }
}

export const toUnixString = (date: Date): string => {
  const unixSeconds = Math.floor(date.getTime() / 1000);

  return unixSeconds.toString()
}

export const isPublicRoute = (path: string) => {
  const publicPathPrefixes = new Set(["/", "/info", "/login", "/signup"]);
  const pathname = path.split("?")[0];

  if (publicPathPrefixes.has(pathname)) return true;

  return false
}

export const commaStringToList = (stringList: string): string[] => {
  const items = stringList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return items
}

export const formatRegion = (region: string): string => {
  // north_america
  // japan
  const formatted_item = region
    .split("_")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
  // North America
  // Japan

  return formatted_item
}

export const toNumArray = (values: string[]) =>
  values.map((v) => Number(v)).filter((n) => Number.isFinite(n));

export const buildFiltersObject = (params: ReadonlyURLSearchParams): ParamsObj => {
  const filters = {
    query: params.get("query") ?? "",
    genres: toNumArray(params.getAll("genres")) ?? [],
    themes: toNumArray(params.getAll("themes")) ?? [],
    consoles: toNumArray(params.getAll("consoles")) ?? [],
    fromDate: params.get("fromDate") ?? "",
    toDate: params.get("toDate") ?? "",
    page: Number(params.get("page")) ?? 1,
    limit: Number(params.get("limit")) && Number(params.get("limit")) !== 0 ? Number(params.get("limit")) : 50,
    sort: params.get("sort") ?? "asc"
  }

  return filters
}

export const normalizedURL = (url: string) => {
  const trimmed = url.trim();
  const normalized = /^https?:\/\//i.test(trimmed) ?
    trimmed :
    `https://${trimmed.replace(/^www\./, "")}`;

  return normalized;
}

export const getNetworkIcon = (url: string) => {
  if (!url) return "";
  const normalized = normalizedURL(url);

  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return ""
  }
}