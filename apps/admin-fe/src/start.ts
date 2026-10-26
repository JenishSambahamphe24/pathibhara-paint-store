import { createStart } from "@tanstack/react-start";

// The admin panel is behind a login and never indexed, so routes render only
// in the browser: the server sends the root shell, and the auth guard and
// data fetching all run client-side.
export const startInstance = createStart(() => ({ defaultSsr: false }));
