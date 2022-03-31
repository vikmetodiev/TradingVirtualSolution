import { BigNumberish } from "@ethersproject/bignumber";

export interface ITokenPresaleProps {
  presaleRate: BigNumberish;
  softCap: number;
  hardCap: number;
  minContributionLimit: BigNumberish;
  maxContributionLimit: BigNumberish;
  startTime: Date;
  presaleDays: number;
  whitelistOnly: boolean;
  owner: string;
}
