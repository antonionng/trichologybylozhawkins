import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/server/schema";

const getSupabaseAdminClient = () => {
  const env = getServerEnv();
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

export const getStorageBucket = () => getServerEnv().SUPABASE_STORAGE_BUCKET;

export const uploadToStorage = async (input: {
  path: string;
  bytes: Uint8Array;
  contentType: string;
  upsert?: boolean;
}) => {
  const client = getSupabaseAdminClient();
  const bucket = getStorageBucket();
  const { error } = await client.storage.from(bucket).upload(input.path, input.bytes, {
    contentType: input.contentType,
    upsert: input.upsert ?? false,
  });
  if (error) {
    throw new Error(error.message);
  }

  return { bucket, path: input.path };
};

export const createSignedDownloadUrl = async (path: string, expiresInSeconds = 60 * 10) => {
  const client = getSupabaseAdminClient();
  const bucket = getStorageBucket();
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error) {
    throw new Error(error.message);
  }
  return data.signedUrl;
};

export const getPublicUrl = (path: string) => {
  const env = getServerEnv();
  const bucket = env.SUPABASE_STORAGE_BUCKET;
  return `${env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

export const createSignedUploadUrl = async (path: string) => {
  const client = getSupabaseAdminClient();
  const bucket = getStorageBucket();
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(path);
  if (error) {
    throw new Error(error.message);
  }
  return { signedUrl: data.signedUrl, path: data.path, token: data.token };
};



