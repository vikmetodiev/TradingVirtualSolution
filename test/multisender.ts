import { Contract } from "ethers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "@ethersproject/units";

let contract: Contract;

// describe("MultiSender", () => {
//   it("Should deploy", async function () {
//     const MultiSender = await ethers.getContractFactory("MultiSender");
//     const [owner] = await ethers.getSigners();
//     contract = await (await MultiSender.deploy(owner.address)).deployed();
//   });
//   it("Should send ether", async function () {
//     const result = await contract.functions.sendNative(
//       ["0xC047f6bE8260246378848ab9b1A605F95933691f"],
//       [parseUnits("0.01", 18)],
//       { value: parseUnits("0.02", 18) }
//     );
//     console.log(result);
//   });
// });
