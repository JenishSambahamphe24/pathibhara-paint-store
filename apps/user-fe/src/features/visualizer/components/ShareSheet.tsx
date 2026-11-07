import type { TShadeIndex } from "../helpers/look.helper";
import type { TLook } from "../types";
import type { RefObject } from "react";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { VISUALIZER_COMPONENTS } from "@repo/shared";

import { BUTTON_CLASSES } from "#/components/Button/buttonClasses";
import { HouseIllustration } from "#/components/HouseIllustration/HouseIllustration";
import { Swatch } from "#/components/Swatch/Swatch";

import {
  PAINT_PART_LABELS,
  UNPAINTED_HOUSE,
} from "#/features/colourSets/paintParts";
import { ContactHelper } from "#/lib/helpers/contact.helper";

import { LookHelper } from "../helpers/look.helper";

interface ShareSheetProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  look: TLook;
  index: TShadeIndex;
  // A picture of the 3D view; null when the drawing is showing instead.
  snapshot: string | null;
  url: string;
}

// A native <dialog>, opened with showModal(): it traps focus and closes on
// Escape without any extra code.
export function ShareSheet({
  dialogRef,
  look,
  index,
  snapshot,
  url,
}: ShareSheetProps) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {
      // Clipboard blocked: the link is still visible below to copy by hand.
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="share-title"
      onClose={() => setIsCopied(false)}
      className="m-0 mt-auto w-full max-w-none rounded-t-[18px] bg-surface p-4 text-ink backdrop:bg-black/45 wide:m-auto wide:max-w-[460px] wide:rounded-[18px]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2
            id="share-title"
            className="m-0 pt-1 font-display text-[32px] leading-none font-semibold uppercase"
          >
            Share this look
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
            className="flex size-tap items-center justify-center rounded-lg border border-line"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-[132px_1fr] gap-3">
          <div className="flex flex-col overflow-hidden rounded-lg bg-surface-2">
            {snapshot ? (
              <img
                src={snapshot}
                alt="Picture of this look"
                className="block size-[132px] object-cover"
              />
            ) : (
              <HouseIllustration
                colours={{
                  ...UNPAINTED_HOUSE,
                  ...LookHelper.colours(look, index),
                }}
                label="Drawing of this look"
                className="size-[132px] p-2"
              />
            )}
            <span className="border-t-2 border-pinstripe bg-sign-red pt-[3px] pb-px text-center font-display text-[17px] font-semibold text-sign-cream uppercase">
              Pathibhara Paints
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px]">
            {VISUALIZER_COMPONENTS.map((part) => (
              <li key={part} className="flex items-center gap-2">
                <Swatch
                  hex={LookHelper.shade(index, look[part])?.hex ?? null}
                  size={18}
                />
                <span>
                  <strong>{PAINT_PART_LABELS[part]}</strong>
                  <br />
                  {LookHelper.shadeLabel(look, part, index)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {snapshot && (
            <a
              href={snapshot}
              download="pathibhara-paints-look.png"
              className={`${BUTTON_CLASSES.secondary} min-h-12 text-[22px]`}
            >
              Save image
            </a>
          )}
          <button
            type="button"
            onClick={copyLink}
            className={`${BUTTON_CLASSES.secondary} min-h-12 text-[22px] ${snapshot ? "" : "col-span-2"}`}
          >
            {isCopied ? "Link copied" : "Copy link"}
          </button>
        </div>
        <a
          href={ContactHelper.whatsappShareHref(
            LookHelper.message(look, index, url),
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BUTTON_CLASSES.whatsapp} min-h-[50px] text-[22px]`}
        >
          <MessageCircle size={18} aria-hidden="true" />
          Share on WhatsApp
        </a>
        <p className="m-0 text-xs break-all text-muted">
          The link reopens this exact look: {url}
        </p>
      </div>
    </dialog>
  );
}
