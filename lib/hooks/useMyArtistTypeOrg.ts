import { useSession, useListOrganizations } from "@/lib/auth-client";

/**
 * Custom hook to check if the current user is a member of the MyArtistType organization
 * 
 * @returns An object containing:
 * - isLoading: boolean indicating if the auth data is still loading
 * - isAuthenticated: boolean indicating if the user is authenticated
 * - isMyArtistTypeOrg: boolean indicating if the user is part of the MyArtistType organization
 */
export function useMyArtistTypeOrg() {
  const { data: session } = useSession();
  const { data: organizations, isPending } = useListOrganizations();
  
  const isLoading = isPending;
  const isAuthenticated = !!session?.user;
  
  // Check if the user is part of the MyArtistType organization
  // Note: We check for both "MyArtistType" and "MyArtistTypeOrganization" to be safe
  const isMyArtistTypeOrg = organizations?.some(
    (org) => org.name === "MyArtistType" || org.name === "MyArtistTypeOrganization"
  ) ?? false;

  return {
    isLoading,
    isAuthenticated,
    isMyArtistTypeOrg
  };
} 