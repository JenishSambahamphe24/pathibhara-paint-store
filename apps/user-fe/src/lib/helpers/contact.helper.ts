import { Config } from "#/lib/config";

export class ContactHelper {
  static phoneHref(): string {
    return `tel:${Config.store.phone}`;
  }

  // An optional pre-written message, e.g. shade codes from the visualizer.
  static whatsappHref(message?: string): string {
    const url = new URL(`https://wa.me/${Config.store.whatsappNumber}`);
    if (message) url.searchParams.set("text", message);
    return url.toString();
  }

  static mapHref(): string {
    return Config.store.mapUrl;
  }
}
