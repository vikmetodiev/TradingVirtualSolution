import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getContractFile } from "../../../utils/SolidityUtils";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const body = JSON.parse(req.body);
  try {
    const cf = getContractFile(body.name, body.code);
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
