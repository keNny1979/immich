import { sdkMock } from '$lib/__mocks__/sdk.mock';
import AlbumTree from '$lib/components/shared-components/side-bar/AlbumTree.svelte';
import { sidebarAlbumTreeExpanded } from '$lib/stores/preferences.store';
import { userInteraction } from '$lib/stores/user.svelte';
import { albumFactory } from '@test-data/factories/album-factory';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';

const pageState = vi.hoisted(() => ({ url: new URL('http://localhost/photos') }));
vi.mock('$app/state', () => ({ page: pageState }));

const flush = async () => {
  await tick();
  await tick();
};

describe('AlbumTree component', () => {
  const zoo = albumFactory.build({ albumName: 'Zoo' });
  const clients = albumFactory.build({ albumName: 'Aufträge', subAlbumCount: 1 });
  const client = albumFactory.build({ albumName: 'Müller', parentAlbumId: clients.id, subAlbumCount: 1 });
  const wedding = albumFactory.build({ albumName: '2026-05 Hochzeit', parentAlbumId: client.id });

  beforeEach(() => {
    userInteraction.sidebarAlbums = undefined;
    sidebarAlbumTreeExpanded.set([]);
    pageState.url = new URL('http://localhost/photos');
    sdkMock.getAllAlbums.mockResolvedValue([zoo, wedding, client, clients]);
  });

  it('lists top-level albums by name and hides sub-albums until expanded', async () => {
    render(AlbumTree);
    await flush();

    expect(sdkMock.getAllAlbums).toHaveBeenCalledWith({});
    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent?.trim())).toEqual(['Aufträge', 'Zoo']);
    expect(screen.queryByText('Müller')).toBeNull();
  });

  it('shows the sub-albums of an album when it is expanded', async () => {
    render(AlbumTree);
    await flush();

    await fireEvent.click(screen.getByRole('button', { expanded: false }));
    await flush();

    expect(screen.getByText('Müller')).toBeInTheDocument();
    expect(screen.queryByText('2026-05 Hochzeit')).toBeNull();
  });

  it('unfolds the tree down to the album that is open', async () => {
    pageState.url = new URL(`http://localhost/albums/${wedding.id}`);
    render(AlbumTree);
    await flush();
    await flush();

    expect(screen.getByText('Müller')).toBeInTheDocument();
    const current = screen.getByRole('link', { current: 'page' });
    expect(current).toHaveAttribute('href', `/albums/${wedding.id}`);
  });
});
