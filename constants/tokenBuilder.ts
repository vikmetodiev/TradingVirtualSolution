export const DEFAULT_DEFLATION = (account: string) =>
  ({
    taxReceiverAddress: account,
    autoLPPercent: 5,
    burnFeePercent: 0,
    buybackFeePercent: 0,
    holdersRewardPercent: 5,
    taxPercent: 0,
    buyBackTax: 0,
  } as const);
