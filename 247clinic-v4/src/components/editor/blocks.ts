/* Shared by the server-rendered Block and the client editor, so neither pulls the
   other's code in. */
export const BLOCK_TYPES = [
  { type: "TextImg", label: "Text + image" },
  { type: "Text", label: "Text" },
  { type: "FullImg", label: "Image" },
] as const;
export const BLOCK_PLACEHOLDER = { title: "New section title", body: "Write the text here." };
