"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown } from "lucide-react";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { getSchemaFieldInfo, TabDefinition, isFieldRequired } from "./schema-utils";
import { FormFieldRenderer } from "./field-renderers";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

/**
 * Memoized component for tab content to prevent unnecessary re-renders
 */
const MemoizedTabContent = React.memo<{
  tab: TabDefinition<any>;
  fieldCustomizations: FieldCustomizationRecord<any>;
  schemaFields: Record<string, { type: any; required: boolean }>;
}>(({ tab, fieldCustomizations, schemaFields }) => {
  return (
    <>
      {tab.description && (
        <p className="text-muted-foreground mb-4">{tab.description}</p>
      )}
      {tab.fields.map((fieldName) => (
        <FormFieldRenderer
          key={fieldName as string}
          name={fieldName}
          fieldCustomizations={fieldCustomizations}
          schemaFields={schemaFields}
        />
      ))}
    </>
  );
});
MemoizedTabContent.displayName = "MemoizedTabContent";

/**
 * Props for the ResponsiveTabsList component
 */
interface ResponsiveTabsProps {
  tabs: TabDefinition<any>[];
  activeTab: string;
  onChange: (tabId: string) => void;
  countRequiredFields: (tabId: string) => number;
  countErrorFields: (tabId: string) => number;
  isSubmitted: boolean;
}

/**
 * Responsive tabs list component that displays tabs that fit in the available space
 * and moves overflow tabs into a dropdown menu
 */
const ResponsiveTabsList = ({
  tabs,
  activeTab,
  onChange,
  countRequiredFields,
  countErrorFields,
  isSubmitted,
}: ResponsiveTabsProps) => {
  const [visibleTabs, setVisibleTabs] = React.useState<TabDefinition<any>[]>([]);
  const [overflowTabs, setOverflowTabs] = React.useState<TabDefinition<any>[]>([]);
  const [showMore, setShowMore] = React.useState(false);
  const tabsListRef = React.useRef<HTMLDivElement>(null);

  // Calculate which tabs should be visible and which should be in the overflow menu
  React.useEffect(() => {
    const calculateVisibleTabs = () => {
      if (!tabsListRef.current) return;

      const tabsListWidth = tabsListRef.current.offsetWidth;
      const moreButtonWidth = 80; // Approximate width for the "More" button
      const maxWidth = tabsListWidth - moreButtonWidth;

      let currentWidth = 0;
      const visible: TabDefinition<any>[] = [];
      const overflow: TabDefinition<any>[] = [];

      // First, check if the active tab should be prioritized
      const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);
      let activeTabIncluded = false;

      // Calculate based on text content - approximate width per character plus padding
      for (let i = 0; i < tabs.length; i++) {
        // Estimate tab width based on text length (10px per character + 40px padding)
        const estimatedWidth = tabs[i].label.length * 10 + 40;

        // Always include active tab if possible
        if (i === activeTabIndex) {
          if (currentWidth + estimatedWidth <= maxWidth || visible.length < 2) {
            currentWidth += estimatedWidth;
            visible.push(tabs[i]);
            activeTabIncluded = true;
          } else {
            // If active tab doesn't fit, we'll handle it later
            overflow.push(tabs[i]);
          }
        } 
        // Include other tabs if there's space
        else if (currentWidth + estimatedWidth <= maxWidth || visible.length < 2) {
          // Always show at least 2 tabs if possible
          currentWidth += estimatedWidth;
          visible.push(tabs[i]);
        } else {
          overflow.push(tabs[i]);
        }
      }

      // If the active tab is in overflow but we have space for visible tabs,
      // swap the last visible tab with the active tab
      if (!activeTabIncluded && visible.length > 0 && overflow.includes(tabs[activeTabIndex])) {
        const lastVisibleTab = visible.pop()!;
        visible.push(tabs[activeTabIndex]);
        overflow.splice(overflow.indexOf(tabs[activeTabIndex]), 1);
        overflow.push(lastVisibleTab);
      }

      setVisibleTabs(visible);
      setOverflowTabs(overflow);
      setShowMore(overflow.length > 0);
    };

    calculateVisibleTabs();

    // Recalculate on window resize
    window.addEventListener("resize", calculateVisibleTabs);
    return () => {
      window.removeEventListener("resize", calculateVisibleTabs);
    };
  }, [tabs, activeTab]);

  // Handle tab selection from the overflow menu
  const handleOverflowTabSelect = (tab: TabDefinition<any>) => {
    onChange(tab.id);
  };

  // Mobile dropdown view
  const mobileView = (
    <div className="mb-2 md:hidden relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between pr-6 relative",
              // Apply special styling if current tab has required fields or errors
              isSubmitted && countErrorFields(activeTab) > 0 && "text-destructive border-destructive",
              !isSubmitted && countRequiredFields(activeTab) > 0 && "text-destructive/70 border-destructive/40"
            )}
          >
            <span>{tabs.find(t => t.id === activeTab)?.label || "Select tab"}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />

            {/* Position badges absolutely to avoid shifting content */}
            {isSubmitted && countErrorFields(activeTab) > 0 && (
              <Badge variant="destructive" className="absolute -top-2 right-0 text-[10px] px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                {countErrorFields(activeTab)}
              </Badge>
            )}
            {/* Always show required count badge regardless of errors */}
            {countRequiredFields(activeTab) > 0 && (
              <Badge variant="outline" className="absolute -top-2 right-7 text-[10px] px-1 py-0 h-5 min-w-5 border-destructive text-destructive flex items-center justify-center">
                {countRequiredFields(activeTab)}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[200px]">
          {tabs.map((tab) => {
            const requiredCount = countRequiredFields(tab.id);
            const errorCount = isSubmitted ? countErrorFields(tab.id) : 0;
            
            return (
              <DropdownMenuItem
                key={tab.id}
                className={cn(
                  "justify-between cursor-pointer",
                  tab.id === activeTab && "bg-accent font-medium",
                  errorCount > 0 && "text-destructive focus:text-destructive",
                  requiredCount > 0 && !errorCount && "text-destructive focus:text-destructive"
                )}
                onClick={() => onChange(tab.id)}
              >
                <span>{tab.label}</span>
                <div className="flex gap-1.5">
                  {errorCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                      {errorCount}
                    </Badge>
                  )}
                  {/* Always show required count regardless of errors */}
                  {requiredCount > 0 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 min-w-5 border-destructive text-destructive flex items-center justify-center ml-1">
                      {requiredCount}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Desktop tabs view with overflow dropdown
  const desktopView = (
    <div className="relative hidden md:block">
      <Tabs
        value={activeTab}
        onValueChange={onChange}
        className="relative w-full"
      >
        <div className="relative">
          <TabsList 
            ref={tabsListRef} 
            className="flex w-full overflow-visible bg-muted/50 rounded-md p-1"
          >
            {visibleTabs.map((tab) => {
              const requiredCount = countRequiredFields(tab.id);
              const errorCount = isSubmitted ? countErrorFields(tab.id) : 0;
              const hasErrors = errorCount > 0;
              
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className={cn(
                    "relative whitespace-nowrap flex-1 data-[state=active]:bg-background",
                    hasErrors && "text-destructive border-destructive hover:text-destructive hover:border-destructive",
                    !hasErrors && requiredCount > 0 && "text-destructive border-destructive hover:text-destructive hover:border-destructive"
                  )}
                >
                  {tab.label}
                  
                  {/* Show error badge if there are errors after submission */}
                  {hasErrors && (
                    <Badge 
                      variant="destructive" 
                      className="ml-2 text-xs"
                    >
                      {errorCount}
                    </Badge>
                  )}
                  
                  {/* Show required count badge if no errors */}
                  {!hasErrors && requiredCount > 0 && (
                    <Badge 
                      variant="outline" 
                      className="ml-2 text-xs border-destructive text-destructive flex items-center justify-center"
                    >
                      {requiredCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}

            {/* Overflow dropdown */}
            {showMore && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    aria-label={`More tabs${overflowTabs.some(tab => countRequiredFields(tab.id) > 0) ? ' with required fields' : ''}`}
                    title={overflowTabs.some(tab => countRequiredFields(tab.id) > 0) ? 'Some hidden tabs contain required fields' : 'More tabs'}
                    className={cn(
                      "px-3 ml-1 relative pr-8", // Increased right padding to make room for badge
                      // Apply red styling to match other tabs
                      overflowTabs.some(tab => countRequiredFields(tab.id) > 0) && 
                        "text-destructive border-destructive hover:text-destructive hover:border-destructive",
                      (isSubmitted && overflowTabs.some(tab => countErrorFields(tab.id) > 0)) && 
                        "text-destructive border-destructive hover:text-destructive hover:border-destructive",
                      overflowTabs.some(tab => tab.id === activeTab) && "bg-accent text-accent-foreground" // Selected state when an overflow tab is active
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>More</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    {/* Always show the required fields count badge if there are required fields */}
                    {overflowTabs.some(tab => countRequiredFields(tab.id) > 0) && (
                      <Badge 
                        variant="outline" 
                        className="absolute -top-2 right-1 h-5 min-w-[1.25rem] text-[10px] px-1 py-0 border-destructive text-destructive flex items-center justify-center"
                      >
                        {overflowTabs.reduce((total, tab) => total + countRequiredFields(tab.id), 0)}
                      </Badge>
                    )}
                    {/* Show error indicator if there are errors */}
                    {isSubmitted && overflowTabs.some(tab => countErrorFields(tab.id) > 0) && (
                      <div className="absolute -top-1 right-7 h-3 w-3 rounded-full bg-destructive animate-pulse" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  {overflowTabs.map((tab) => {
                    const requiredCount = countRequiredFields(tab.id);
                    const errorCount = isSubmitted ? countErrorFields(tab.id) : 0;
                    
                    return (
                      <DropdownMenuItem
                        key={tab.id}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeTab === tab.id && "bg-accent text-accent-foreground",
                          errorCount > 0 && "text-destructive focus:text-destructive",
                          requiredCount > 0 && !errorCount && "text-destructive focus:text-destructive"
                        )}
                        onClick={() => handleOverflowTabSelect(tab)}
                      >
                        <span>{tab.label}</span>
                        <div className="flex gap-1.5">
                          {errorCount > 0 && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5 min-w-5 flex items-center justify-center">
                              {errorCount}
                            </Badge>
                          )}
                          {/* Always show required count regardless of errors */}
                          {requiredCount > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 min-w-5 border-destructive text-destructive flex items-center justify-center ml-1">
                              {requiredCount}
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
};

/**
 * Component for non-tabbed form content
 */
const NonTabbedContent = React.memo<{
  tabs: TabDefinition<any>[];
  fieldCustomizations: FieldCustomizationRecord<any>;
  schemaFields: Record<string, { type: any; required: boolean }>;
}>(({ tabs, fieldCustomizations, schemaFields }) => {
  return (
    <div className="space-y-10 max-h-[75vh] overflow-y-auto pr-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="space-y-6">
          <div className="pb-2 border-b">
            <h3 className="text-lg font-medium">{tab.label}</h3>
            {tab.description && (
              <p className="text-muted-foreground text-sm mt-1">{tab.description}</p>
            )}
          </div>
          
          <div className="space-y-6">
            {tab.fields.map((fieldName) => (
              <FormFieldRenderer
                key={fieldName as string}
                name={fieldName}
                fieldCustomizations={fieldCustomizations}
                schemaFields={schemaFields}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
NonTabbedContent.displayName = "NonTabbedContent";

/**
 * Props for the TabbedSchemaForm component
 */
export type TabbedSchemaFormProps<T extends Record<string, any>> = {
  /** The schema to validate against */
  schema: ReturnType<typeof Schema.make<T>>;
  /** Initial values for the form */
  defaultValues?: Partial<T>;
  /** Whether to disable schema validation */
  disableValidation?: boolean;
  /** Field customizations to control the appearance and behavior of fields */
  fieldCustomizations?: FieldCustomizationRecord<T>;
  /** Tab definitions for organizing fields */
  tabs: TabDefinition<T>[];
  /** Function called when the form is submitted with valid data */
  onSubmit: (data: T) => void;
  /** Optional title for the form */
  title?: string;
  /** Optional description for the form */
  description?: string;
  /** Button text for the submit button (defaults to "Submit") */
  submitText?: string;
  /** Whether to show a reset button */
  showReset?: boolean;
  /** Whether to use tabbed mode (defaults to true) */
  tabbed?: boolean;
};

/**
 * A form component that renders fields based on an Effect schema and organizes them into tabs
 */
export function TabbedSchemaForm<T extends Record<string, any>>({
  schema,
  defaultValues = {} as Partial<T>,
  disableValidation = false,
  fieldCustomizations = {},
  tabs,
  onSubmit,
  title,
  description,
  submitText = "Submit",
  showReset = false,
  tabbed = true, // Default to tabbed mode
}: TabbedSchemaFormProps<T>) {
  // Create form with react-hook-form and effect-ts validation
  const form = useForm<T>({
    resolver: disableValidation ? undefined : effectTsResolver(schema),
    defaultValues: defaultValues as any,
  });

  // Extract schema field information
  const schemaFields = React.useMemo(
    () => getSchemaFieldInfo<T>(schema, defaultValues, fieldCustomizations),
    [schema, defaultValues, fieldCustomizations],
  );

  // State for active tab
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");
  
  // Ref to track the last processed submission count
  const lastProcessedSubmitRef = React.useRef(0);

  // Handle tab change - wrapper for setActiveTab
  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
    // Reset the submission tracking when user manually changes tabs
    lastProcessedSubmitRef.current = 0;
  }, []);

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  // Handle form reset
  const handleReset = () => {
    form.reset(defaultValues as any);
  };

  // Function to count required fields in a tab
  const countRequiredFields = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return 0;
    
    return tab.fields.filter(field => isFieldRequired(field, schemaFields)).length;
  };

  // Function to count fields with errors in a tab
  const countErrorFields = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return 0;
    
    const { errors } = form.formState;
    return tab.fields.filter(field => errors[field as string]).length;
  };

  // Get form state
  const { isSubmitted, submitCount, errors } = form.formState;
  
  // Switch to first tab with errors on submission with errors
  React.useEffect(() => {
    // Only process if using tabbed mode, this is a new submission, and there are errors
    if (tabbed && 
        isSubmitted && 
        Object.keys(errors).length > 0 && 
        lastProcessedSubmitRef.current !== submitCount) {
      
      // Update our ref to indicate we've processed this submission
      lastProcessedSubmitRef.current = submitCount;
      
      // Find the first tab with errors
      for (const tab of tabs) {
        const hasErrorInTab = tab.fields.some(
          fieldName => errors[fieldName as string]
        );
        
        if (hasErrorInTab) {
          // Switch to the first tab with errors
          setActiveTab(tab.id);
          break;
        }
      }
    }
  }, [tabbed, isSubmitted, submitCount, errors, tabs, setActiveTab]);

  // Scroll to first error when form is submitted (non-tabbed mode)
  React.useEffect(() => {
    if (!tabbed && 
        isSubmitted && 
        Object.keys(errors).length > 0 && 
        lastProcessedSubmitRef.current !== submitCount) {
      
      // Update our ref to indicate we've processed this submission
      lastProcessedSubmitRef.current = submitCount;
      
      // Find the first element with an error and scroll to it
      setTimeout(() => {
        const firstErrorField = document.querySelector('[aria-invalid="true"]');
        if (firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [tabbed, isSubmitted, submitCount, errors]);

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {tabbed ? (
              // Tabbed mode
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="border-b">
                  <ResponsiveTabsList
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={handleTabChange}
                    countRequiredFields={countRequiredFields}
                    countErrorFields={countErrorFields}
                    isSubmitted={isSubmitted}
                  />
                </div>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-6 pt-4">
                    <MemoizedTabContent 
                      tab={tab}
                      fieldCustomizations={fieldCustomizations}
                      schemaFields={schemaFields}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              // Non-tabbed mode - render all sections sequentially
              <NonTabbedContent
                tabs={tabs}
                fieldCustomizations={fieldCustomizations}
                schemaFields={schemaFields}
              />
            )}

            <div className="flex justify-end gap-2 pt-6 border-t mt-8">
              {showReset && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              )}
              <Button type="submit">{submitText}</Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  );
} 