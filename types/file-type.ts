export type FileItem = {
  id: string;
  parent_id: string | null;
  owner_id: string;
  name: string;
  url: string;
  size: number;
  file_type: string;
  created_at: string;
  is_dir: boolean;
  is_trashed: boolean;
  original_location: string;
  deleted_at: string;
};