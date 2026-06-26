import { createReader } from '@keystatic/core/reader';
import { createGitHubReader } from '@keystatic/core/reader/github';
import { cookies, draftMode } from 'next/headers';
import keystaticConfig from '../../keystatic.config';

const repository = 'oraffaud/stephan-real-estate-clean';

export async function getKeystaticNewsReader() {
  const draft = await draftMode();

  if (draft.isEnabled) {
    const cookieStore = await cookies();
    const branch = cookieStore.get('ks-branch')?.value;
    const token = cookieStore.get('keystatic-gh-access-token')?.value;

    if (branch && token) {
      return {
        reader: createGitHubReader(keystaticConfig, {
          repo: repository,
          ref: branch,
          token,
        }),
        isDraft: true,
      };
    }
  }

  return {
    reader: createReader(process.cwd(), keystaticConfig),
    isDraft: false,
  };
}
