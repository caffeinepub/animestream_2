import { HttpAgent } from "@icp-sdk/core/agent";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnimeEntry,
  backendInterface as BackendAPI,
  SiteSettings,
} from "../backend.d";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useActor } from "./useActor";

function useBackend() {
  const { actor, isFetching } = useActor();
  return { actor: actor as unknown as BackendAPI | null, isFetching };
}

export function useGetAllAnime() {
  const { actor, isFetching } = useBackend();
  return useQuery<AnimeEntry[]>({
    queryKey: ["anime"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAnime();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSettings() {
  const { actor, isFetching } = useBackend();
  return useQuery<SiteSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) {
        return {
          siteName: "AnimeStream",
          logoUrl: "",
          heroBlobId: "",
          bgBlobId: "",
          bgType: "color",
          bgColor: "#0a0a0a",
        };
      }
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAnime() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      thumbnailUrl: string;
      videoUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addAnime(
        data.title,
        data.description,
        data.thumbnailUrl,
        data.videoUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anime"] });
    },
  });
}

export function useUpdateAnime() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      description: string;
      thumbnailUrl: string;
      videoUrl: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAnime(
        data.id,
        data.title,
        data.description,
        data.thumbnailUrl,
        data.videoUrl,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anime"] });
    },
  });
}

export function useDeleteAnime() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAnime(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anime"] });
    },
  });
}

export function useUpdateSettings() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSettings(
        settings.siteName,
        settings.logoUrl,
        settings.heroBlobId,
        settings.bgBlobId,
        settings.bgType,
        settings.bgColor,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

/**
 * Upload a file to Caffeine blob storage and return a permanent URL.
 * Shows upload progress via the onProgress callback.
 */
export async function uploadFileWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.warn);
  }
  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const { hash } = await storageClient.putFile(bytes, onProgress);
  return storageClient.getDirectURL(hash);
}
