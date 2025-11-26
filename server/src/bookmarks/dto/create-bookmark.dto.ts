export class CreateBookmarkDto {
  title: string;
  url: string;
  description?: string;
  tags?: string[]; // e.g. ["Tech", "News"]
}
