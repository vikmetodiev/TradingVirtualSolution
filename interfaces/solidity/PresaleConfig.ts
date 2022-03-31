import { BigNumberish } from "@ethersproject/bignumber";

export class PresaleConfig {
  startTime: BigNumberish;
  presaleDays: BigNumberish;
  lockDays: BigNumberish;
  softCap: BigNumberish;
  hardCap: BigNumberish;
  minContribution: BigNumberish;
  maxContribution: BigNumberish;
  whitelistOnly: boolean;

  static mapFromArray(array: any[]) {
    return {
      startTime: array[0],
      presaleDays: array[1],
      lockDays: array[2],
      softCap: array[3],
      hardCap: array[4],
      minContribution: array[5],
      maxContribution: array[6],
      whitelistOnly: array[7],
    } as PresaleConfig;
  }
}
