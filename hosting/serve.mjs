import { createPreviewServer } from '../scripts/preview.mjs';

// The release contains the exact same allowlisted site and vercel.json as the
// public deployment. Inventory is fixed for this process; publish restarts the
// existing scheduled task only after a complete new release has been verified.
const server = await createPreviewServer({ compressHtml: true });
server.on('error', error => {
  // A second sign-in/start request should leave the existing host alone.
  if (error.code === 'EADDRINUSE') process.exit(0);
  console.error(error);
  process.exit(1);
});
server.listen(18787, '127.0.0.1', () => console.log('The Twelve collections are ready on 127.0.0.1:18787'));
