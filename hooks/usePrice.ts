import { useEffect, useState } from "react";

const usePrice = (
  ids: string[] = ["ethereum"],
  vs_currencies: string[] = ["usd"]
) => {
  const [price, setPrice] = useState<{
    [id: string]: {
      [currency: string]: number;
    };
  }>(
    ids.reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: vs_currencies.reduce(
          (p, c) => ({
            ...p,
            [c]: 0,
          }),
          {}
        ),
      }),
      {}
    )
  );

  useEffect(() => {
    fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
        ","
      )}&vs_currencies=${vs_currencies.join(",")}`
    )
      .then((res) => res.json())
      .then((data) => {
        setPrice(data);
      })
      .catch(() => {});
  }, []);

  return price;
};
export default usePrice;
