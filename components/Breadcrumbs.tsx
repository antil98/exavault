import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FileItem } from '@/types/file-type';
import { getFileById } from '@/lib/data';

export async function getBreadcrumbs(
  currentId: string,
  ownerId: string,
): Promise<FileItem[]> {
  const crumbs: FileItem[] = [];

  let node = await getFileById(currentId, ownerId);

  while (node) {
    crumbs.push(node);

    if (!node.parent_id) break;

    node = await getFileById(node.parent_id, ownerId);
  }

  return crumbs.reverse();
}

export default async function Breadcrumbs({
  currentFolderId,
  userId,
  fileViewPage,
}: {
  currentFolderId: string;
  userId: string;
  fileViewPage: 'files' | 'trash';
}) {
  const breadcrumbs = await getBreadcrumbs(currentFolderId, userId);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <div key={item.id} className="flex items-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {item.name === 'root' ? 'Home' : item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={`/${fileViewPage}/${item.id}`}>
                    {item.name === 'root' ? 'Home' : item.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
