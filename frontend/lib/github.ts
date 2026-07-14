const REPO = {
  owner: "SCodeGit",
  repo: "SCCOEPASCO",
  branch: "main",
};


export type GitItem = {
  name: string;
  path: string;
  type: string;
  download_url?: string;
};

export async function getGithubFolder(
  path: string = ""
): Promise<GitItem[]> {


  const url =
    `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${path}?ref=${REPO.branch}`;


  const res = await fetch(url);


  if (!res.ok) {
    throw new Error("Failed to fetch GitHub contents");
  }


  return res.json();

}
