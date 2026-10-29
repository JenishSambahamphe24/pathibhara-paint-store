export interface IContent {
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface IFile {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  blurHash: string | null;
  altText: string | null;
}
