const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER!;
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO!;
const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH!;

export async function getGithubFolder(path = "") {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("GitHub fetch failed");
  }

  return res.json();
