'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { FolderOpen, LayoutDashboard, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const { isMobile, setOpen, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const activePath = (href: string) => pathname === href;
  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
      return;
    }

    setOpen(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img src="/icon.png" alt="Exavault logo" width="30" />
            <span className="text-xl group-data-[collapsible=icon]:hidden">
              Exavault
            </span>
          </div>
          <div title="Collapse/Expand sidebar">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-1 p-2 select-none">
          <SidebarMenuItem>
            <Link
              href="/files/2bcecc5f-089b-42b7-91fe-307ff392dea2"
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
              href="/trash/2bcecc5f-089b-42b7-91fe-307ff392dea2"
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
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
