import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getContractFile } from "../../../utils/SolidityUtils";
import { INFTProps } from "../../../interfaces/INFTProps";
import { getNFTContract } from "../../../constants/nftcodegen";
import pinata from "../../../constants/pinata";
import { toERC721Metadata } from "../../../utils/StringUtils";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const config = JSON.parse(req.body) as INFTProps;

  try {
    const pinataRes = await pinata.pinJSONToIPFS(toERC721Metadata(config));
    const baseURI = `ipfs://${pinataRes.IpfsHash}`;
    const code = getNFTContract(config, baseURI);
    const cf = getContractFile("CointoolNFT", code);
    res.json(cf);
  } catch (err) {
    console.log("ER ", err);

    res.statusCode = 400;
    res.json(err);
  }
});

export const config = {
  abi: {
    bodyParser: true,
  },
};

export default handler;
