export interface IPresaleManageConfig {
    changeOwner?: string;
    hardCap?: string
    softCap?: string
    maxContribution?: string
    minContribution?: string
    startTime?: number
    presaleDays?: number
    presaleRate?: string
    whitelistOnly?: boolean
    whitelist?: string[]
}
