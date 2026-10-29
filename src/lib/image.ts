/**
 * Turns a chosen photo into a small square data URL for an avatar, cropped to the centre.
 * Phase 1 keeps it in the demo data; Phase 2 uploads the file to storage instead.
 */
export function toAvatar(file: File, size = 160): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d")?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file is not an image we can read."));
    };
    img.src = url;
  });
}

/** Checks a photo before upload. Returns what is wrong and what to do, or nothing when it is fine. */
export function photoProblem(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Choose a JPG, PNG or WebP photo.";
  if (file.size > 5 * 1024 * 1024) return "That photo is over 5 MB. Choose a smaller one.";
  return undefined;
}
