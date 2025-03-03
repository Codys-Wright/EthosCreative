/**
 * Field Renderers
 * 
 * This module provides specialized field renderers for different field types and names.
 * It allows for automatic mapping of field names to specific UI components.
 */

import { GeneratedFieldType } from "@/components/crud/field-types";

// Import and re-export all field renderers
// Note: Uncomment these exports as the respective renderer components are implemented
export * from "./tags-renderer";
// export * from "./image-renderer";
// export * from "./avatar-renderer";
export * from "./date-renderer";

/**
 * Registry of field name patterns and their corresponding renderer types
 * This maps specific field names or patterns to renderer types
 */
export const fieldNameToRendererMapping: Record<string, {
  pattern: RegExp;
  rendererType: GeneratedFieldType;
  rendererComponent?: string; // For custom components beyond standard types
}> = {
  // Tags fields
  tags: {
    pattern: /^tags$/i,
    rendererType: "tags" as any
  },
  tagList: {
    pattern: /^tag(s|_?list)$/i,
    rendererType: "tags" as any
  },
  interests: {
    pattern: /^(interests|categories|topics|skills|hobbies)$/i,
    rendererType: "tags" as any
  },
  keywords: {
    pattern: /^(keywords|key_?words|labels|flags)$/i,
    rendererType: "tags" as any
  },
  
  // Image fields
  image: {
    pattern: /^(image|thumbnail|picture|photo)$/i,
    rendererType: "image"
  },
  coverImage: {
    pattern: /^(cover_?image|banner|header_?image)$/i,
    rendererType: "image" 
  },
  
  // Avatar/profile picture fields
  avatar: {
    pattern: /^(avatar|profile_?picture|profile_?image|user_?image)$/i,
    rendererType: "avatar"
  },
  
  // Rich text fields
  content: {
    pattern: /^(content|body|description|text|rich_?text)$/i,
    rendererType: "richtext"
  },
  
  // Date fields
  date: {
    pattern: /^(date|deadline|due_?date|start_?date|end_?date)$/i,
    rendererType: "date"
  },
  publishDate: {
    pattern: /^(publish_?date|publication_?date|posted_?at|posted_?date)$/i,
    rendererType: "date"
  },
  scheduledDate: {
    pattern: /^(scheduled_?date|schedule_?for|schedule_?at|planned_?date)$/i,
    rendererType: "date"
  },
  expiryDate: {
    pattern: /^(expiry_?date|expiration_?date|expires_?at|expire_?date)$/i,
    rendererType: "date"
  },
  
  // Status fields
  status: {
    pattern: /^(status|state)$/i,
    rendererType: "select" 
  },
  
  // URL/link fields
  url: {
    pattern: /^(url|link|website|web_?address)$/i,
    rendererType: "text"
  }
};

/**
 * Determines the renderer type based on the field name
 * @param fieldName The name of the field
 * @param defaultType The default renderer type if no match is found
 * @returns The appropriate renderer type for the field
 */
export function getRendererTypeFromFieldName(
  fieldName: string, 
  defaultType: GeneratedFieldType = "text"
): GeneratedFieldType {
  // Check if the field name matches any of our patterns
  for (const [key, mapping] of Object.entries(fieldNameToRendererMapping)) {
    if (mapping.pattern.test(fieldName)) {
      return mapping.rendererType;
    }
  }
  
  // Return the default type if no match is found
  return defaultType;
}

/**
 * Provides overrides for field types based on field names
 * This can be used to automatically apply the right renderer for common field names
 * @param fieldName The name of the field
 * @param currentType The current field type determined from schema or customizations
 * @returns The potentially overridden field type
 */
export function getFieldTypeOverride(
  fieldName: string,
  currentType: GeneratedFieldType
): GeneratedFieldType {
  // Only override if the current type is a basic type that might benefit from specialization
  if (currentType === "text" || currentType === "textarea") {
    return getRendererTypeFromFieldName(fieldName, currentType);
  }
  
  // Don't override already specialized types
  return currentType;
} 