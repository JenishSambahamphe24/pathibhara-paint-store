import { useEffect, useState } from "react";

const TYPING_FIELDS =
  "input:not([type=checkbox]):not([type=radio]):not([type=button]), select, textarea";

// True while a form field has focus: on a phone that's when the keyboard is
// open, and a fixed bottom bar would sit on top of what's being typed.
export function useIsTyping(): boolean {
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    function update() {
      setIsTyping(
        document.activeElement instanceof Element &&
          document.activeElement.matches(TYPING_FIELDS),
      );
    }
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return isTyping;
}
