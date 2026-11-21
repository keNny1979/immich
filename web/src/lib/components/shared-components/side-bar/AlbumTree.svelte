<script lang="ts">
  import { page } from '$app/state';
  import AlbumTreeNode from '$lib/components/shared-components/side-bar/AlbumTreeNode.svelte';
  import { sidebarAlbumTreeExpanded } from '$lib/stores/preferences.store';
  import { userInteraction } from '$lib/stores/user.svelte';
  import { getAlbumPath, groupAlbumsByParent } from '$lib/utils/album-utils';
  import { handleError } from '$lib/utils/handle-error';
  import { getAllAlbums, type AlbumResponseDto } from '@immich/sdk';
  import { untrack } from 'svelte';
  import { t } from 'svelte-i18n';

  // Explorer-style album tree: every album the user can see, sub-albums nested below their parent.
  let albums = $state<AlbumResponseDto[]>(userInteraction.sidebarAlbums ?? []);

  const refreshAlbums = async () => {
    try {
      albums = await getAllAlbums({});
      userInteraction.sidebarAlbums = albums;
    } catch (error) {
      handleError(error, $t('failed_to_load_assets'));
    }
  };

  $effect(() => {
    if (!userInteraction.sidebarAlbums) {
      void refreshAlbums();
    }
  });

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const byName = (a: AlbumResponseDto, b: AlbumResponseDto) => collator.compare(a.albumName, b.albumName);

  const albumIds = $derived(new Set(albums.map(({ id }) => id)));
  const childrenByParent = $derived.by(() => {
    const groups = groupAlbumsByParent(albums);
    for (const children of groups.values()) {
      children.sort(byName);
    }
    return groups;
  });
  // a sub-album shared with me whose parent I cannot see is shown at the top level
  const roots = $derived(
    albums.filter(({ parentAlbumId }) => !parentAlbumId || !albumIds.has(parentAlbumId)).sort(byName),
  );

  const activeId = $derived(page.url.pathname.match(/^\/albums\/([\da-f-]{36})/i)?.[1]);
  const expandedIds = $derived(new Set($sidebarAlbumTreeExpanded));

  const getChildren = (albumId: string) => childrenByParent.get(albumId) ?? [];
  const isExpanded = (albumId: string) => expandedIds.has(albumId);
  const onToggle = (albumId: string) => {
    sidebarAlbumTreeExpanded.update((ids) =>
      ids.includes(albumId) ? ids.filter((id) => id !== albumId) : [...ids, albumId],
    );
  };

  // opening an album unfolds the tree down to it and shows its sub-albums
  $effect(() => {
    if (!activeId) {
      return;
    }
    const path = getAlbumPath(albums, activeId).map(({ id }) => id);
    untrack(() => {
      const missing = path.filter((id) => !expandedIds.has(id));
      if (missing.length > 0) {
        sidebarAlbumTreeExpanded.update((ids) => [...ids, ...missing]);
      }
    });
  });
</script>

<ul class="max-h-[50vh] overflow-y-auto py-1">
  {#each roots as album (album.id)}
    <AlbumTreeNode {album} depth={0} {activeId} {getChildren} {isExpanded} {onToggle} />
  {/each}
</ul>
