const AVIF_BRANDS = new Set(["avif", "avis"]);

export class MimeSniffHelper {
  // The type the bytes actually are, for the image formats we accept. The
  // browser-declared type is client-controlled, so it never decides alone.
  static imageType(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;
    if (buffer.toString("ascii", 4, 8) === "ftyp") {
      return AVIF_BRANDS.has(buffer.toString("ascii", 8, 12)) ? "image/avif" : null;
    }
    if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
      return "image/webp";
    }
    if (buffer.toString("ascii", 0, 4) === "GIF8") return "image/gif";
    if (buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") return "image/png";
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
    return null;
  }
}
