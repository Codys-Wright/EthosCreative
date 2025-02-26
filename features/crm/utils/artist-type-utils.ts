import { ArtistTypeData } from "@/landing-page/data/ArtistTypeData";
import { ArtistTypeCollection } from "../types/artist-type.schema";

/**
 * Creates a CRM object for artist types
 * @returns A CRM object containing artist types data
 */
export function createArtistTypeCrmObject() {
  return {
    name: "Artist Types Collection",
    category: "artistType",
    content: ArtistTypeData,
    metadata: {}
  };
}

/**
 * Example usage with the CRM service:
 * 
 * ```typescript
 * import { Effect as E } from "effect";
 * import { CrmService } from "../crm.service";
 * import { createArtistTypeCrmObject } from "./artist-type-utils";
 * 
 * const program = E.gen(function* () {
 *   const crmService = yield* CrmService;
 *   const artistTypeCrmObject = createArtistTypeCrmObject();
 *   const result = yield* crmService.create(artistTypeCrmObject);
 *   return result;
 * });
 * ```
 */ 