module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => {
    const lintableFiles = filenames.filter(
      (filename) => !filename.endsWith('.d.ts')
    );

    if (lintableFiles.length === 0) return [];

    return [
      `npx eslint --fix --max-warnings=0 --no-warn-ignored ${lintableFiles
        .map((filename) => `"${filename}"`)
        .join(' ')}`,
    ];
  },
  '**/*.{md,json}': (filenames) =>
    `npx prettier --write ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
};
