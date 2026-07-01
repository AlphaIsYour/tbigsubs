export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("cloudinary_not_configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  const crypto = await import("crypto");
  const paramsToSign = `timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(file)]), filename);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`cloudinary_upload_failed: ${errText}`);
  }

  return response.json();
}
