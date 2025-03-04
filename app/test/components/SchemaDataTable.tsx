"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { getFieldMetadata, formatValue, FieldType } from "../schemas";

// Types
export interface SchemaColumn {
  field: string;
  header: string;
  type: FieldType | string;
  sortable?: boolean;
  hidden?: boolean;
}

export interface SchemaDataTableProps<T extends Record<string, any>> {
  data: T[];
  schema: any;
  title?: string;
  description?: string;
  displayFields?: string[];
  onEdit?: (item: T) => void;
  searchPlaceholder?: string;
}

type SortDirection = "asc" | "desc" | null;

export function SchemaDataTable<T extends Record<string, any>>({
  data,
  schema,
  title,
  description,
  displayFields,
  onEdit,
  searchPlaceholder = "Search...",
}: SchemaDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Get field metadata from schema
  const columns = useMemo(() => {
    if (!schema.fields) return [];

    // If displayFields is provided, only use those fields
    const fieldNames = displayFields || Object.keys(schema.fields);

    return fieldNames
      .filter((field) => field !== "id") // Exclude id field from display
      .map((field) => {
        const metadata = getFieldMetadata(schema, field);
        return {
          field,
          header: metadata?.label || field, // Use label from metadata if available
          type: metadata?.type || "string", // Default to string
          sortable: true, // Enable sorting by default
          hidden: false, // Visible by default
        };
      });
  }, [schema, displayFields]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction, or clear if already descending
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // New sort field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Filter by search query
    if (searchQuery.trim()) {
      const lowercaseQuery = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return columns.some((column) => {
          const value = item[column.field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(lowercaseQuery);
        });
      });
    }

    // Sort data if sort field is set
    if (sortField && sortDirection) {
      const sortColumn = columns.find((col) => col.field === sortField);
      if (sortColumn) {
        result.sort((a, b) => {
          const valueA = a[sortField];
          const valueB = b[sortField];

          // Handle nulls and undefined
          if (valueA === null || valueA === undefined) return sortDirection === "asc" ? -1 : 1;
          if (valueB === null || valueB === undefined) return sortDirection === "asc" ? 1 : -1;

          // Sort based on data type
          switch (sortColumn.type) {
            case "number":
              return sortDirection === "asc"
                ? Number(valueA) - Number(valueB)
                : Number(valueB) - Number(valueA);
            case "boolean":
              return sortDirection === "asc"
                ? (valueA === valueB ? 0 : valueA ? 1 : -1)
                : (valueA === valueB ? 0 : valueA ? -1 : 1);
            case "date":
              const dateA = valueA instanceof Date ? valueA : new Date(valueA);
              const dateB = valueB instanceof Date ? valueB : new Date(valueB);
              return sortDirection === "asc"
                ? dateA.getTime() - dateB.getTime()
                : dateB.getTime() - dateA.getTime();
            default:
              // String comparison for other types
              const strA = String(valueA).toLowerCase();
              const strB = String(valueB).toLowerCase();
              return sortDirection === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
          }
        });
      }
    }

    return result;
  }, [data, searchQuery, columns, sortField, sortDirection]);

  // Render cell content based on data type
  const renderCellContent = (value: any, type: string) => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "outline"}>
            {value ? "Yes" : "No"}
          </Badge>
        );
      case "date":
        if (value instanceof Date) {
          return value.toLocaleDateString();
        } else if (typeof value === "string") {
          try {
            return new Date(value).toLocaleDateString();
          } catch (e) {
            return value;
          }
        }
        return String(value);
      case "email":
        return <a href={`mailto:${value}`} className="text-blue-500 hover:underline">{value}</a>;
      default:
        return formatValue(value, type as any);
    }
  };

  // Render sort icon based on current sort state
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead 
                    key={column.field}
                    className={column.sortable ? "cursor-pointer select-none" : ""}
                    onClick={() => column.sortable && handleSort(column.field)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && renderSortIcon(column.field)}
                    </div>
                  </TableHead>
                ))}
                {onEdit && <TableHead className="w-24">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (onEdit ? 1 : 0)}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                processedData.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${column.field}`}>
                        {renderCellContent(row[column.field], column.type)}
                      </TableCell>
                    ))}
                    {onEdit && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(row)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 