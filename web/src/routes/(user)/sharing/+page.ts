import { getAllAlbumsQuery } from '#lib/queries/album.query.ts';
import { queryClient } from '#lib/queries/client.ts';
import { authenticate } from '#lib/utils/auth.ts';
import { getFormatter } from '#lib/utils/i18n.ts';
import { PartnerDirection, getPartners } from '@immich/sdk';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
  await authenticate(url);
<<<<<<< HEAD
  // only top-level albums; sub-albums are reached through their parent
  const sharedAlbums = await getAllAlbums({ isShared: true, rootOnly: true });
=======
  await queryClient.query({ ...getAllAlbumsQuery({ isShared: true }), staleTime: 0 });
>>>>>>> v3.4.1
  const partners = await getPartners({ direction: PartnerDirection.SharedWith });
  const $t = await getFormatter();

  return {
    partners,
    meta: {
      title: $t('sharing'),
    },
  };
}) satisfies PageLoad;
