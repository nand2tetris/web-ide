import type JSZip from "jszip";

export async function zip(
  files: {
    name: string;
    content: Promise<string>;
  }[],
): Promise<string> {
  const zip = await newZip();
  for (const file of files) {
    zip.file(file.name, await file.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  return url;
}

export async function newZip(): Promise<JSZip> {
  const { default: JSZip } = await import("jszip");

  const zip = new JSZip();
  return zip;
}
