import { getGithubFolder } from "./github";

export async function scanAcademicRepository(
  path = ""
): Promise<any[]> {

  const items = await getGithubFolder(path);
  let results: any[] = [];

  for (const item of items) {
    const gitItem = item as any;

    if (gitItem.type === "dir") {
      const children = await scanAcademicRepository(gitItem.path);
      results = [
        ...results,
        ...children
      ];
    }

    if (
      gitItem.type === "file" &&
      gitItem.name.toLowerCase().endsWith(".pdf")
    ) {
      results.push({
        name: gitItem.name,
        path: gitItem.path,
        download: gitItem.download_url
      });
    }
  }

  return results;
}
