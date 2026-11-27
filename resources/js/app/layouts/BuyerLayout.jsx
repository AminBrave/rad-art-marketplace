import { useAuth } from '../AuthContext';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspacePrimaryLinks } from '../workspaceNavigation';

export function BuyerWorkspaceLayout() {
    const { user } = useAuth();
    const links = getWorkspacePrimaryLinks('buyer');
    return <WorkspaceLayout title="فضای خریدار" links={links} outletContext={{ user }} />;
}
