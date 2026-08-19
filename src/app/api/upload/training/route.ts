import { NextRequest } from "next/server";
import { handleImageAssetUpload } from "@/lib/upload-image";

export async function POST(request: NextRequest) {
  return handleImageAssetUpload(request, "trainings");
}
