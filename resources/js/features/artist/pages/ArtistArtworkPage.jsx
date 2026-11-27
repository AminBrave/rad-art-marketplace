import { useOutletContext } from 'react-router-dom';
import { ArtworkStudio } from '../../artworks';

export default function ArtistArtworkPage({ initialCreate = false }) {
    const { user, hasProfile } = useOutletContext();
    return <ArtworkStudio user={user} hasProfile={hasProfile} initialCreate={initialCreate} />;
}
