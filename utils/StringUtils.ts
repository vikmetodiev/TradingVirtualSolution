import { NFT_META_ROOT } from "../constants/system";
import { INFTProps } from "../interfaces/INFTProps";
// import fs from "fs";

export type Formater = "txt" | "csv";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function mapAddresses(input: string, formater: Formater) {
  const clusters = input.replace(/\r\n/g, "\n").split("\n");
  return clusters.reduce((prev, curr) => {
    const item = curr.split(formater === "txt" ? "," : ";");
    if (item?.[0])
      return {
        ...prev,
        [item[0]]: item[1],
      };
    else return prev;
  }, {});
}

export function capitalize(input: string) {
  return input[0].toUpperCase() + input.slice(1);
}

export function normalizeString(input: string) {
  return capitalize(input).replace(/\W+/, "_");
}

function forceTwo(inp: number) {
  return inp.toString().padStart(2, "0");
}

export function formatHtmlDateTime(datetime: Date) {
  return `${datetime.getFullYear()}-${forceTwo(
    datetime.getMonth() + 1
  )}-${forceTwo(datetime.getDate())}T${forceTwo(
    datetime.getHours()
  )}:${forceTwo(datetime.getMinutes())}`;
}

export function toDateTimeString(datetime?: string | number) {
  if (!datetime) return "";
  const dateObj = new Date(datetime);
  return `${dateObj.getDate()}-${
    dateObj.getMonth() + 1
  }-${dateObj.getFullYear()} ${dateObj.toLocaleTimeString()}`;
}

export function toFormData(input: object) {
  const formData = new FormData();
  Object.keys(input).forEach((key) => {
    formData.append(key, input[key]);
  });
  return formData;
}

export function toERC721Metadata(props: INFTProps) {
  return {
    description: props.description,
    image: props.coverImage,
    name: props.name,
    external_url: NFT_META_ROOT,
    attributes: [],
  };
}

export function resolveIPFS(input: string) {
  if (input.startsWith("ipfs://"))
    return `https://ipfs.io/ipfs/${input.substring(7)}`;
  return input;
}

// export function log4js(log: any) {
//   const toWrite = typeof log === "string" ? log : JSON.stringify(log);
//   const date = new Date();
//   const fileName =
//     date.getFullYear().toString().substring(2) +
//     "-" +
//     date.getMonth().toString().padStart(2, "0") +
//     "-" +
//     date.getDate().toString().padStart(2, "0");
//   fs.appendFileSync(
//     "./logs/" + fileName + (typeof log === "string" ? ".txt" : ".json"),
//     toWrite
//   );
// }
