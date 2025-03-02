import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { ArtistTypeType } from "./artist-type.type";

/**
 * Field customizations for the ArtistType entity
 * These customizations control the appearance and behavior of fields in forms and tables
 */
export const ArtistTypeFields: FieldCustomizationRecord<ArtistTypeType> = {
  title: {
    label: "Artist Type Title",
    description: "The primary name of this artist type",
    placeholder: "Enter artist type title...",
    required: true,
  },
  subtitle: {
    label: "Subtitle",
    description: "A secondary name or brief tagline",
    placeholder: "Brief subtitle or alternate name...",
    required: false,
  },
  elevatorPitch: {
    type: "textarea",
    label: "Elevator Pitch",
    description: "A concise explanation of this artist type (30-second pitch)",
    placeholder: "Describe this artist type in a few sentences...",
    required: false,
  },
  description: {
    type: "textarea",
    label: "Full Description",
    description: "Detailed description of this artist type",
    placeholder: "Enter a comprehensive description...",
    required: false,
  },
  blog: {
    label: "Blog Content",
    description: "Blog article related to this artist type",
    placeholder: "Blog content is stored as structured data",
    required: false,
  },
  tags: {
    label: "Tags",
    description: "Keywords associated with this artist type",
    placeholder: "E.g., painter, digital, abstract, etc.",
    required: false,
  },
  icon: {
    label: "Icon Reference",
    description: "Reference to an icon representing this artist type",
    placeholder: "Icon path or reference ID",
    required: false,
  },
  metadata: {
    label: "Metadata",
    description: "Additional structured data for this artist type",
    placeholder: "Metadata is stored as JSON",
    required: false,
  },
  notes: {
    type: "textarea",
    label: "Internal Notes",
    description: "Additional internal notes about this artist type",
    placeholder: "Internal notes visible only to administrators...",
    required: false,
  },
  version: {
    type: "number",
    label: "Version Number",
    description: "The current version of this artist type record",
    placeholder: "1.0",
    required: false,
  },
  id: {
    readOnly: true,
    label: "Artist Type ID",
    description: "Unique identifier for this artist type (system-generated)",
    required: false,
  },
  createdAt: {
    readOnly: true,
    label: "Created Date",
    description: "When this artist type was first created",
    required: false,
  },
  updatedAt: {
    readOnly: true,
    label: "Last Updated",
    description: "When this artist type was last modified",
    required: false,
  },
  deletedAt: {
    readOnly: true,
    label: "Deleted Date",
    description: "When this artist type was deleted (if applicable)",
    required: false,
  },
}; 