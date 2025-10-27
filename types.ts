
export interface Recipe {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  createdAt: string;
}

export interface Ad {
  id: string;
  text: string;
  link: string;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  youtubeChannel: string;
  gistId: string;
  githubToken: string;
  adminUser: string;
  adminPass: string;
}

export interface AppData {
  settings: Settings;
  recipes: Recipe[];
  ads: Ad[];
}

export enum View {
  Home,
  RecipeDetail,
  Login,
  Admin,
}
