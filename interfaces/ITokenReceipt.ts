import { BigNumberish } from "@ethersproject/bignumber";

export interface ITokenReceipt {
  recepient: string;
  sender: string;
  amount: BigNumberish;
  tokenAddress?: string;
  status: "Pending" | "Sent" | "Error";
}
