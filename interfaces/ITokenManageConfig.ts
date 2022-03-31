export interface ITokenManageConfig {
  changeOwner?: string;
  mint?: {
    recipient: string;
    amount: string;
  };
  burn?: string;
}
