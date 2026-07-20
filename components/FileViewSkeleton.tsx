import DesktopFileListSkeleton from './DesktopFIleListSkeleton';
import FileToolbarSkeleton from './FileToolbarSkeleton';
import MobileFileListSkeleton from './MobileFileListSkeleton';
import PaginationSkeleton from './PaginationSkeleton';

export default function FileViewSkeleton() {
  return (
    <>
      <FileToolbarSkeleton />
      <DesktopFileListSkeleton />
      <MobileFileListSkeleton />
      <PaginationSkeleton />
    </>
  );
}
