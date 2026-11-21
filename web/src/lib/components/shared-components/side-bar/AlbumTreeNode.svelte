<script lang="ts">
  import AlbumTreeNode from '$lib/components/shared-components/side-bar/AlbumTreeNode.svelte';
  import { Route } from '$lib/route';
  import { getAssetMediaUrl } from '$lib/utils';
  import type { AlbumResponseDto } from '@immich/sdk';
  import { Icon } from '@immich/ui';
  import { mdiChevronRight } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  type Props = {
    album: AlbumResponseDto;
    depth: number;
    activeId?: string;
    getChildren: (albumId: string) => AlbumResponseDto[];
    isExpanded: (albumId: string) => boolean;
    onToggle: (albumId: string) => void;
  };

  let { album, depth, activeId, getChildren, isExpanded, onToggle }: Props = $props();

  const children = $derived(getChildren(album.id));
  const expanded = $derived(children.length > 0 && isExpanded(album.id));
  const active = $derived(album.id === activeId);
</script>

<li>
  <div
    class="flex w-full place-items-center gap-1 rounded-e-full pe-4 text-sm font-medium transition-colors hover:bg-subtle hover:text-immich-primary dark:hover:bg-immich-dark-gray dark:hover:text-immich-dark-primary {active
      ? 'bg-subtle text-immich-primary dark:text-immich-dark-primary'
      : 'dark:text-immich-dark-fg'}"
    style:padding-inline-start="{1.25 + depth}rem"
  >
    {#if children.length > 0}
      <button
        type="button"
        class="flex size-6 shrink-0 place-items-center justify-center rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"
        aria-expanded={expanded}
        aria-label={expanded ? $t('collapse') : $t('expand')}
        title={expanded ? $t('collapse') : $t('expand')}
        onclick={() => onToggle(album.id)}
      >
        <Icon
          icon={mdiChevronRight}
          size="18"
          class="transition-transform duration-150 {expanded ? 'rotate-90' : ''}"
        />
      </button>
    {:else}
      <span class="size-6 shrink-0"></span>
    {/if}

    <a
      href={Route.viewAlbum(album)}
      title={album.albumName}
      aria-current={active ? 'page' : undefined}
      class="flex min-w-0 grow place-items-center gap-3 py-2"
    >
      <span
        class="size-6 shrink-0 rounded-sm bg-gray-200 bg-cover dark:bg-gray-600"
        style={album.albumThumbnailAssetId
          ? `background-image:url('${getAssetMediaUrl({ id: album.albumThumbnailAssetId })}')`
          : ''}
      ></span>
      <span class="grow truncate">{album.albumName}</span>
    </a>
  </div>

  {#if expanded}
    <ul transition:slide={{ duration: 150 }}>
      {#each children as child (child.id)}
        <AlbumTreeNode album={child} depth={depth + 1} {activeId} {getChildren} {isExpanded} {onToggle} />
      {/each}
    </ul>
  {/if}
</li>
