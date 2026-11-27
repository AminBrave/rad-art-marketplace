import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspacePrimaryLinks } from '../workspaceNavigation';

export function AdminWorkspaceLayout() {
    const links = getWorkspacePrimaryLinks('admin');
    return <WorkspaceLayout title="پنل مدیریت" links={links} />;
}
