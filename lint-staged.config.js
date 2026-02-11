module.exports = {
  '**/*.{js,jsx,ts,tsx}': (filenames) => [
    `npx eslint --fix --max-warnings=0 ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
  ],
  '**/*.{md,json}': (filenames) =>
    `npx prettier --write ${filenames
      .map((filename) => `"${filename}"`)
      .join(' ')}`,
};
