import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { getContractFile } from "../../../utils/SolidityUtils";
import { normalizeString } from "../../../utils/StringUtils";
import { IERC20TokenProps } from "../../../interfaces/IERC20TokenProps";
import { generateERC20TokenContract } from "../../../constants/codegen";

const handler = nextConnect<NextApiRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const config = JSON.parse(req.body) as IERC20TokenProps;
  try {
    const code = generateERC20TokenContract(config);
    const cf = getContractFile(normalizeString(config.name), code);
    res.json({
      abi: cf.abi,
      evm: cf.evm,
    });
  } catch (err) {
    console.log("ERROR TOKEN API: ", err);
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
