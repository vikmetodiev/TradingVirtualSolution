import React, { useEffect, useRef, useState } from "react";

interface Props {
  onImageChange: (image: File | string) => void;
}

export default function ImageUploader({ onImageChange }: Props) {
  const [selectionMode, setSelectionMode] = useState<"File" | "Link">("File");
  const [imageBase64, setImageBase64] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();
    reader.addEventListener("load", (ev) => {
      if (typeof ev.target.result === "string")
        setImageBase64(ev.target.result);
    });
    reader.readAsDataURL(file);
    onImageChange(file);
  };

  return selectionMode === "File" ? (
    <div className="img-up">
      <div
        className="img-wrap"
        onClick={() => {
          inputRef.current.click();
        }}
      >
        <input
          type="file"
          className="img-input"
          ref={inputRef}
          onChange={onSelectImage}
        />
        {imageBase64 === "" ? "+" : <img src={imageBase64} alt="*" />}
      </div>
      <button
        className="cng-btn"
        onClick={() => {
          setImageBase64("");
          setSelectionMode("Link");
        }}
      >
        Use Link
      </button>
    </div>
  ) : (
    <div style={{ display: "flex", gap: 10 }}>
      <input
        size={32}
        type="text"
        onChange={(e) => {
          onImageChange(e.target.value);
        }}
        placeholder="Image Link"
      />
      <button
        className="btn-basic"
        onClick={() => {
          setSelectionMode("File");
        }}
      >
        Use Image
      </button>
    </div>
  );
}
