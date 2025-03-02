import { TabDefinition } from "@/components/crud/data-editor-dialog";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { ExampleType } from "./example.type";

// define the tabs schema for examples
export const ExampleTabGroups: TabDefinition<ExampleType>[] = [
  {
    id: "basic",
    label: "Basic Information",
    fields: ["title", "subtitle"],
  },
  {
    id: "content",
    label: "Content",
    fields: ["content"],
  },
  {
    id: "metadata",
    label: "Metadata",
    fields: ["id", "createdAt", "updatedAt"],
  },
];

//define the field customization for examples

export const ExampleFields: FieldCustomizationRecord<ExampleType> = {
  id: {
    label: "ID",
    type: "text",
    readOnly: true,
  },
  title: {
    label: "Title",
    type: "text",
    placeholder: "Enter a title",
  },
  subtitle: {
    label: "Subtitle",
    type: "text",
    placeholder: "Enter a subtitle",
  },
  content: {
    label: "Content",
    type: "text",
    placeholder: "Enter content",
  },
  createdAt: {
    label: "Created At",
    type: "date",
    readOnly: true,
  },
  updatedAt: {
    label: "Updated At",
    type: "date",
    readOnly: true,
  },
};
