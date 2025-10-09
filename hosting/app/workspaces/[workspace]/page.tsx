import WorkspacePageClient from './WorkspacePageClient';
import { resolveWorkspaceSlug, workspaceSlugs } from '../../capabilities';

export const dynamicParams = false;

export function generateStaticParams() {
  return workspaceSlugs.map((workspace) => ({ workspace }));
}


interface WorkspacePageProps {
  params: {
    workspace: string;
  };
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const workspaceKey = resolveWorkspaceSlug(params.workspace);

  return <WorkspacePageClient workspaceKey={workspaceKey} />;
}
