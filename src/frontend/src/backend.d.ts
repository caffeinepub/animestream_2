import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface AnimeEntry {
    id: bigint;
    title: string;
    description: string;
    thumbnailBlobId: string;
    videoBlobId: string;
}

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    heroBlobId: string;
    bgBlobId: string;
    bgType: string;
    bgColor: string;
}

export interface backendInterface {
    addAnime(title: string, description: string, thumbnailBlobId: string, videoBlobId: string): Promise<bigint>;
    updateAnime(id: bigint, title: string, description: string, thumbnailBlobId: string, videoBlobId: string): Promise<boolean>;
    deleteAnime(id: bigint): Promise<boolean>;
    getAllAnime(): Promise<AnimeEntry[]>;
    getAnime(id: bigint): Promise<Option<AnimeEntry>>;
    updateSettings(siteName: string, logoUrl: string, heroBlobId: string, bgBlobId: string, bgType: string, bgColor: string): Promise<void>;
    getSettings(): Promise<SiteSettings>;
}
