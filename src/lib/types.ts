export type VerifiedDoc = {
  id: string;
  domain: string;
  url: string;
  title: string;
  text: string;
};

export type VerifiedBundle = {
  version: number;
  updated_at: string;
  docs: VerifiedDoc[];
};
