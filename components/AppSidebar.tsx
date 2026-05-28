'use client';

import { Show, SignOutButton, UserButton } from '@clerk/nextjs';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { FolderOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import CreateFolder from './CreateFolder';
import FileUpload from './FileUpload';

export function AppSidebar({ rootFolderId }: { rootFolderId: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const params = useParams<{ folderId?: string }>();
  const isTrashRoute = pathname.startsWith('/trash/');
  const currentFolderId = isTrashRoute
    ? rootFolderId
    : (params.folderId ?? rootFolderId);

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex h-14 flex-row items-center justify-between px-3 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <div className="flex flex-row gap-2 items-center group-data-[collapsible=icon]:hidden">
            <img src="/icon.png" alt="Exavault logo" width="30" />
            <span className="text-xl group-data-[collapsible=icon]:hidden">
              Exavault
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div title="Collapse/Expand sidebar">
              <SidebarTrigger />
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-2 py-3 group-data-[collapsible=icon]:py-2">
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 select-none">
              <SidebarMenuItem>
                <FileUpload
                  currentFolderId={currentFolderId}
                  buttonLabel={
                    isTrashRoute ? 'Upload to My files' : 'Select files'
                  }
                  successMessage={
                    isTrashRoute
                      ? 'Files uploaded to My files'
                      : 'Files uploaded successfully!'
                  }
                />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <CreateFolder
                  currentFolderId={currentFolderId}
                  buttonLabel={
                    isTrashRoute ? 'New folder in My files' : 'New folder'
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 py-3 group-data-[collapsible=icon]:py-2">
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 select-none">
              <SidebarMenuItem>
                <Link
                  href={`/files/${rootFolderId}`}
                  className="w-full"
                  onClick={closeSidebar}
                >
                  <SidebarMenuButton
                    className="w-full"
                    isActive={pathname.startsWith('/files')}
                  >
                    <FolderOpen />
                    My files
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link
                  href={`/trash/${rootFolderId}`}
                  className="w-full"
                  onClick={closeSidebar}
                >
                  <SidebarMenuButton
                    className="w-full"
                    isActive={pathname.startsWith('/trash')}
                  >
                    <Trash2 />
                    Recycle bin
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Show when="signed-in">
          <div className="flex items-center justify-between p-1 shrink-0 group-data-[collapsible=icon]:hidden">
            <UserButton showName/>
            <SignOutButton />
          </div>
        </Show>
      </SidebarFooter>
    </Sidebar>
  );
}
