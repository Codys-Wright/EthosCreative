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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getFieldMetadata, formatValue, FieldType } from "../schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onCreateNew?: () => void;
  searchPlaceholder?: string;
  pageSize?: number;
  actions?: Array<{
    name: string;
    label: string;
    icon?: string;
    className?: string;
  }>;
  onAction?: (action: string, item: T) => void;
  renderRowActions?: (item: T) => React.ReactNode;
}

type SortDirection = "asc" | "desc" | null;

export function SchemaDataTable<T extends Record<string, any>>({
  data,
  schema,
  title,
  description,
  displayFields,
  onEdit,
  onCreateNew,
  searchPlaceholder = "Search...",
  pageSize = 5,
  actions,
  onAction,
  renderRowActions,
}: SchemaDataTableProps<T>) {
  // Initialize sorting by order field if it exists in the data
  const hasOrderField = data.length > 0 && "order" in data[0];
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string | null>(
    hasOrderField ? "order" : null,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    hasOrderField ? "asc" : null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // Helper function to format field names
  const formatFieldName = (field: string) => {
    // Convert camelCase to Title Case
    const formatted = field
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    return formatted.trim();
  };

  // Get field metadata from schema
  const columns = useMemo(() => {
    // If displayFields is provided, use those fields directly
    if (displayFields && displayFields.length > 0) {
      return displayFields
        .filter((field) => field !== "id") // Exclude id field from display
        .map((field) => {
          // Try to get metadata if available
          const metadata = schema.fields
            ? getFieldMetadata(schema, field)
            : null;

          return {
            field,
            header: metadata?.label || formatFieldName(field), // Format field name if no label
            type: metadata?.type || "string", // Default to string
            sortable: true, // Enable sorting by default
            hidden: false, // Visible by default
          };
        });
    }

    // If no displayFields but schema has fields
    if (schema.fields) {
      return Object.keys(schema.fields)
        .filter((field) => field !== "id") // Exclude id field from display
        .map((field) => {
          const metadata = getFieldMetadata(schema, field);
          return {
            field,
            header: metadata?.label || formatFieldName(field),
            type: metadata?.type || "string",
            sortable: true,
            hidden: false,
          };
        });
    }

    // If schema has groups but no fields, collect fields from groups
    if (schema.groups) {
      const allFields = Object.values(schema.groups).flat();
      return allFields
        .filter((field) => field !== "id") // Exclude id field from display
        .map((field) => {
          // Ensure field is treated as string
          const fieldName = String(field);
          return {
            field: fieldName,
            header: formatFieldName(fieldName),
            type: "string", // Default type since we don't have metadata
            sortable: true,
            hidden: false,
          };
        });
    }

    // If no schema structure is available, just use first data item keys
    if (data && data.length > 0) {
      return Object.keys(data[0])
        .filter((field) => field !== "id") // Exclude id field from display
        .map((field) => {
          return {
            field,
            header: formatFieldName(field),
            type: typeof data[0][field] as FieldType,
            sortable: true,
            hidden: false,
          };
        });
    }

    return [];
  }, [schema, displayFields, data]);

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
          const value = item[column.field as string];
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
          if (valueA === null || valueA === undefined)
            return sortDirection === "asc" ? -1 : 1;
          if (valueB === null || valueB === undefined)
            return sortDirection === "asc" ? 1 : -1;

          // Sort based on data type
          switch (sortColumn.type) {
            case "number":
              return sortDirection === "asc"
                ? Number(valueA) - Number(valueB)
                : Number(valueB) - Number(valueA);
            case "boolean":
              return sortDirection === "asc"
                ? valueA === valueB
                  ? 0
                  : valueA
                    ? 1
                    : -1
                : valueA === valueB
                  ? 0
                  : valueA
                    ? -1
                    : 1;
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

  // Calculate pagination
  const totalItems = processedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure current page is valid
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  // Get current page data
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    const newPageSize = parseInt(value, 10);
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Render cell content based on data type
  const renderCellContent = (value: any, type: string, fieldName: string) => {
    if (value === null || value === undefined) return "--";

    // Special cases for specific field names regardless of detected type
    const lowerFieldName = fieldName.toLowerCase();
    if (
      lowerFieldName === "order" ||
      lowerFieldName === "numbervalue" ||
      lowerFieldName === "version"
    ) {
      // Ensure these are always treated as numbers
      const numValue = Number(value);
      return isNaN(numValue) ? value : numValue;
    }

    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "outline"}>
            {value ? "Yes" : "No"}
          </Badge>
        );
      case "date":
        try {
          return new Date(value).toLocaleDateString();
        } catch (e) {
          return value;
        }
      case "email":
        return (
          <a href={`mailto:${value}`} className="text-blue-500 hover:underline">
            {value}
          </a>
        );
      default:
        return formatValue(value, type as any);
    }
  };

  // Render sort icon based on current sort state
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          {onCreateNew && (
            <Button onClick={onCreateNew} className="whitespace-nowrap">
              Create New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={String(column.field)}
                    className={
                      column.sortable ? "cursor-pointer select-none" : ""
                    }
                    onClick={() =>
                      column.sortable && handleSort(String(column.field))
                    }
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && renderSortIcon(String(column.field))}
                    </div>
                  </TableHead>
                ))}
                {(onEdit || (actions && actions.length > 0)) && (
                  <TableHead className="w-24">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (onEdit || (actions && actions.length > 0) ? 1 : 0)
                    }
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={`${row.id}-${String(column.field)}`}>
                        {renderCellContent(
                          row[String(column.field)],
                          column.type,
                          String(column.field),
                        )}
                      </TableCell>
                    ))}
                    {(onEdit || actions?.length || renderRowActions) && (
                      <TableCell className="text-right">
                        {renderRowActions ? (
                          renderRowActions(row)
                        ) : (
                          <div className="flex justify-end space-x-2">
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(row)}
                                className="h-8 px-2"
                              >
                                Edit
                              </Button>
                            )}
                            {actions?.map((action) => (
                              <Button
                                key={action.name}
                                variant="ghost"
                                size="sm"
                                onClick={() => onAction?.(action.name, row)}
                                className={`h-8 px-2 ${action.className || ""}`}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div>
            Showing {Math.min(totalItems, 1 + (currentPage - 1) * itemsPerPage)}
            -{Math.min(totalItems, currentPage * itemsPerPage)} of {totalItems}{" "}
            items
          </div>
          <div className="flex items-center gap-1">
            <span>Rows per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Page</span>
          </Button>
          <div className="flex items-center gap-1 text-sm">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show a window of pages around current page
              let pageNum = currentPage;
              if (currentPage < 3) {
                pageNum = i + 1;
              } else if (currentPage > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              // Ensure we don't go out of bounds
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
