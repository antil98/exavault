'use client';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export function FileSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Field className="w-100 my-3">
      <ButtonGroup>
        <Input
          placeholder="Type to search..."
          onChange={(event) => handleSearch(event.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
        />
        <Button variant="outline">Search</Button>
      </ButtonGroup>
    </Field>
  );
}
