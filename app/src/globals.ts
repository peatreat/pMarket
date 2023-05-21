export type StickerObject = {
  name: string;
  image: string;
};

export type Item = {
  Name: string;
  Price: number;
  Discount: number;
  Image: string;
  Quality: string;
  Stickers: StickerObject[];
  Date: number;
  Link: string;
};
