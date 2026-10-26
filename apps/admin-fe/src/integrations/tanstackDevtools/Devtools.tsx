import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

/**
 *
 */
export function TanstackDevtoolHandler() {
  if (process.env.NODE_ENV === "production") {
    return <></>;
  }

  return (
    <TanStackDevtools
      // The default Shift+A swallows a plain "a" in every input while it waits
      // to see if Shift follows; a modifier-only chord never collides with typing.
      config={{ position: "bottom-right", openHotkey: ["Control", "Alt", "D"] }}
      plugins={[
        {
          name: "Tanstack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        {
          name: "Tanstack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
      ]}
    />
  );
}
