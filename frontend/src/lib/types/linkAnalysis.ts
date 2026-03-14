export interface LinkAnalysisResponse {
  title: string;
  description: string | null;
  suggestedTags: TagSuggestion[] | null;
  suggestedFolder: FolderSuggestion | null;
}

export interface TagSuggestion {
  tagName: string;
  isExisting: boolean;
}

export interface FolderSuggestion {
  memberFolderId: number | null;
  folderName: string;
  isExisting: boolean;
}
