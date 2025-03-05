// Field types for CRUD components
// Shared between DataTable and DataEditorDialog

// Type for generated field types
export type GeneratedFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "select"
  | "checkbox"
  | "combobox"    // Multi-select tag input
  | "image"       // Image upload/display
  | "avatar"      // Profile picture with avatar fallback
  | "richtext";   // Rich text editor

// Unified field customization type for both table and editor dialog
export type FieldCustomization = {
  // Display properties
  label?: string;                // Custom label override
  description?: string;          // Field description or help text
  placeholder?: string;          // Custom placeholder text
  
  // Field type and options
  type?: GeneratedFieldType;     // Override the auto-detected field type
  options?: { label: string; value: string }[]; // For select fields
  
  // Visibility and access control
  hidden?: boolean;              // Whether to hide this field in forms
  readOnly?: boolean;            // Whether the field is read-only (non-editable)
  updateOnly?: boolean;          // Whether this field should only appear in update forms, not creation forms
  
  // Validation behavior
  required?: boolean;            // Explicitly set if field is required (overrides schema inference)
};

// Helper type for field customization records
export type FieldCustomizationRecord<T extends Record<string, any>> = 
  Partial<Record<keyof T & string, FieldCustomization>>; 