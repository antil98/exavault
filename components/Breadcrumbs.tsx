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
import { House } from 'lucide-react';
import BreadcrumbScroller from '@/components/BreadcrumbScroller';

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
  const scrollKey = breadcrumbs.map((item) => item.id).join('/');

  return (
    <Breadcrumb className="mx-auto min-w-0 max-w-full">
      <BreadcrumbScroller scrollKey={scrollKey}>
        <BreadcrumbList className="w-max flex-nowrap whitespace-nowrap">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <div key={item.id} className="flex items-center gap-2">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {item.name === 'root' ? (
                        <div className="flex items-center gap-2 text-xl">
                          <House className="w-5 h-5 text-accent" />{' '}
                          <BreadcrumbSeparator className="text-xl font-semibold">
                            /
                          </BreadcrumbSeparator>
                          Home
                        </div>
                      ) : (
                        <span className="text-xl">{item.name}</span>
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={`/${fileViewPage}/${item.id}`}>
                      {item.name === 'root' ? (
                        <div className="flex items-center gap-2 text-xl">
                          <House className="w-5 h-5 text-accent" />
                          <BreadcrumbSeparator className="text-xl font-semibold">
                            /
                          </BreadcrumbSeparator>
                          Home
                        </div>
                      ) : (
                        <span className="text-xl">{item.name}</span>
                      )}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator className="text-xl font-semibold">
                    /
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </BreadcrumbScroller>
    </Breadcrumb>
  );
}
