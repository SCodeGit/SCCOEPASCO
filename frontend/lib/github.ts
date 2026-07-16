  owner: "SCodeGit", repo: "SCCOEPASCO", branch: "main",
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

// Returns the direct raw URL for a given file path to open/download PDFs
export function getPDFUrl(path: string): string {
  return `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/${path}`;
}

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
