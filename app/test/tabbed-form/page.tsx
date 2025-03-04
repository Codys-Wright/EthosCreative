"use client";

import { useState } from "react";
import { Schema as S } from "effect";
import { toast } from "sonner";
import { TabbedSchemaForm } from "@/components/data-editing/tabbed-schema-form";
import { TabDefinition } from "@/components/data-editing/schema-utils";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define a schema for our form using Effect.Schema
const UserSchema = S.Struct({
  // Personal Information
  name: S.String.pipe(S.minLength(1)),
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.between(18, 120)),
  bio: S.NullOr(S.String),
  profileImage: S.NullOr(S.String),
  
  // Preferences
  theme: S.Literal("light", "dark", "system"),
  newsletter: S.Boolean,
  notifications: S.Boolean,
  
  // Interests
  interests: S.Array(S.String),
  primaryInterest: S.NullOr(S.String),
  experienceLevel: S.Literal("beginner", "intermediate", "advanced"),
  
  // Account Settings
  username: S.String.pipe(S.minLength(1)),
  password: S.String.pipe(S.minLength(1)),
  confirmPassword: S.String.pipe(S.minLength(1)),
  twoFactorEnabled: S.Boolean,
  
  // Payment Methods
  creditCardNumber: S.String.pipe(S.minLength(1), S.pattern(/^.+$/)),
  expiryDate: S.String,
  cvv: S.String,
  cardholderName: S.String,
  billingAddress: S.NullOr(S.String),
  paymentType: S.Literal("credit", "debit", "paypal", "other"),
  
  // Privacy Settings
  dataSharing: S.Boolean,
  marketingConsent: S.Boolean,
  privacyPolicyAccepted: S.Boolean,
  dataRetentionPeriod: S.Literal("30days", "90days", "1year", "forever"),
  privacyContactEmail: S.String.pipe(S.minLength(1)),
  gdprConsent: S.Boolean,
  thirdPartyTracking: S.Boolean,
  customPrivacyNote: S.NullOr(S.String),
  
  // Additional Information
  companyName: S.NullOr(S.String),
  jobTitle: S.String.pipe(S.minLength(1)),
  yearsOfExperience: S.Number,
  preferredLanguage: S.Literal("english", "spanish", "french", "german", "other"),
  referralSource: S.NullOr(S.String),
  
  // Notification Settings
  emailNotificationsFrequency: S.Literal("never", "daily", "weekly", "monthly"),
  pushNotificationsEnabled: S.Boolean,
  smsNotificationsEnabled: S.Boolean,
  notificationTypes: S.Array(S.String),
});

// Define a type from the schema
type UserType = typeof UserSchema.Type;

// Define field customizations
const UserFields: FieldCustomizationRecord<UserType> = {
  name: {
    label: "Full Name",
    placeholder: "Enter your full name",
    description: "Your first and last name",
  },
  email: {
    label: "Email Address",
    placeholder: "your.email@example.com",
    description: "We'll never share your email with anyone else",
  },
  age: {
    type: "number",
    label: "Age",
    placeholder: "Enter your age",
    description: "You must be at least 18 years old",
  },
  bio: {
    type: "textarea",
    label: "Biography",
    placeholder: "Tell us about yourself",
    description: "A short description about yourself (optional)",
  },
  profileImage: {
    type: "text",
    label: "Profile Image URL",
    placeholder: "https://example.com/image.jpg",
    description: "URL to your profile image",
  },
  theme: {
    type: "select",
    label: "Theme Preference",
    placeholder: "Select theme",
    description: "Choose your preferred theme",
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System Default" },
    ],
  },
  newsletter: {
    type: "checkbox",
    label: "Subscribe to Newsletter",
    description: "Receive updates about our products and services",
    placeholder: "Subscribe to newsletter",
  },
  notifications: {
    type: "checkbox",
    label: "Enable Notifications",
    description: "Receive notifications about account activity",
  },
  interests: {
    type: "tags" as any,
    label: "Interests",
    placeholder: "Select or create interests",
    description: "Select topics you're interested in or type your own",
    options: [
      { value: "technology", label: "Technology" },
      { value: "science", label: "Science" },
      { value: "arts", label: "Arts" },
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
      { value: "literature", label: "Literature" },
      { value: "travel", label: "Travel" },
      { value: "cooking", label: "Cooking" },
      { value: "gaming", label: "Gaming" },
      { value: "photography", label: "Photography" },
    ] as any
  },
  primaryInterest: {
    type: "select",
    label: "Primary Interest",
    placeholder: "Select your primary interest",
    description: "Choose the topic you're most interested in",
    options: [
      { value: "technology", label: "Technology" },
      { value: "science", label: "Science" },
      { value: "arts", label: "Arts" },
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
    ],
  },
  experienceLevel: {
    type: "select",
    label: "Experience Level",
    placeholder: "Select your experience level",
    description: "Your overall experience level in your interests",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  username: {
    label: "Username",
    placeholder: "Choose a username",
    description: "This will be your public identifier",
  },
  password: {
    type: "text",
    label: "Password",
    placeholder: "Enter your password",
    description: "Choose a strong password",
  },
  confirmPassword: {
    type: "text",
    label: "Confirm Password",
    placeholder: "Confirm your password",
    description: "Re-enter your password to confirm",
  },
  twoFactorEnabled: {
    type: "checkbox",
    label: "Enable Two-Factor Authentication",
    description: "Add an extra layer of security to your account",
  },
  // Payment method fields
  creditCardNumber: {
    type: "text",
    label: "Credit Card Number",
    placeholder: "XXXX XXXX XXXX XXXX",
    description: "Enter your credit card number",
  },
  expiryDate: {
    type: "text",
    label: "Expiry Date",
    placeholder: "MM/YY",
    description: "Card expiration date",
  },
  cvv: {
    type: "text",
    label: "CVV",
    placeholder: "XXX",
    description: "3-digit security code on the back of your card",
  },
  cardholderName: {
    type: "text",
    label: "Cardholder Name",
    placeholder: "Name as it appears on the card",
    description: "Full name as shown on your card",
  },
  billingAddress: {
    type: "textarea",
    label: "Billing Address",
    placeholder: "Enter your billing address",
    description: "Address associated with your payment method",
  },
  paymentType: {
    type: "select",
    label: "Payment Type",
    placeholder: "Select payment type",
    description: "Choose your preferred payment method",
    options: [
      { value: "credit", label: "Credit Card" },
      { value: "debit", label: "Debit Card" },
      { value: "paypal", label: "PayPal" },
      { value: "other", label: "Other" },
    ],
  },
  
  // Privacy Settings fields
  dataSharing: {
    type: "checkbox",
    label: "Allow Data Sharing",
    description: "Allow us to share your data with trusted partners",
  },
  marketingConsent: {
    type: "checkbox",
    label: "Marketing Consent",
    description: "Allow us to send you marketing materials",
  },
  privacyPolicyAccepted: {
    type: "checkbox",
    label: "Privacy Policy Acceptance",
    description: "I have read and accept the privacy policy",
  },
  dataRetentionPeriod: {
    type: "select",
    label: "Data Retention Period",
    placeholder: "Select how long we keep your data",
    description: "Choose how long we should retain your data",
    options: [
      { value: "30days", label: "30 Days" },
      { value: "90days", label: "90 Days" },
      { value: "1year", label: "1 Year" },
      { value: "forever", label: "Indefinitely" },
    ],
  },
  privacyContactEmail: {
    type: "text",
    label: "Privacy Contact Email",
    placeholder: "contact@example.com",
    description: "Email address for privacy-related inquiries",
  },
  gdprConsent: {
    type: "checkbox",
    label: "GDPR Consent",
    description: "I consent to my data being processed in accordance with GDPR",
  },
  thirdPartyTracking: {
    type: "checkbox",
    label: "Allow Third-Party Tracking",
    description: "Allow third-party services to track your activity",
  },
  customPrivacyNote: {
    type: "textarea",
    label: "Custom Privacy Note",
    placeholder: "Any additional privacy requests or notes",
    description: "Optional notes regarding your privacy preferences",
  },
  
  // Additional Information fields
  companyName: {
    type: "text",
    label: "Company Name",
    placeholder: "Enter your company name",
    description: "Name of your organization (optional)",
  },
  jobTitle: {
    type: "text",
    label: "Job Title",
    placeholder: "Enter your job title",
    description: "Your current position",
  },
  yearsOfExperience: {
    type: "number",
    label: "Years of Experience",
    placeholder: "Enter number of years",
    description: "How many years of professional experience you have",
  },
  preferredLanguage: {
    type: "select",
    label: "Preferred Language",
    placeholder: "Select your preferred language",
    description: "Language preference for communications",
    options: [
      { value: "english", label: "English" },
      { value: "spanish", label: "Spanish" },
      { value: "french", label: "French" },
      { value: "german", label: "German" },
      { value: "other", label: "Other" },
    ],
  },
  referralSource: {
    type: "text",
    label: "Referral Source",
    placeholder: "How did you hear about us?",
    description: "Where or how you found out about our service (optional)",
  },
  
  // Notification Settings fields
  emailNotificationsFrequency: {
    type: "select",
    label: "Email Notification Frequency",
    placeholder: "Select frequency",
    description: "How often would you like to receive email notifications",
    options: [
      { value: "never", label: "Never" },
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
    ],
  },
  pushNotificationsEnabled: {
    type: "checkbox",
    label: "Enable Push Notifications",
    description: "Allow push notifications on your devices",
  },
  smsNotificationsEnabled: {
    type: "checkbox",
    label: "Enable SMS Notifications",
    description: "Allow SMS notifications to your phone",
  },
  notificationTypes: {
    type: "tags" as any,
    label: "Notification Types",
    placeholder: "Select notification types",
    description: "Select what types of events you want to be notified about",
    options: [
      { value: "account", label: "Account Updates" },
      { value: "security", label: "Security Alerts" },
      { value: "marketing", label: "Marketing" },
      { value: "newsletter", label: "Newsletter" },
      { value: "product", label: "Product Updates" },
    ] as any
  },
};

// Define tabs for the form
const UserTabs: TabDefinition<UserType>[] = [
  {
    id: "personal",
    label: "Personal Information",
    description: "Your basic personal information and profile details",
    fields: ["name", "email", "age", "bio", "profileImage"],
  },
  {
    id: "preferences",
    label: "Preferences",
    description: "Customize your experience",
    fields: ["theme", "newsletter", "notifications"],
  },
  {
    id: "interests",
    label: "Interests & Experience",
    description: "Tell us about your interests and experience level",
    fields: ["interests", "primaryInterest", "experienceLevel"],
  },
  {
    id: "account",
    label: "Account Settings",
    description: "Manage your account security settings",
    fields: ["username", "password", "confirmPassword", "twoFactorEnabled"],
  },
  {
    id: "payments",
    label: "Payment Methods",
    description: "Manage your payment options",
    fields: ["creditCardNumber", "expiryDate", "cvv", "cardholderName", "billingAddress", "paymentType"],
  },
  {
    id: "additional",
    label: "Additional Information",
    description: "Other details we might need",
    fields: ["companyName", "jobTitle", "yearsOfExperience", "preferredLanguage", "referralSource"],
  },
  {
    id: "privacy",
    label: "Privacy Settings",
    description: "Manage your privacy preferences",
    fields: ["dataSharing", "marketingConsent", "privacyPolicyAccepted", "dataRetentionPeriod", "privacyContactEmail", "gdprConsent", "thirdPartyTracking", "customPrivacyNote"],
  },
  {
    id: "notifications",
    label: "Notification Settings",
    description: "Control how you receive notifications",
    fields: ["emailNotificationsFrequency", "pushNotificationsEnabled", "smsNotificationsEnabled", "notificationTypes"],
  },
];

export default function TabbedFormTestPage() {
  const [formData, setFormData] = useState<UserType>({
    name: "",
    email: "",
    age: 30,
    bio: null,
    profileImage: null,
    theme: "system",
    newsletter: false,
    notifications: true,
    interests: ["technology", "science"],
    primaryInterest: null,
    experienceLevel: "intermediate",
    username: "",
    password: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    // Payment method initial values
    creditCardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: null,
    paymentType: "credit",
    // Privacy settings initial values
    dataSharing: false,
    marketingConsent: false,
    privacyPolicyAccepted: false,
    dataRetentionPeriod: "90days",
    privacyContactEmail: "",
    gdprConsent: false,
    thirdPartyTracking: false,
    customPrivacyNote: null,
    // Additional information initial values
    companyName: null,
    jobTitle: "",
    yearsOfExperience: 0,
    preferredLanguage: "english",
    referralSource: null,
    // Notification settings initial values
    emailNotificationsFrequency: "weekly",
    pushNotificationsEnabled: false,
    smsNotificationsEnabled: false,
    notificationTypes: ["account", "security"],
  });

  const handleSubmit = (data: UserType) => {
    setFormData(data);
    toast.success("Form submitted successfully!", {
      description: "Check the output below for the submitted data",
    });
    console.log("Form data:", data);
  };

  const debugRequiredFields = () => {
    // Since we've removed all required properties from field customizations,
    // this should log information about schema-inferred required fields
    console.group("Required Fields Detection");
    console.log("Fields marked as required should be inferred from schema structure");
    console.log("Fields with S.NullOr should be detected as optional");
    console.log("Fields with S.String.pipe(S.minLength(1)) should be required");
    
    // Log schema structure detection examples
    console.group("Personal Information Tab");
    console.log("name (S.String.pipe(S.minLength(1))): should be required");
    console.log("bio (S.NullOr(S.String)): should be optional");
    console.log("profileImage (S.NullOr(S.String)): should be optional");
    console.groupEnd();
    
    console.group("Account Settings Tab");
    console.log("username (S.String.pipe(S.minLength(1))): should be required");
    console.log("password (S.String.pipe(S.minLength(1))): should be required");
    console.groupEnd();
    
    console.group("Payment Methods Tab");
    console.log("creditCardNumber (S.String.pipe(S.minLength(1))): should be required");
    console.log("billingAddress (S.NullOr(S.String)): should be optional");
    console.groupEnd();
    
    console.group("Privacy Settings Tab");
    console.log("privacyPolicyAccepted (S.Boolean): should be required");
    console.log("dataRetentionPeriod (S.Literal): should be required");
    console.log("privacyContactEmail (S.String.pipe(S.minLength(1))): should be required");
    console.log("gdprConsent (S.Boolean): should be required");
    console.log("thirdPartyTracking (S.Boolean): should be required");
    console.log("customPrivacyNote (S.NullOr(S.String)): should be optional");
    console.groupEnd();

    console.group("Additional Information Tab");
    console.log("companyName (S.NullOr(S.String)): should be optional");
    console.log("jobTitle (S.String.pipe(S.minLength(1))): should be required");
    console.log("yearsOfExperience (S.Number): should be required");
    console.log("preferredLanguage (S.Literal): should be required");
    console.log("referralSource (S.NullOr(S.String)): should be optional");
    console.groupEnd();
    
    console.group("Notification Settings Tab");
    console.log("emailNotificationsFrequency (S.Literal): should be required");
    console.log("notificationTypes (S.Array): should be required");
    console.groupEnd();
    
    console.groupEnd();
    
    toast.info("Required field detection information logged to console", {
      description: "Open your browser console to view the details"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/test" className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to test page</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2 text-center">Tabbed Form Example</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates a tabbed form that is automatically generated and validated based on an Effect schema.
            <strong className="block mt-2 text-destructive">Important: Be sure to check the Privacy Settings and Notification Settings tabs, which contain required fields that must be filled before submission.</strong>
          </p>
          
          <div className="flex justify-center mb-4 gap-2">
            <Button variant="outline" onClick={debugRequiredFields}>
              Debug Required Fields
            </Button>
            <Button variant="outline" onClick={() => {
              // Create a copy of the form data with empty required fields
              const testData = {
                ...formData,
                name: "", // Required in Personal Information
                creditCardNumber: "", // Required in Payment Methods
                // Privacy Settings required fields
                privacyPolicyAccepted: false,
                privacyContactEmail: "", 
                gdprConsent: false,
                thirdPartyTracking: false,
                // Additional Information required fields
                jobTitle: "",
                yearsOfExperience: 0, // This is a number, so set to 0 rather than empty string
                // Notification Settings required fields
                emailNotificationsFrequency: "never" as const,
                notificationTypes: [] as string[],
              };
              
              // Update form data and try to trigger validation
              setFormData(testData);
              toast.warning("Form updated with empty required fields. Try submitting now to see validation errors.");
            }}>
              Test Empty Required Fields
            </Button>
          </div>
        </div>

        {/* Form section */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border mb-10">
          <TabbedSchemaForm<UserType>
            schema={UserSchema}
            defaultValues={formData}
            onSubmit={handleSubmit}
            fieldCustomizations={UserFields}
            tabs={UserTabs}
            title="User Profile"
            description="Please fill out the form below with your information. Fields marked with * are required based on schema structure. We're now using schema-based required field detection, so fields wrapped in S.NullOr are optional, while regular fields are required. Try using the Debug Required Fields button for more information."
            submitText="Save Profile"
            showReset={true}
            disableValidation={false}
          />
        </div>

        {/* Form output section */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <h2 className="text-2xl font-bold mb-4">Form Output</h2>
          <div className="bg-muted rounded-md overflow-hidden">
            <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap h-[300px]">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold mb-4">About This Example</h2>
          <p className="mb-4 text-muted-foreground">
            This example demonstrates how to create a tabbed form that is automatically generated from an Effect schema. 
            The form organizes fields into tabs for better user experience and includes validation for all fields according to the schema rules.
          </p>
          <h3 className="text-xl font-semibold mb-3">Features:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Automatic form generation from schema",
              "Organized fields with tabbed navigation",
              "Field validation based on schema rules",
              "Customizable field appearance and behavior",
              "Required field indicators in tab headers",
              "Reset button to clear the form",
              "Immediately shows form output",
              "Responsive design for all screen sizes",
              "Support for various field types"
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 