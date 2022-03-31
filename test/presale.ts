import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "@ethersproject/units";
import { IPresaleConfig } from "../interfaces/solidity/IPresaleConfig";

let contract: Contract;
let tokenAddress: string;

describe("Presale", () => {
  it("Should deploy token", async function () {
    const CustomToken = await ethers.getContractFactory("CustomERC20");
    const deployed = await CustomToken.deploy({ value: parseEther("1") });

    tokenAddress = deployed.address;
    console.log("Deployed to ", tokenAddress);
    expect(tokenAddress, "Token not deployed");
  });
  it("Should deploy", async function () {
    const PresaleToken = await ethers.getContractFactory("PresaleToken");
    const [owner] = await ethers.getSigners();
    const config: IPresaleConfig = {
      startTime: Math.floor(Date.now() / 1000).toString(),
      hardCap: parseEther("100"),
      softCap: parseEther("50"),
      minContribution: 0,
      maxContribution: 0,
      lockDays: 0,
      presaleDays: 3,
      whitelistOnly: false,
    };
    console.log("Before");

    contract = await (
      await PresaleToken.deploy(
        tokenAddress,
        owner.address,
        parseEther("10"),
        config
      )
    ).deployed();
  });
});
