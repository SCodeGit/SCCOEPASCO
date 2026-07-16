const REPO = {
  owner: "SCodeGit",
  repo: "SCCOEPASCO",
  branch: "main",
};

export type GitItem = {
  name: string;
  path: string;
  type: string;
};

// Main function to fetch folder structure from GitHub API
export async function getGithubFolder(path: string = ""): Promise<GitItem[]> {
  const url = `https://api.github.com/repos/${REPO.owner}/${REPO.repo}/contents/${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return data.map((item: any) => ({
    name: item.name,
    path: item.path,
    type: item.type,
  }));
}

// Alias to match the import statement inside your SCodeAI component
export const fetchFolder = getGithubFolder;

// URL helper for directly linking to raw files
export function getPDFUrl(path: string) {
  return `https://raw.githubusercontent.com/${REPO.owner}/${REPO.repo}/${REPO.branch}/${path}`;
}
