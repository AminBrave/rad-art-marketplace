import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../AuthContext';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspacePrimaryLinks } from '../workspaceNavigation';

const emptyProfile = {
    display_name: '', display_name_en: '', bio: '', bio_en: '', city: '', city_en: '',
    website_url: '', instagram_handle: '', is_public: true,
};

export function ArtistWorkspaceLayout() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const profileKey = ['artist-profile', 'me', user?.id];
    const profileQuery = useQuery({
        queryKey: profileKey,
        queryFn: async ({ signal }) => {
            const { data } = await axios.get('/api/v1/artist-profile/me', { signal });
            return data.data ?? emptyProfile;
        },
        enabled: Boolean(user?.id),
        staleTime: 60_000,
    });
    const profile = profileQuery.data ?? (profileQuery.isError ? emptyProfile : null);
    const profileLoading = profileQuery.isPending;
    const profileError = profileQuery.isError
        ? (profileQuery.error?.response?.status === 403
            ? 'حساب فعلی اجازه مدیریت این پروفایل را ندارد.'
            : 'دریافت پروفایل هنرمند انجام نشد. می‌توانید دوباره تلاش کنید.')
        : '';
    const setProfile = (nextProfile) => queryClient.setQueryData(profileKey, nextProfile);
    const links = getWorkspacePrimaryLinks('artist');

    return (
        <WorkspaceLayout
            title="فضای هنرمند"
            links={links}
            outletContext={{ user, profile, setProfile, profileLoading, profileError }}
        />
    );
}
