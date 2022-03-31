import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ITokenPresaleProps } from "../../../interfaces/ITokenPresaleProps";
import {
  getContractFile,
  getPresaleContractCode,
} from "../../../utils/SolidityUtils";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const { chainId, ...body } = JSON.parse(req.body) as {
    chainId: number;
  } & ITokenPresaleProps;
  try {
    const code = getPresaleContractCode(chainId, body);
    const cf = getContractFile("TokenPresale", code);
    res.json(cf);
  } catch (err) {
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
