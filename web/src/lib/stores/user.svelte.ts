import type {
  AlbumResponseDto,
  ServerAboutResponseDto,
  ServerStorageResponseDto,
  ServerVersionHistoryResponseDto,
} from '@immich/sdk';
import { eventManager } from '$lib/managers/event-manager.svelte';

interface UserInteractions {
  recentAlbums?: AlbumResponseDto[];
  sidebarAlbums?: AlbumResponseDto[];
  versions?: ServerVersionHistoryResponseDto[];
  aboutInfo?: ServerAboutResponseDto;
  serverInfo?: ServerStorageResponseDto;
}

const defaultUserInteraction: UserInteractions = {
  recentAlbums: undefined,
  sidebarAlbums: undefined,
  versions: undefined,
  aboutInfo: undefined,
  serverInfo: undefined,
};

export const userInteraction = $state<UserInteractions>(defaultUserInteraction);

const resetRecentAlbums = () => {
  userInteraction.recentAlbums = undefined;
  userInteraction.sidebarAlbums = undefined;
};

const reset = () => {
  Object.assign(userInteraction, defaultUserInteraction);
};

// eslint-disable-next-line unicorn/no-top-level-side-effects
eventManager.on({
  AlbumCreate: () => resetRecentAlbums(),
  AlbumUpdate: () => resetRecentAlbums(),
  AlbumDelete: () => resetRecentAlbums(),
  AuthLogout: () => reset(),
});
