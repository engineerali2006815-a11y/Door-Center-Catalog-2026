export interface Door {
  id: string;
  code: string;
  name: string;
  quantity: number;
  imageUrl: string;
  style: string;
  material: string;
  color: string;
  description?: string;
  features?: string[];
  dimensions?: string;
}
