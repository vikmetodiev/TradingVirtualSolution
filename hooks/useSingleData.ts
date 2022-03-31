import { useMemo } from "react";

const useSingleData = (data: any[][]) => {
  return useMemo(
    () => data.map((data) => (!data || data.length < 1 ? undefined : data[0])),
    [data]
  );
};

export default useSingleData;
