import React, { useRef } from "react";

export default function CopyToClipboard({
  children,
  data,
}: {
  children: any;
  data: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onCopyClick = () => {
    console.log(inputRef.current);

    inputRef.current?.select?.();
    inputRef.current?.setSelectionRange?.(0, 99999);
    navigator.clipboard.writeText(inputRef.current.value);
  };
  return (
    <span onClick={onCopyClick} style={{ cursor: "copy" }}>
      <input
        type="text"
        ref={inputRef}
        value={data}
        readOnly={true}
        style={{ display: "none" }}
      />
      {children}
    </span>
  );
}
