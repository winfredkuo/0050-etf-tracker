export interface InvestmentRecord {
  id: string;
  date: string;
  amount: number;
  price: number;
  shares: number;
  profileId: string;
}

export interface Profile {
  id: string;
  name: string;
  color: string;
}
