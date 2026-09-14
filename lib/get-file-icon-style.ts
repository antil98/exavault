type FileIconStyle = {
  container: string;
  icon: string;
};

const styles = {
  archive: {
    container: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
    icon: 'text-orange-600 dark:text-orange-300',
  },
  document: {
    container: 'bg-blue-500/12 text-blue-700 dark:text-blue-300',
    icon: 'text-blue-600 dark:text-blue-300',
  },
  image: {
    container: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
    icon: 'text-violet-600 dark:text-violet-300',
  },
  pdf: {
    container: 'bg-red-500/12 text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-300',
  },
  spreadsheet: {
    container: 'bg-green-500/12 text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-300',
  },
  folder: {
    container: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-300',
  },
  generic: {
    container: 'bg-muted text-muted-foreground',
    icon: 'text-muted-foreground',
  },
} satisfies Record<string, FileIconStyle>;

export default function getFileIconStyle(
  name: string,
  fileType: string,
  isDirectory: boolean,
): FileIconStyle {
  if (isDirectory) return styles.folder;

  const value = `${name} ${fileType}`.toLowerCase();

  if (value.includes('.pdf') || value.includes('application/pdf')) {
    return styles.pdf;
  }

  if (
    /\.(xls|xlsx|csv)(?:\s|$)/.test(value) ||
    value.includes('spreadsheet') ||
    value.includes('excel') ||
    value.includes('text/csv')
  ) {
    return styles.spreadsheet;
  }

  if (
    value.includes('image/') ||
    /\.(png|jpe?g|gif|webp|svg)(?:\s|$)/.test(value)
  ) {
    return styles.image;
  }

  if (
    value.includes('zip') ||
    value.includes('archive') ||
    /\.(zip|rar|7z|tar|gz)(?:\s|$)/.test(value)
  ) {
    return styles.archive;
  }

  if (
    value.includes('text/') ||
    value.includes('document') ||
    /\.(docx?|txt|md|rtf)(?:\s|$)/.test(value)
  ) {
    return styles.document;
  }

  return styles.generic;
}
