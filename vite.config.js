import { execFileSync } from 'node:child_process';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  let commit = process.env.GITHUB_SHA || '';
  if (!/^[a-f0-9]{40}$/i.test(commit)) {
    try {
      commit = execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: new URL('.', import.meta.url), encoding: 'utf8',
      }).trim();
    } catch {
      commit = '';
    }
  }
  return {
    define: {
      __BUILD_COMMIT__: JSON.stringify(commit),
      __IS_LOCAL_DEV__: JSON.stringify(command === 'serve'),
    },
  };
});
