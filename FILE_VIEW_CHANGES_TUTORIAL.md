# File View Changes Tutorial

This note explains the file selection, sorting, layout, breadcrumb, size, and date formatting changes in simple terms.

The big idea behind most of these changes is this:

> Keep the important state in one place, then let desktop and mobile UI call into that same logic.

That way the app does not have one set of rules for desktop and a different secret set of rules for mobile.

## 1. Selection Checkboxes

The app already had a selection system. The important function is:

```ts
select(file.id, 'ctrl', orderedIds);
select('', 'toggle-all', orderedIds);
select('', 'clear', orderedIds);
```

That function comes from `useSelection`, and the actual rules live in `lib/update-selection.ts`.

So instead of making checkboxes with their own separate state, the checkboxes read from the existing selected IDs:

```tsx
checked={selectedIdSet.has(file.id)}
```

That means:

- If the file ID is selected, the checkbox is checked.
- If the file ID is not selected, the checkbox is unchecked.
- The checkbox does not manage selection by itself.

When a checkbox changes, it calls:

```tsx
select(file.id, 'ctrl', orderedIds)
```

In this app, `'ctrl'` means "toggle this item without clearing the other selected items."

That is why the checkboxes stay synced with:

- clicking rows
- long-tap selection
- `Select all`
- `Unselect all`
- bulk action clear selection

There is one source of truth: `selectedIds`.

## 2. Mobile Checkbox Replaces The File Icon

On mobile, the checkbox only appears after selection mode starts.

Selection mode is simply:

```ts
selectedIdSet.size > 0
```

So the mobile row does this:

```tsx
{selectionMode ? (
  <input type="checkbox" />
) : file.is_dir ? (
  <Folder />
) : (
  <File />
)}
```

In plain English:

- Normal mode: show the folder/file icon.
- Selection mode: replace that icon with a checkbox.

This keeps the row from getting too crowded on mobile.

## 3. Hold To Start Selecting On Mobile

Before, tapping a mobile row selected it immediately. That was annoying because a phone tap should usually mean "open this" or "interact with this", not always "select this."

So mobile now uses long press.

The mobile list stores a timer:

```ts
const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

When your finger goes down, the timer starts:

```ts
longPressTimerRef.current = setTimeout(() => {
  select(id, 'ctrl', orderedIds);
}, 450);
```

If your finger stays down long enough, the file is selected.

If you lift your finger quickly, the timer is cancelled:

```ts
clearTimeout(longPressTimerRef.current);
```

So the mobile behavior is:

- First long tap starts selection mode.
- After selection mode starts, normal taps toggle files.
- If no files are selected, normal touch taps do not select.

The app also prevents the browser's context menu on mobile long press:

```tsx
onContextMenu={(e) => e.preventDefault()}
```

That stops the browser from fighting the app's long-press selection behavior.

## 4. Desktop Selection Methods In Mobile Layout

Your layout switches to the mobile list based on width, not based on the physical device.

That means someone could be using:

- a half-width desktop browser
- a tablet with keyboard
- a tablet with mouse/trackpad
- a narrow window on a laptop

So the mobile layout now also understands desktop-style selection:

```ts
if (e.shiftKey) {
  select(id, 'shift', orderedIds);
}

if (e.ctrlKey || e.metaKey) {
  select(id, 'ctrl', orderedIds);
}
```

That gives the narrow layout the same keyboard/mouse selection behavior:

- `Shift + click`: range select
- `Ctrl + click`: toggle one file
- `Meta + click`: toggle one file on macOS-style keyboards

For plain mouse clicks in mobile layout, it behaves like desktop:

```ts
select(id, 'click', orderedIds);
```

For touch taps, it keeps the mobile long-press behavior.

## 5. Windows-Style Shift Selection

Selection is shared by desktop and mobile through:

- `hooks/useSelection.ts`
- `lib/update-selection.ts`
- `types/selection.ts`

So when the reducer changes, both layouts get the same behavior.

The selection state now tracks:

```ts
selectedIds: Set<string>;
lastSelectedId: string | null;
shiftSelectedIds: Set<string>;
```

Think of those like this:

- `selectedIds`: everything currently selected
- `lastSelectedId`: the anchor, meaning the last direct clicked/toggled item
- `shiftSelectedIds`: the files added by the current shift range

The Windows-like rule is:

> Click or Ctrl-click chooses the anchor. Shift-click selects the range from that anchor to the clicked item.

Example:

```txt
Ctrl-click file 1
Ctrl-click file 3
Shift-click file 10
```

The anchor is file `3`, because it was the last Ctrl-clicked item.

So the result is:

```txt
1, 3, 4, 5, 6, 7, 8, 9, 10
```

Then:

```txt
Shift-click file 5
```

The old shift range is replaced, not stacked.

Result:

```txt
1, 3, 4, 5
```

The reason for `shiftSelectedIds` is important. Without it, the app cannot tell which files were manually selected and which files came from the last shift range.

So before adding a new shift range, the reducer removes the old shift range:

```ts
state.shiftSelectedIds.forEach((itemId) => newSelected.delete(itemId));
```

Then it adds the new range.

This keeps repeated shift-clicks predictable.

## 6. Custom Sorting

Sorting is done client-side in `FileView.tsx`.

That means the app sorts the files it already loaded instead of asking the database for a new order.

The sorting state is:

```ts
const [sortKey, setSortKey] = useState<SortKey>('name');
const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
```

The possible sort keys are:

```ts
type SortKey = 'name' | 'type' | 'size' | 'date';
type SortDirection = 'asc' | 'desc';
```

The app creates a sorted copy:

```ts
const sortedFiles = useMemo(() => {
  return [...files].sort(...);
}, [files, sortKey, sortDirection]);
```

The important part is:

```ts
[...files]
```

JavaScript's `.sort()` changes the original array. Copying it first avoids mutating React data directly.

The UI now renders:

```tsx
sortedFiles.map((file) => ...)
```

instead of:

```tsx
files.map((file) => ...)
```

The selected order also follows the sorted order:

```ts
const orderedIds = sortedFiles.map((file) => file.id);
```

That matters for shift selection and select all. If the user sorts by size, selection follows what the user sees on screen.

## 7. Desktop Header Sorting

Desktop headers are clickable.

Clicking a header calls:

```ts
handleSort('name');
handleSort('type');
handleSort('size');
handleSort('date');
```

The sort logic is:

```ts
if (sortKey === nextSortKey) {
  flip asc/desc;
} else {
  switch to that column;
  start with asc;
}
```

So:

```txt
Click Name -> Name ascending
Click Name again -> Name descending
Click Size -> Size ascending
Click Size again -> Size descending
```

The headers also show direction icons.

## 8. Mobile Sorting Dropdown

Mobile does not have table headers, so sorting uses a dropdown.

The dropdown has values like:

```tsx
<option value="name:asc">Name A-Z</option>
<option value="name:desc">Name Z-A</option>
<option value="size:asc">Size smallest</option>
<option value="size:desc">Size largest</option>
```

When the user chooses an option, the app splits the value:

```ts
const [nextSortKey, nextSortDirection] = e.target.value.split(':');
```

Then it updates the same sorting state used by desktop.

Again, one source of truth.

## 9. FileView Refactor

`FileView.tsx` was getting too big.

It was responsible for:

- loading/rendering files
- sorting
- selection
- desktop rows
- mobile rows
- long-press behavior
- checkboxes
- bulk actions
- dialogs
- keyboard delete behavior

That is a lot for one component.

So it was split into smaller pieces:

```txt
components/FileView.tsx
components/FileToolbar.tsx
components/DesktopFileList.tsx
components/MobileFileList.tsx
components/FileViewTypes.ts
```

### FileView.tsx

This is still the owner of important state:

- files
- selected IDs
- sorting state
- delete dialogs
- empty trash dialog
- keyboard delete behavior

It passes props down to the smaller components.

### FileToolbar.tsx

This handles:

- Select all / Unselect all
- mobile sort dropdown
- selected count
- bulk actions

### DesktopFileList.tsx

This handles:

- desktop table/grid rows
- desktop checkboxes
- desktop header sorting
- desktop context menu/dropdown action menus

### MobileFileList.tsx

This handles:

- mobile rows
- long press
- touch behavior
- mobile checkbox/icon swap
- keyboard/mouse modifiers in narrow layout

### FileViewTypes.ts

This stores shared small types:

```ts
FileViewPage
SortKey
SortDirection
SelectFiles
```

The goal was not to make the app "fancy." The goal was to make each file easier to understand.

## 10. Trash Restore Limbo Fix

There was a bug where a file could be restored into a deleted or still-trashed folder.

The app stores hierarchy with:

```txt
parent_id
```

And trash state with:

```txt
is_trashed
original_location
```

When a file is trashed, `original_location` remembers where it used to be.

The bug happened like this:

```txt
1. File is inside Folder A.
2. File is trashed.
3. Folder A is trashed or permanently deleted.
4. File is restored by itself.
5. File tries to restore back into Folder A.
6. Folder A is gone or invisible.
7. File goes into limbo.
```

The fix was in `restoreFiles`.

Restore now checks the original parent:

- If the original parent exists and is not trashed, restore there.
- If the original parent is being restored in the same operation, restore there.
- If the original parent is missing or still trashed, restore to the user's root folder.

That prevents files from pointing at dead folder IDs.

## 11. Breadcrumb Scrollbar

Long folder paths can overflow the page.

The breadcrumbs are server-rendered because they fetch data from the database.

But scrolling to the right needs client-side DOM access.

So a small client wrapper was added:

```txt
components/BreadcrumbScroller.tsx
```

It receives the rendered breadcrumbs as children.

Inside it, a ref points to the scroll container:

```ts
const scrollerRef = useRef<HTMLDivElement>(null);
```

After render, it scrolls all the way to the right:

```ts
scroller.scrollLeft = scroller.scrollWidth;
```

This means when the breadcrumb path is too long, the current folder is visible by default.

The server component still does the database work. The client component only handles scrolling.

## 12. File Size Formatting

Before, file sizes were displayed like this:

```tsx
{(file.size / 1024).toFixed(1)} KB
```

That always showed KB, even if the file was huge.

Now there is a helper:

```txt
lib/format-file-size.ts
```

It moves to the next unit when the number passes `999`.

So it can show:

```txt
999 B
1 KB
999 KB
1 MB
999 MB
1 GB
```

It uses:

```ts
Intl.NumberFormat
```

That lets the browser format numbers in the user's language.

For example, different locales may use:

```txt
1.5 MB
1,5 MB
```

depending on the browser language.

## 13. Browser Locale Hook

The app needs the browser's language for size and date formatting.

So this hook was added:

```txt
hooks/useBrowserLocale.ts
```

It reads:

```ts
navigator.languages?.[0] ?? navigator.language ?? 'en'
```

That gives the user's browser language.

It uses `useSyncExternalStore` instead of `useEffect + setState`, because this repo's lint rules complain about setting state directly inside effects.

## 14. Date And Time Formatting

Before, dates used:

```ts
new Date(file.created_at).toLocaleDateString()
```

That only showed the date.

Now there is a helper:

```txt
lib/format-file-date.ts
```

It uses:

```ts
Intl.DateTimeFormat
```

with:

```ts
day: '2-digit',
month: '2-digit',
year: 'numeric',
hour: '2-digit',
minute: '2-digit',
```

So dates include time too.

In a Spanish-style locale, it looks like:

```txt
01/07/2026, 14:30
```

The exact separator/order can still adapt to the browser locale, but the day and month stay two digits and the year stays full.

## 15. Why These Changes Are Structured This Way

Most of the changes follow the same pattern:

```txt
Put shared behavior in one helper or reducer.
Let desktop and mobile call that shared behavior.
Keep UI components focused on rendering and input events.
```

Examples:

- Selection rules live in `update-selection.ts`.
- Size formatting lives in `format-file-size.ts`.
- Date formatting lives in `format-file-date.ts`.
- Browser locale lives in `useBrowserLocale.ts`.
- Desktop rendering lives in `DesktopFileList.tsx`.
- Mobile rendering lives in `MobileFileList.tsx`.

This keeps the app easier to reason about.

When behavior changes, you usually change one shared place instead of hunting through both desktop and mobile layouts.

