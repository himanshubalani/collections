// types.ts
export interface Item {
  id: string;
  title: string;
  url?: string;
  image?: string;
  type: string;
  description?: string;
  author?: string;
  createdAt: string;
  collectionTitle?: string;
  collectionType?: string; 
}

export interface Collection {
  id: string;
  title: string;
  type: "BOOKS" | "VIDEOS" | "PODCASTS" | "LINKS" | "MOVIES";
  itemsCount: number;
  items: Item[];
}

export interface UserData {
  user: { 
    profileHandle: string; 
    firstName: string; 
    lastName: string 
  };
  collections: Collection[];
}