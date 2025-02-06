import { RolesWithPermissions } from "./types"

export const ROLES = {
  LEAD_DEVELOPER: {
    projects: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    timeEntries: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    profiles: {
      view: true,
      update: true,
      manage: true,
    },
  },
  DEVELOPER: {
    projects: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    timeEntries: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    profiles: {
      view: true,
      update: true,
      manage: true,
    },
  },
  ADMIN: {
    projects: {
      view: true,
      create: true,
      update: true,
      delete: true,
      manage: true,
    },
    timeEntries: {
      view: true,
      create: true,
      update: true,
      delete: true,
    },
    profiles: {
      view: true,
      update: true,
      manage: true,
    },
  },
  COACH: {
    projects: {
      view: true,
      create: true,
      update: (user, project) => project.ownerId === user.id,
      delete: (user, project) => project.ownerId === user.id,
      manage: (user, project) => project.ownerId === user.id,
    },
    timeEntries: {
      view: (user, entry) => entry.userId === user.id,
      create: true,
      update: (user, entry) => entry.userId === user.id,
      delete: (user, entry) => entry.userId === user.id,
    },
    profiles: {
      view: true,
      update: (user, profile) => profile.userId === user.id,
      manage: (user, profile) => profile.userId === user.id,
    },
  },
  MANAGER: {
    projects: {
      view: true,
      create: true,
      update: (user, project) =>
        project.teamId === user.teamId || project.ownerId === user.id,
      delete: (user, project) =>
        project.teamId === user.teamId && project.ownerId === user.id,
    },
    timeEntries: {
      view: (user, entry) =>
        entry.userId === user.id || user.teamId === entry.userId,
      create: true,
      update: (user, entry) =>
        entry.userId === user.id || user.teamId === entry.userId,
      delete: (user, entry) => entry.userId === user.id,
    },
    profiles: {
      view: true,
      update: (user, profile) => profile.teamId === user.teamId,
    },
  },
  USER: {
    projects: {
      view: (user, project) =>
        project.collaborators.includes(user.id) ||
        project.ownerId === user.id ||
        project.teamId === user.teamId,
      create: (user) => user.subscriptionTier !== "free",
      update: (user, project) =>
        project.collaborators.includes(user.id) || project.ownerId === user.id,
      delete: (user, project) => project.ownerId === user.id,
    },
    timeEntries: {
      view: (user, entry) => entry.userId === user.id,
      create: true,
      update: (user, entry) => entry.userId === user.id,
      delete: (user, entry) => entry.userId === user.id,
    },
    profiles: {
      view: true,
      update: (user, profile) => profile.userId === user.id,
    },
  },
  GUEST: {
    projects: {
      view: (user, project) => project.collaborators.includes(user.id),
    },
    profiles: {
      view: true,
    },
  },
} as const satisfies RolesWithPermissions
