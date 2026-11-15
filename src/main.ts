const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('Root element #app was not found in index.html.');
}

appRoot.innerHTML = `
  <main style="font-family: 'Inter', sans-serif; padding: 2rem;">
    <h1>OJTFlow Frontend</h1>
    <p>Phase 1 foundation initialized. Ready for Phase 2 design tokens.</p>
  </main>
`;