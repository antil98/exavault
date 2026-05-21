'use client';

import { ButtonGroup } from '@/components/ui/button-group';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';


export function FileSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }

    params.set('page', '1');

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <Field className="w-100 my-3">
      <ButtonGroup>
        <Input
          placeholder="Type to search..."
          onChange={(event) => handleSearch(event.target.value)}
          defaultValue={searchParams.get('search')?.toString()}
        />
      </ButtonGroup>
    </Field>
  );
}

