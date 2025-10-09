import WorkspacePageClient from './WorkspacePageClient';
import { resolveWorkspaceSlug, workspaceSlugs } from '../../capabilities';

export const dynamicParams = false;

export function generateStaticParams() {
  return workspaceSlugs.map((workspace) => ({ workspace }));
}


interface WorkspacePageProps {
  params: Promise<{
    workspace: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspace } = await params;
  const workspaceKey = resolveWorkspaceSlug(workspace);

  return <WorkspacePageClient workspaceKey={workspaceKey} />;
}
