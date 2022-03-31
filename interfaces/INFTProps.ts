export interface INFTProps {
  name: string;
  symbol: string;
  mintPrice: string;
  totalSupply: string;
  userMaxMint: string;
  coverImage: File | string;
  owner: string;
  startTime: number;
  endTime: number;
  publicMint: boolean;
  description: string;
  chainId: number;
}
