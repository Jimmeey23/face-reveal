import { createClient } from "@supabase/supabase-js";
import type { Person } from "../types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucket = "people-photos";
const signedUrlTtlSeconds = 60 * 60 * 24 * 7;

export const isSupabaseConfigured = Boolean(url && anonKey);
const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null;

type StoredPerson = {
  id: string;
  name: string;
  baby_path: string;
  adult_path: string;
  fun_fact: string | null;
  years_apart: number | null;
};

function getClient() {
  if (!supabase) {
    throw new Error("Connect Supabase by setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}

async function getUserId() {
  const client = getClient();
  const { data: { user }, error: sessionError } = await client.auth.getUser();
  if (sessionError) throw sessionError;
  if (user) return user.id;

  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw new Error(`Couldn't start a private Supabase session: ${error.message}`);
  if (!data.user) throw new Error("Supabase did not return a user session.");
  return data.user.id;
}

async function toImageBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error("Couldn't prepare the selected photo for upload.");
  return response.blob();
}

async function signedImageUrl(path: string) {
  const { data, error } = await getClient().storage.from(bucket).createSignedUrl(path, signedUrlTtlSeconds);
  if (error) throw error;
  return data.signedUrl;
}

async function toPerson(row: StoredPerson): Promise<Person> {
  const [babyImage, adultImage] = await Promise.all([signedImageUrl(row.baby_path), signedImageUrl(row.adult_path)]);
  return {
    id: row.id,
    name: row.name,
    babyImage,
    adultImage,
    funFact: row.fun_fact ?? undefined,
    yearsApart: row.years_apart ?? undefined,
    custom: true,
  };
}

export async function loadCustomPeople(): Promise<Person[]> {
  const client = getClient();
  await getUserId();
  const { data, error } = await client
    .from("custom_people")
    .select("id, name, baby_path, adult_path, fun_fact, years_apart")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Promise.all((data as StoredPerson[]).map(toPerson));
}

export async function saveCustomPerson(person: Person): Promise<Person> {
  const client = getClient();
  const userId = await getUserId();
  const id = crypto.randomUUID();
  const basePath = `${userId}/${id}`;
  const babyPath = `${basePath}/baby.jpg`;
  const adultPath = `${basePath}/adult.jpg`;
  const uploadedPaths: string[] = [];

  try {
    for (const [path, dataUrl] of [[babyPath, person.babyImage], [adultPath, person.adultImage]] as const) {
      const { error } = await client.storage.from(bucket).upload(path, await toImageBlob(dataUrl), {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (error) throw error;
      uploadedPaths.push(path);
    }

    const { data, error } = await client
      .from("custom_people")
      .insert({
        id,
        name: person.name,
        baby_path: babyPath,
        adult_path: adultPath,
        fun_fact: person.funFact ?? null,
        years_apart: person.yearsApart ?? null,
      })
      .select("id, name, baby_path, adult_path, fun_fact, years_apart")
      .single();
    if (error) throw error;
    return await toPerson(data as StoredPerson);
  } catch (error) {
    if (uploadedPaths.length) await client.storage.from(bucket).remove(uploadedPaths);
    throw error;
  }
}

export async function deleteCustomPerson(id: string): Promise<string | null> {
  const client = getClient();
  await getUserId();
  const { data, error: readError } = await client
    .from("custom_people")
    .select("baby_path, adult_path")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  const { error } = await client.from("custom_people").delete().eq("id", id);
  if (error) throw error;

  const { error: storageError } = await client.storage.from(bucket).remove([data.baby_path, data.adult_path]);
  return storageError?.message ?? null;
}
