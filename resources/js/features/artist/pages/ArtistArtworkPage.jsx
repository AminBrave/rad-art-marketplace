import { useOutletContext } from 'react-router-dom';
import { ArtworkStudio } from '../../artworks';

export default function ArtistArtworkPage({ initialCreate = false }) {
    const { user, hasProfile, profileLoading } = useOutletContext();
    return <ArtworkStudio user={user} hasProfile={hasProfile} profileLoading={profileLoading} initialCreate={initialCreate} />;
}
