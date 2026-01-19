export type Url = {
  id: string;
  shortCode: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
};

export type CreateUrlResponse = Url;

export type GetUrlsResponse = {
  urls: Url[];
  total: number;
};
