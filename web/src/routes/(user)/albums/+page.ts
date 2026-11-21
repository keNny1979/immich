import { getAllAlbumsQuery } from '#lib/queries/album.query.ts';
import { queryClient } from '#lib/queries/client.ts';
import { authenticate } from '#lib/utils/auth.ts';
import { getFormatter } from '#lib/utils/i18n.ts';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
  await authenticate(url);
<<<<<<< HEAD
  // only top-level (root) albums are listed; sub-albums are shown inside their parent album
  const sharedAlbums = await getAllAlbums({ isShared: true, rootOnly: true });
  const albums = await getAllAlbums({ isOwned: true, rootOnly: true });
=======
  await queryClient.query({ ...getAllAlbumsQuery(), staleTime: 0 });
>>>>>>> v3.4.1
  const $t = await getFormatter();

  return {
    meta: {
      title: $t('albums'),
    },
  };
}) satisfies PageLoad;
