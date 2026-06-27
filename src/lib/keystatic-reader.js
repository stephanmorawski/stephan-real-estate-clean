import { createReader } from '@keystatic/core/reader';
import { createGitHubReader } from '@keystatic/core/reader/github';
import { cookies, draftMode } from 'next/headers';
import keystaticConfig from '../../keystatic.config';

const repository = 'stephanmorawski/stephan-real-estate-clean';
const localReader = createReader(process.cwd(), keystaticConfig);

export async function getKeystaticNewsReader() {
  let isDraftModeEnabled = false;

  // draftMode() throws when this helper is called from generateStaticParams.
  // In that build-time context, the local repository reader is the correct source.
  try {
    const draft = await draftMode();
    isDraftModeEnabled = draft.isEnabled;
  } catch {
    isDraftModeEnabled = false;
  }

  if (isDraftModeEnabled) {
    const cookieStore = await cookies();
    const branch = cookieStore.get('ks-branch')?.value;
    const token = cookieStore.get('keystatic-gh-access-token')?.value;

    if (branch) {
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
    reader: localReader,
    isDraft: false,
  };
}

