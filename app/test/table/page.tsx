"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { CalendarIcon, Copy, Download, FileTextIcon, ImageIcon, Mail, MessageSquare, Star, UserIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { DataTable, DataTableColumnConfig, DateCalendarCell, ImageCell, ProfilePictureCell } from "@/components/crud/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExampleTS } from "@/features/example/types/example.type";
import { ExampleEditor } from "@/features/example/presentation/components/example-editor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";

// Define sample data for the table
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: "active" | "inactive" | "pending";
  lastLogin: Date | null;
  createdAt: Date;
  bio: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  inStock: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Sample data for User table
const sampleUsers: User[] = [
  {
    id: "user-001",
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
    role: "Admin",
    status: "active",
    lastLogin: new Date(2023, 5, 15, 10, 30),
    createdAt: new Date(2022, 1, 10),
    bio: "Product manager with 5+ years of experience"
  },
  {
    id: "user-002",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: "https://ui-avatars.com/api/?name=Jane+Smith&background=4F46E5&color=fff",
    role: "Editor",
    status: "active",
    lastLogin: new Date(2023, 5, 13, 14, 45),
    createdAt: new Date(2022, 3, 22),
    bio: "Content editor specializing in technical documentation"
  },
  {
    id: "user-003",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatar: null,
    role: "Viewer",
    status: "inactive",
    lastLogin: null,
    createdAt: new Date(2022, 4, 30),
    bio: "Marketing specialist with focus on digital campaigns"
  },
  {
    id: "user-004",
    name: "Sarah Williams",
    email: "sarah@example.com",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Williams&background=10B981&color=fff",
    role: "Editor",
    status: "pending",
    lastLogin: new Date(2023, 5, 1, 9, 15),
    createdAt: new Date(2022, 6, 5),
    bio: "UX designer with background in psychology"
  }
];

// Sample data for Products table
const sampleProducts: Product[] = [
  {
    id: "prod-001",
    name: "Premium Laptop",
    description: "High-performance laptop with latest specifications",
    price: 1299.99,
    category: "Electronics",
    image: "https://placehold.co/300x200/4F46E5/FFFFFF?text=Laptop",
    inStock: true,
    rating: 4.5,
    createdAt: new Date(2022, 3, 15),
    updatedAt: new Date(2023, 1, 20)
  },
  {
    id: "prod-002",
    name: "Wireless Headphones",
    description: "Noise-cancelling wireless headphones with long battery life",
    price: 199.99,
    category: "Audio",
    image: "https://placehold.co/300x200/10B981/FFFFFF?text=Headphones",
    inStock: true,
    rating: 4.2,
    createdAt: new Date(2022, 5, 10),
    updatedAt: new Date(2022, 11, 5)
  },
  {
    id: "prod-003",
    name: "Smart Watch",
    description: "Smart watch with health monitoring and notifications",
    price: 249.99,
    category: "Wearables",
    image: null,
    inStock: false,
    rating: 3.8,
    createdAt: new Date(2022, 7, 22),
    updatedAt: new Date(2023, 2, 15)
  },
  {
    id: "prod-004",
    name: "Professional Camera",
    description: "DSLR camera for professional photography",
    price: 899.99,
    category: "Photography",
    image: "https://placehold.co/300x200/F43F5E/FFFFFF?text=Camera",
    inStock: true,
    rating: 4.7,
    createdAt: new Date(2022, 2, 5),
    updatedAt: new Date(2022, 10, 12)
  }
];

// Sample data for Examples (for integration with ExampleEditor)
const sampleExamples: ExampleTS[] = [
  {
    id: "example-001" as any,
    title: "First Example",
    subtitle: "This is the first example",
    content: "This is the detailed content for the first example item.",
    createdAt: new Date(2022, 3, 15),
    updatedAt: new Date(2023, 1, 20),
    deletedAt: null
  },
  {
    id: "example-002" as any,
    title: "Second Example",
    subtitle: "A sample with longer subtitle text to demonstrate wrapping",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget fermentum aliquam, velit mi congue dolor, ut tincidunt justo nunc vel lectus.",
    createdAt: new Date(2022, 5, 10),
    updatedAt: new Date(2022, 11, 5),
    deletedAt: null
  },
  {
    id: "example-003" as any,
    title: "Third Example",
    subtitle: "Another example with medium length subtitle",
    content: "Content for the third example with specific details about this item.",
    createdAt: new Date(2022, 7, 22),
    updatedAt: new Date(2023, 2, 15),
    deletedAt: null
  }
];

// Status Badge component for user status
const StatusBadge = ({ status }: { status: User["status"] }) => {
  const variants = {
    active: "bg-green-100 text-green-800 hover:bg-green-200",
    inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  };

  return (
    <Badge className={variants[status]} variant="outline">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Rating component for products
const RatingDisplay = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <div className="flex mr-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < fullStars 
                ? "text-yellow-400 fill-yellow-400" 
                : i === fullStars && hasHalfStar 
                  ? "text-yellow-400" 
                  : "text-gray-300"
            }`} 
          />
        ))}
      </div>
      <span className="text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

// Price formatter for currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function TableExamplesPage() {
  // Example Editor state
  const [selectedExample, setSelectedExample] = useState<ExampleTS | undefined>(undefined);

  // Define column configurations for users table
  const userColumns: DataTableColumnConfig<User>[] = [
  
    {
      field: "avatar",
      header: "Avatar",
      width: 80,
      renderer: ({ value, row }) => (
        <ProfilePictureCell src={value} name={row.name} size="md" />
      )
    },
    {
      field: "name",
      header: "Name",
      sortable: true,
    },
    {
      field: "email",
      header: "Email",
      sortable: true,
    },
    {
      field: "role",
      header: "Role",
      sortable: true,
      width: 120,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      width: 120,
      renderer: ({ value }) => <StatusBadge status={value} />
    },
    {
      field: "lastLogin",
      header: "Last Login",
      sortable: true,
      width: 180,
      renderer: ({ value }) => <DateCalendarCell date={value} />
    },
    {
      field: "createdAt",
      header: "Created At",
      sortable: true,
      width: 180,
      renderer: ({ value }) => <DateCalendarCell date={value} />
    }
  ];

  // Define column configurations for products table
  const productColumns: DataTableColumnConfig<Product>[] = [
    {
      field: "id",
      header: "ID",
      sortable: true,
      width: 100
    },
    {
      field: "image",
      header: "Image",
      width: 100,
      renderer: ({ value, row }) => (
        <ImageCell src={value} alt={row.name} size="md" />
      )
    },
    {
      field: "name",
      header: "Product Name",
      sortable: true,
    },
    {
      field: "price",
      header: "Price",
      sortable: true,
      width: 120,
      align: 'right',
      renderer: ({ value }) => (
        <div className="font-medium">{formatPrice(value)}</div>
      )
    },
    {
      field: "category",
      header: "Category",
      sortable: true,
      width: 150,
    },
    {
      field: "rating",
      header: "Rating",
      sortable: true,
      width: 150,
      renderer: ({ value }) => <RatingDisplay rating={value} />
    },
    {
      field: "inStock",
      header: "In Stock",
      sortable: true,
      width: 120,
      renderer: ({ value }) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "In Stock" : "Out of Stock"}
        </Badge>
      )
    },
    {
      field: "createdAt",
      header: "Created",
      sortable: true,
      width: 180,
      renderer: ({ value }) => <DateCalendarCell date={value} />
    },
  ];

  // Define column configurations for examples table
  const exampleColumns: DataTableColumnConfig<ExampleTS>[] = [
    {
      field: "id",
      header: "ID",
      sortable: true,
      width: 100
    },
    {
      field: "title",
      header: "Title",
      sortable: true,
    },
    {
      field: "subtitle",
      header: "Subtitle",
      sortable: true,
    },
    {
      field: "content",
      header: "Content",
      sortable: false,
      width: 200,
      renderer: ({ value }) => (
        <div className="truncate max-w-[200px]" title={value}>
          {value}
        </div>
      )
    },
    {
      field: "createdAt",
      header: "Created At",
      sortable: true,
      width: 180,
      renderer: ({ value }) => <DateCalendarCell date={value} />
    },
    {
      field: "updatedAt",
      header: "Updated At",
      sortable: true,
      width: 180,
      renderer: ({ value }) => <DateCalendarCell date={value} />
    },
  ];

  // Custom actions for user table
  const userCustomActions = [
    {
      label: "Send Email",
      icon: <Mail className="h-4 w-4" />,
      onClick: (row: User) => {
        toast.success(`Email would be sent to ${row.email}`);
      }
    },
    {
      label: "View Messages",
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: (row: User) => {
        toast.info(`Viewing messages for ${row.name}`);
      },
      condition: (row: User) => row.status === "active" // Only show for active users
    }
  ];

  // Custom actions for product table
  const productCustomActions = [
    {
      label: "Download Specs",
      icon: <FileTextIcon className="h-4 w-4" />,
      onClick: (row: Product) => {
        toast.success(`Downloading specs for ${row.name}`);
      }
    },
    {
      label: "Export Data",
      icon: <Download className="h-4 w-4" />,
      onClick: (row: Product) => {
        toast.info(`Exporting data for ${row.name}`);
      }
    }
  ];

  // Handlers for example table
  const handleExampleEdit = (row: ExampleTS) => {
    setSelectedExample(row);
  };

  const handleExampleDelete = async (row: ExampleTS) => {
    // Simulate delete operation
    toast.success(`Deleted example: ${row.title}`);
    return true;
  };

  const handleCreateExample = () => {
    setSelectedExample(undefined);
    // Open the create dialog
    document.getElementById("create-example-button")?.click();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Data Table Examples</h1>
      <p className="text-muted-foreground mb-6">
        Showcase of the reusable DataTable component with various configurations
      </p>

      <Tabs defaultValue="users" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Records</TabsTrigger>
          <TabsTrigger value="products">Product Catalog</TabsTrigger>
          <TabsTrigger value="examples">Examples (with Editor)</TabsTrigger>
          <TabsTrigger value="usage">Usage Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Demonstrating user records with avatar display, status badges, and date formatting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sampleUsers}
                columns={userColumns}
                title="Users"
                description="Manage and view user accounts"
                idField="id"
                searchPlaceholder="Search users..."
                onEdit={(row) => toast.info(`Would edit user: ${row.name}`)}
                onDelete={async (row) => {
                  toast.success(`Deleted user: ${row.name}`);
                  return true;
                }}
                onCreateNew={() => toast.info("Would create a new user")}
                customActions={userCustomActions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                Showcasing products with images, price formatting, and rating display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sampleProducts}
                columns={productColumns}
                title="Products"
                description="Manage your product catalog"
                idField="id"
                searchPlaceholder="Search products..."
                onEdit={(row) => toast.info(`Would edit product: ${row.name}`)}
                onDelete={async (row) => {
                  toast.success(`Deleted product: ${row.name}`);
                  return true;
                }}
                onCreateNew={() => toast.info("Would create a new product")}
                customActions={productCustomActions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Examples with Editor Integration</CardTitle>
              <CardDescription>
                Demonstrating integration with the ExampleEditor component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QueryClientProvider client={queryClient}>
                <div className="mb-4 hidden">
                  <ExampleEditor edit={selectedExample} />
                  <Button id="create-example-button">
                    <ExampleEditor />
                  </Button>
                </div>

                <DataTable
                  data={sampleExamples}
                  columns={exampleColumns}
                  title="Examples"
                  description="Manage examples with integrated editor"
                  idField="id"
                  searchPlaceholder="Search examples..."
                  onEdit={handleExampleEdit}
                  onDelete={handleExampleDelete}
                  onCreateNew={handleCreateExample}
                />
              </QueryClientProvider>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Usage Guide</CardTitle>
              <CardDescription>
                How to implement and customize the DataTable component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-8">
                  {/* Basic Usage */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`import { DataTable } from "@/components/crud/data-table";

// Define your column configuration
const columns = [
  {
    field: "id",
    header: "ID",
    sortable: true
  },
  {
    field: "name",
    header: "Name",
    sortable: true
  },
  // ... more columns
];

// Use the DataTable component
<DataTable
  data={yourData}
  columns={columns}
  title="Your Title"
  description="Optional description"
  idField="id"
  onEdit={(row) => { /* handle edit */ }}
  onDelete={async (row) => {
    // Handle delete
    return true; // Return success status
  }}
  onCreateNew={() => { /* handle create new */ }}
/>
`}</pre>
                    </div>
                  </div>

                  {/* Custom Cell Renderers */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Custom Cell Renderers</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      The DataTable provides built-in cell renderers for common data types:
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">DateCalendarCell</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">ImageCell</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">ProfilePictureCell</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Copy className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">IdDisplay (automatic)</span>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`// Import the cell renderers
import { 
  DataTable, 
  DateCalendarCell, 
  ImageCell, 
  ProfilePictureCell 
} from "@/components/crud/data-table";

// Use them in your column definitions
const columns = [
  {
    field: "date",
    header: "Date",
    renderer: ({ value }) => <DateCalendarCell date={value} />
  },
  {
    field: "image",
    header: "Image",
    renderer: ({ value, row }) => (
      <ImageCell src={value} alt={row.name} size="md" />
    )
  },
  {
    field: "avatar",
    header: "Avatar",
    renderer: ({ value, row }) => (
      <ProfilePictureCell src={value} name={row.name} />
    )
  },
  // Create your own custom renderers
  {
    field: "status",
    header: "Status",
    renderer: ({ value }) => (
      <Badge variant={value === "active" ? "success" : "destructive"}>
        {value}
      </Badge>
    )
  }
]`}</pre>
                    </div>
                  </div>

                  {/* Custom Actions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Custom Context Menu Actions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add custom actions to the row context menu:
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`// Define custom actions
const customActions = [
  {
    label: "Send Email",
    icon: <Mail className="h-4 w-4" />,
    onClick: (row) => {
      // Handle action
    }
  },
  {
    label: "View Details",
    icon: <Eye className="h-4 w-4" />,
    onClick: (row) => {
      // Handle action
    },
    // Optional condition to show/hide this action
    condition: (row) => row.status === "active"
  }
];

// Use them in the DataTable
<DataTable
  data={data}
  columns={columns}
  customActions={customActions}
  // ... other props
/>
`}</pre>
                    </div>
                  </div>

                  {/* Integration with Editor */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Integration with Editor Components</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Integrate with editor components like ExampleEditor:
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <pre className="text-sm overflow-x-auto">
{`// State to track selected item
const [selectedItem, setSelectedItem] = useState(null);

// Handlers
const handleEdit = (row) => {
  setSelectedItem(row);
};

const handleCreate = () => {
  setSelectedItem(undefined);
  // Trigger create dialog
  document.getElementById("create-button")?.click();
};

// In your component
return (
  <>
    {/* Hidden trigger buttons */}
    <div className="hidden">
      <YourEditor item={selectedItem} />
      <Button id="create-button">
        <YourEditor />
      </Button>
    </div>

    {/* Table with edit/create handlers */}
    <DataTable
      data={data}
      columns={columns}
      onEdit={handleEdit}
      onCreateNew={handleCreate}
      // ... other props
    />
  </>
);
`}</pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 