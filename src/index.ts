#!/usr/bin/env node
/**
 * LearningSuite MCP Server
 * Provides tools for interacting with the LearningSuite API
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { LearningSuiteClient } from './api-client.js';

const API_KEY = process.env.LEARNINGSUITE_API_KEY;

if (!API_KEY) {
  console.error('Error: LEARNINGSUITE_API_KEY environment variable is required');
  process.exit(1);
}

const client = new LearningSuiteClient(API_KEY);

// ==================== Tool Definitions ====================

const tools: Tool[] = [
  // Auth
  {
    name: 'learningsuite_check_auth',
    description: 'Check if the API key is valid and get authorization info',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // Members
  {
    name: 'learningsuite_list_members',
    description: 'Get all members with optional filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        includeGroups: {
          type: 'boolean',
          description: 'Include groups the member is part of',
        },
        days_not_logged_in_gte: {
          type: 'number',
          description: 'Minimum days since last login',
        },
        include_never_logged_in: {
          type: 'boolean',
          description: 'Include users who never logged in',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of members to return (default: 1000)',
        },
        offset: {
          type: 'number',
          description: 'Number of members to skip for pagination',
        },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_create_member',
    description: 'Create a new member in LearningSuite',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Member email address' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        phone: { type: 'string', description: 'Phone number' },
        about: { type: 'string', description: 'About text' },
        position: { type: 'string', description: 'Position/title' },
        city: { type: 'string', description: 'City' },
        password: { type: 'string', description: 'Initial password' },
        disableLoginEmail: {
          type: 'boolean',
          description: 'Do not send welcome email',
        },
        doNotRequirePasswordChange: {
          type: 'boolean',
          description: 'Do not require password change on first login',
        },
        locale: {
          type: 'string',
          enum: ['de', 'en'],
          description: 'Language setting',
        },
        ignoreIfAlreadyExists: {
          type: 'boolean',
          description: 'Return existing member if email exists',
        },
      },
      required: ['email', 'firstName', 'lastName'],
    },
  },
  {
    name: 'learningsuite_get_member',
    description: 'Get a member by ID',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        includeGroups: {
          type: 'boolean',
          description: 'Include groups the member is part of',
        },
      },
      required: ['memberId'],
    },
  },
  {
    name: 'learningsuite_get_member_by_email',
    description: 'Get a member by email address',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Member email address' },
        includeGroups: {
          type: 'boolean',
          description: 'Include groups the member is part of',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'learningsuite_update_member',
    description: 'Update a member\'s information',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        enabled: { type: 'boolean', description: 'Enable/disable member' },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        phone: { type: 'string', description: 'Phone number' },
        about: { type: 'string', description: 'About text' },
        position: { type: 'string', description: 'Position/title' },
        city: { type: 'string', description: 'City' },
        email: { type: 'string', description: 'New email address' },
        locale: {
          type: 'string',
          enum: ['de', 'en'],
          description: 'Language setting',
        },
      },
      required: ['memberId'],
    },
  },
  {
    name: 'learningsuite_delete_member',
    description: 'Delete a member',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
      },
      required: ['memberId'],
    },
  },

  // Member Courses
  {
    name: 'learningsuite_get_member_courses',
    description: 'Get all courses for a member with access and progress info',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        dateForAccessCheck: {
          type: 'string',
          description: 'Date for access check (ISO format)',
        },
        limit: { type: 'number', description: 'Maximum courses to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: ['memberId'],
    },
  },
  {
    name: 'learningsuite_add_member_to_courses',
    description: 'Add a member to one or more courses',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        courseIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of course IDs',
        },
        accessGivenAt: {
          type: 'string',
          description: 'When access was given (ISO format)',
        },
        disableAccessNotificationEmail: {
          type: 'boolean',
          description: 'Do not send access notification email',
        },
        sendLoginLinkInCourseEmail: {
          type: 'boolean',
          description: 'Include login link in course email',
        },
      },
      required: ['memberId', 'courseIds'],
    },
  },
  {
    name: 'learningsuite_remove_member_from_courses',
    description: 'Remove a member from one or more courses',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        courseIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of course IDs',
        },
      },
      required: ['memberId', 'courseIds'],
    },
  },
  {
    name: 'learningsuite_get_member_course_info',
    description: 'Get access and progress info for a member in a specific course',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        courseId: { type: 'string', description: 'Course ID' },
        dateForAccessCheck: {
          type: 'string',
          description: 'Date for access check (ISO format)',
        },
      },
      required: ['memberId', 'courseId'],
    },
  },

  // Member Bundles
  {
    name: 'learningsuite_get_member_bundles',
    description: 'Get all bundles of a member with access information',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
      },
      required: ['memberId'],
    },
  },
  {
    name: 'learningsuite_add_member_to_bundles',
    description: 'Add a member to one or more bundles',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        bundles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of bundle IDs',
        },
        accessGivenAtOverride: {
          type: 'string',
          description: 'Override access start date (ISO format)',
        },
        accessUntilOverride: {
          type: 'string',
          description: 'Override access end date (ISO format)',
        },
        unlimitedAccess: {
          type: 'boolean',
          description: 'Grant unlimited access',
        },
        disableAccessNotificationEmail: {
          type: 'boolean',
          description: 'Do not send access notification email',
        },
      },
      required: ['memberId', 'bundles'],
    },
  },
  {
    name: 'learningsuite_remove_member_from_bundles',
    description: 'Remove a member from one or more bundles',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        bundleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of bundle IDs',
        },
      },
      required: ['memberId', 'bundleIds'],
    },
  },

  // Team Members
  {
    name: 'learningsuite_list_team_members',
    description: 'Get team members (users with admin zone access)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum to return (max 100)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_get_team_member',
    description: 'Get a team member by ID',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
      },
      required: ['userId'],
    },
  },
  {
    name: 'learningsuite_get_team_member_by_email',
    description: 'Get a team member by email',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email address' },
      },
      required: ['email'],
    },
  },

  // Groups
  {
    name: 'learningsuite_list_groups',
    description: 'Get all groups',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_create_group',
    description: 'Create a new group',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Group name' },
        description: { type: 'string', description: 'Group description' },
      },
      required: ['name'],
    },
  },
  {
    name: 'learningsuite_find_groups_by_name',
    description: 'Find groups by name',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Group name to search for' },
      },
      required: ['name'],
    },
  },
  {
    name: 'learningsuite_delete_group',
    description: 'Delete a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
      },
      required: ['groupId'],
    },
  },
  {
    name: 'learningsuite_get_group_courses',
    description: 'Get all courses of a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
      },
      required: ['groupId'],
    },
  },
  {
    name: 'learningsuite_add_courses_to_group',
    description: 'Add courses to a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
        courseIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of course IDs',
        },
      },
      required: ['groupId', 'courseIds'],
    },
  },
  {
    name: 'learningsuite_remove_courses_from_group',
    description: 'Remove courses from a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
        courseIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of course IDs',
        },
      },
      required: ['groupId', 'courseIds'],
    },
  },
  {
    name: 'learningsuite_add_bundles_to_group',
    description: 'Add bundles to a group',
    inputSchema: {
      type: 'object',
      properties: {
        groupId: { type: 'string', description: 'Group ID' },
        bundleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of bundle IDs',
        },
      },
      required: ['groupId', 'bundleIds'],
    },
  },
  {
    name: 'learningsuite_add_members_to_groups',
    description: 'Add multiple members to multiple groups (batch operation)',
    inputSchema: {
      type: 'object',
      properties: {
        memberIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of member IDs',
        },
        groupIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of group IDs',
        },
      },
      required: ['memberIds', 'groupIds'],
    },
  },
  {
    name: 'learningsuite_remove_members_from_groups',
    description: 'Remove multiple members from multiple groups (batch operation)',
    inputSchema: {
      type: 'object',
      properties: {
        memberIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of member IDs',
        },
        groupIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of group IDs',
        },
      },
      required: ['memberIds', 'groupIds'],
    },
  },

  // Courses
  {
    name: 'learningsuite_list_published_courses',
    description: 'Get all published courses',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_get_course_modules',
    description: 'Get all modules of a course',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
      },
      required: ['courseId'],
    },
  },
  {
    name: 'learningsuite_get_course_modules_for_member',
    description: 'Get all modules of a course with visibility info for a member',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
        memberId: { type: 'string', description: 'Member ID' },
      },
      required: ['courseId', 'memberId'],
    },
  },
  {
    name: 'learningsuite_get_course_members',
    description: 'Get members for a course with access and optional progress info',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
        limit: { type: 'number', description: 'Maximum to return (max 100)' },
        offset: { type: 'number', description: 'Offset for pagination' },
        includeProgress: {
          type: 'boolean',
          description: 'Include progress info',
        },
      },
      required: ['courseId'],
    },
  },
  {
    name: 'learningsuite_get_course_access_requests',
    description: 'Get access requests for a course',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: ['courseId'],
    },
  },
  {
    name: 'learningsuite_get_course_submissions',
    description: 'Get all submissions in a course (newest first)',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: ['courseId'],
    },
  },
  {
    name: 'learningsuite_create_lesson',
    description: 'Create a lesson in a course section',
    inputSchema: {
      type: 'object',
      properties: {
        courseId: { type: 'string', description: 'Course ID' },
        sectionId: { type: 'string', description: 'Section ID' },
        name: { type: 'string', description: 'Lesson name' },
        htmlContent: {
          type: 'string',
          description: 'HTML content for the lesson',
        },
        videoUrl: {
          type: 'string',
          description: 'Downloadable video URL',
        },
        thumbnailUrl: {
          type: 'string',
          description: 'Downloadable thumbnail image URL',
        },
        timestampInSecondsToGenerateThumbnail: {
          type: 'number',
          description: 'Video timestamp for thumbnail generation',
        },
        immediatelyPublishCourse: {
          type: 'boolean',
          description: 'Publish course immediately after creating lesson',
        },
        lessonSortPosition: {
          type: 'string',
          enum: ['first', 'last'],
          description: 'Position of the lesson in the section',
        },
      },
      required: ['courseId', 'sectionId', 'name'],
    },
  },

  // Modules & Lessons
  {
    name: 'learningsuite_get_module_sections',
    description: 'Get all sections of a module',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: { type: 'string', description: 'Module ID' },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'learningsuite_get_module_lessons',
    description: 'Get all lessons of a module',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: { type: 'string', description: 'Module ID' },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'learningsuite_create_module_unlock_override',
    description: 'Create a module unlock override for a member',
    inputSchema: {
      type: 'object',
      properties: {
        memberId: { type: 'string', description: 'Member ID' },
        moduleId: { type: 'string', description: 'Module ID' },
        unlockAt: {
          type: 'string',
          description: 'When to unlock the module (ISO format)',
        },
      },
      required: ['memberId', 'moduleId'],
    },
  },

  // Bundles
  {
    name: 'learningsuite_list_bundles',
    description: 'Get all bundles',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_get_bundle_members',
    description: 'Get members of a bundle with access info',
    inputSchema: {
      type: 'object',
      properties: {
        bundleId: { type: 'string', description: 'Bundle ID' },
        limit: { type: 'number', description: 'Maximum to return (max 200)' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: ['bundleId'],
    },
  },

  // Hubs
  {
    name: 'learningsuite_list_hubs',
    description: 'Get all published hubs',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_create_hub',
    description: 'Create a new hub from a template',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Hub name' },
        hubTemplateId: { type: 'string', description: 'Hub template ID' },
        variables: {
          type: 'object',
          description: 'Template variables',
        },
      },
      required: ['name', 'hubTemplateId'],
    },
  },
  {
    name: 'learningsuite_list_hub_templates',
    description: 'Get all hub templates',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_get_hub_template_variables',
    description: 'Get variables for a hub template',
    inputSchema: {
      type: 'object',
      properties: {
        hubTemplateId: { type: 'string', description: 'Hub template ID' },
      },
      required: ['hubTemplateId'],
    },
  },
  {
    name: 'learningsuite_add_hub_accesses',
    description: 'Add access to a hub for members, groups, or bundles',
    inputSchema: {
      type: 'object',
      properties: {
        hubId: { type: 'string', description: 'Hub ID' },
        memberIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of member IDs',
        },
        groupIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of group IDs',
        },
        bundleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of bundle IDs',
        },
      },
      required: ['hubId'],
    },
  },
  {
    name: 'learningsuite_remove_hub_accesses',
    description: 'Remove access from a hub for members, groups, or bundles',
    inputSchema: {
      type: 'object',
      properties: {
        hubId: { type: 'string', description: 'Hub ID' },
        memberIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of member IDs',
        },
        groupIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of group IDs',
        },
        bundleIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of bundle IDs',
        },
      },
      required: ['hubId'],
    },
  },

  // Community
  {
    name: 'learningsuite_list_community_areas',
    description: 'Get all community areas',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_list_community_forums',
    description: 'Get community forums',
    inputSchema: {
      type: 'object',
      properties: {
        areaId: { type: 'string', description: 'Filter by area ID' },
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_list_community_posts',
    description: 'Get community posts',
    inputSchema: {
      type: 'object',
      properties: {
        forumId: { type: 'string', description: 'Filter by forum ID' },
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_comment_on_post',
    description: 'Comment on a community post',
    inputSchema: {
      type: 'object',
      properties: {
        postId: { type: 'string', description: 'Post ID' },
        content: { type: 'string', description: 'Comment content' },
        parentCommentId: {
          type: 'string',
          description: 'Parent comment ID for replies',
        },
      },
      required: ['postId', 'content'],
    },
  },
  {
    name: 'learningsuite_list_community_badges',
    description: 'Get all community badges',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_assign_badges_to_user',
    description: 'Assign badges to a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        badgeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of badge IDs',
        },
      },
      required: ['userId', 'badgeIds'],
    },
  },
  {
    name: 'learningsuite_remove_badges_from_user',
    description: 'Remove badges from a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        badgeIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of badge IDs',
        },
      },
      required: ['userId', 'badgeIds'],
    },
  },

  // Popups
  {
    name: 'learningsuite_list_popups',
    description: 'Get all popups',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum to return' },
        offset: { type: 'number', description: 'Offset for pagination' },
      },
      required: [],
    },
  },
  {
    name: 'learningsuite_get_popup',
    description: 'Get a popup by ID',
    inputSchema: {
      type: 'object',
      properties: {
        popupId: { type: 'string', description: 'Popup ID' },
      },
      required: ['popupId'],
    },
  },
  {
    name: 'learningsuite_trigger_popup',
    description: 'Trigger a popup for a member',
    inputSchema: {
      type: 'object',
      properties: {
        popupId: { type: 'string', description: 'Popup ID' },
        memberId: { type: 'string', description: 'Member ID' },
      },
      required: ['popupId', 'memberId'],
    },
  },
  {
    name: 'learningsuite_remove_popup_trigger',
    description: 'Remove a popup trigger for a member',
    inputSchema: {
      type: 'object',
      properties: {
        popupId: { type: 'string', description: 'Popup ID' },
        memberId: { type: 'string', description: 'Member ID' },
      },
      required: ['popupId', 'memberId'],
    },
  },

  // Push Notifications
  {
    name: 'learningsuite_send_push_notifications',
    description: 'Send push notifications to users (requires custom app)',
    inputSchema: {
      type: 'object',
      properties: {
        userIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of user IDs',
        },
        groupIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of group IDs',
        },
        title: { type: 'string', description: 'Notification title' },
        body: { type: 'string', description: 'Notification body text' },
        linkUrl: { type: 'string', description: 'Link URL when tapped' },
        publicImageUrl: {
          type: 'string',
          description: 'Public image URL for notification',
        },
      },
      required: ['linkUrl'],
    },
  },

  // Roles
  {
    name: 'learningsuite_list_roles',
    description: 'Get all roles',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },

  // Webhooks
  {
    name: 'learningsuite_list_webhook_subscriptions',
    description: 'Get all webhook subscriptions',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'learningsuite_create_webhook_subscription',
    description: 'Create a webhook subscription',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Webhook URL' },
        events: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of event types to subscribe to',
        },
        secret: { type: 'string', description: 'Webhook secret' },
      },
      required: ['url', 'events'],
    },
  },
  {
    name: 'learningsuite_get_webhook_subscription',
    description: 'Get a webhook subscription by ID',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', description: 'Subscription ID' },
      },
      required: ['subscriptionId'],
    },
  },
  {
    name: 'learningsuite_update_webhook_subscription',
    description: 'Update a webhook subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', description: 'Subscription ID' },
        url: { type: 'string', description: 'Webhook URL' },
        events: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of event types',
        },
        secret: { type: 'string', description: 'Webhook secret' },
        enabled: { type: 'boolean', description: 'Enable/disable webhook' },
      },
      required: ['subscriptionId'],
    },
  },
  {
    name: 'learningsuite_delete_webhook_subscription',
    description: 'Delete a webhook subscription',
    inputSchema: {
      type: 'object',
      properties: {
        subscriptionId: { type: 'string', description: 'Subscription ID' },
      },
      required: ['subscriptionId'],
    },
  },
  {
    name: 'learningsuite_get_webhook_sample_data',
    description: 'Get sample data for a webhook event type',
    inputSchema: {
      type: 'object',
      properties: {
        eventType: {
          type: 'string',
          enum: [
            'community-post-commented-events',
            'community-post-created-events',
            'community-post-moderated-events',
            'course-member-added-events',
            'course-updated-events',
            'custom-popup-interaction-events',
            'exam-completed-events',
            'exam-graded-events',
            'feedback-events',
            'group-user-access-changed-events',
            'lesson-completed-events',
            'new-login-events',
            'progress-changed-events',
          ],
          description: 'Event type',
        },
      },
      required: ['eventType'],
    },
  },
];

// ==================== Tool Handler ====================

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    // Auth
    case 'learningsuite_check_auth':
      return client.checkAuth();

    // Members
    case 'learningsuite_list_members':
      return client.getMembers(args as any);
    case 'learningsuite_create_member':
      return client.createMember(args as any);
    case 'learningsuite_get_member':
      return client.getMember(args.memberId as string, args.includeGroups as boolean);
    case 'learningsuite_get_member_by_email':
      return client.getMemberByEmail(args.email as string, args.includeGroups as boolean);
    case 'learningsuite_update_member': {
      const { memberId, ...data } = args;
      return client.updateMember(memberId as string, data as any);
    }
    case 'learningsuite_delete_member':
      return client.deleteMember(args.memberId as string);

    // Member Courses
    case 'learningsuite_get_member_courses':
      return client.getMemberCourses(args.memberId as string, args as any);
    case 'learningsuite_add_member_to_courses':
      return client.addMemberToCourses(args.memberId as string, args as any);
    case 'learningsuite_remove_member_from_courses':
      return client.removeMemberFromCourses(args.memberId as string, args.courseIds as string[]);
    case 'learningsuite_get_member_course_info':
      return client.getMemberCourseInfo(
        args.memberId as string,
        args.courseId as string,
        args.dateForAccessCheck as string
      );

    // Member Bundles
    case 'learningsuite_get_member_bundles':
      return client.getMemberBundles(args.memberId as string);
    case 'learningsuite_add_member_to_bundles':
      return client.addMemberToBundles(args.memberId as string, args as any);
    case 'learningsuite_remove_member_from_bundles':
      return client.removeMemberFromBundles(args.memberId as string, args.bundleIds as string[]);

    // Team Members
    case 'learningsuite_list_team_members':
      return client.getTeamMembers(args as any);
    case 'learningsuite_get_team_member':
      return client.getTeamMember(args.userId as string);
    case 'learningsuite_get_team_member_by_email':
      return client.getTeamMemberByEmail(args.email as string);

    // Groups
    case 'learningsuite_list_groups':
      return client.getGroups(args as any);
    case 'learningsuite_create_group':
      return client.createGroup(args as any);
    case 'learningsuite_find_groups_by_name':
      return client.findGroupsByName(args.name as string);
    case 'learningsuite_delete_group':
      return client.deleteGroup(args.groupId as string);
    case 'learningsuite_get_group_courses':
      return client.getGroupCourses(args.groupId as string);
    case 'learningsuite_add_courses_to_group':
      return client.addCoursesToGroup(args.groupId as string, args.courseIds as string[]);
    case 'learningsuite_remove_courses_from_group':
      return client.removeCoursesFromGroup(args.groupId as string, args.courseIds as string[]);
    case 'learningsuite_add_bundles_to_group':
      return client.addBundlesToGroup(args.groupId as string, args.bundleIds as string[]);
    case 'learningsuite_add_members_to_groups':
      return client.addMembersToGroups(args as any);
    case 'learningsuite_remove_members_from_groups':
      return client.removeMembersFromGroups(args as any);

    // Courses
    case 'learningsuite_list_published_courses':
      return client.getPublishedCourses();
    case 'learningsuite_get_course_modules':
      return client.getCourseModules(args.courseId as string);
    case 'learningsuite_get_course_modules_for_member':
      return client.getCourseModulesForMember(args.courseId as string, args.memberId as string);
    case 'learningsuite_get_course_members':
      return client.getCourseMembers(args.courseId as string, args as any);
    case 'learningsuite_get_course_access_requests':
      return client.getCourseAccessRequests(args.courseId as string, args as any);
    case 'learningsuite_get_course_submissions':
      return client.getCourseSubmissions(args.courseId as string, args as any);
    case 'learningsuite_create_lesson':
      return client.createLesson(args.courseId as string, args.sectionId as string, args as any);

    // Modules & Lessons
    case 'learningsuite_get_module_sections':
      return client.getModuleSections(args.moduleId as string);
    case 'learningsuite_get_module_lessons':
      return client.getModuleLessons(args.moduleId as string);
    case 'learningsuite_create_module_unlock_override':
      return client.createModuleUnlockOverride(args as any);

    // Bundles
    case 'learningsuite_list_bundles':
      return client.getBundles();
    case 'learningsuite_get_bundle_members':
      return client.getBundleMembers(args.bundleId as string, args as any);

    // Hubs
    case 'learningsuite_list_hubs':
      return client.getHubs();
    case 'learningsuite_create_hub':
      return client.createHub(args as any);
    case 'learningsuite_list_hub_templates':
      return client.getHubTemplates();
    case 'learningsuite_get_hub_template_variables':
      return client.getHubTemplateVariables(args.hubTemplateId as string);
    case 'learningsuite_add_hub_accesses':
      return client.addHubAccesses(args.hubId as string, args as any);
    case 'learningsuite_remove_hub_accesses':
      return client.removeHubAccesses(args.hubId as string, args as any);

    // Community
    case 'learningsuite_list_community_areas':
      return client.getCommunityAreas();
    case 'learningsuite_list_community_forums':
      return client.getCommunityForums(args as any);
    case 'learningsuite_list_community_posts':
      return client.getCommunityPosts(args as any);
    case 'learningsuite_comment_on_post':
      return client.commentOnPost(args.postId as string, args as any);
    case 'learningsuite_list_community_badges':
      return client.getCommunityBadges();
    case 'learningsuite_assign_badges_to_user':
      return client.assignBadgesToUser(args as any);
    case 'learningsuite_remove_badges_from_user':
      return client.removeBadgesFromUser(args as any);

    // Popups
    case 'learningsuite_list_popups':
      return client.getPopups(args as any);
    case 'learningsuite_get_popup':
      return client.getPopup(args.popupId as string);
    case 'learningsuite_trigger_popup':
      return client.triggerPopup(args.popupId as string, args.memberId as string);
    case 'learningsuite_remove_popup_trigger':
      return client.removePopupTrigger(args.popupId as string, args.memberId as string);

    // Push Notifications
    case 'learningsuite_send_push_notifications':
      return client.sendPushNotifications(args as any);

    // Roles
    case 'learningsuite_list_roles':
      return client.getRoles();

    // Webhooks
    case 'learningsuite_list_webhook_subscriptions':
      return client.getWebhookSubscriptions();
    case 'learningsuite_create_webhook_subscription':
      return client.createWebhookSubscription(args as any);
    case 'learningsuite_get_webhook_subscription':
      return client.getWebhookSubscription(args.subscriptionId as string);
    case 'learningsuite_update_webhook_subscription': {
      const { subscriptionId, ...data } = args;
      return client.updateWebhookSubscription(subscriptionId as string, data as any);
    }
    case 'learningsuite_delete_webhook_subscription':
      return client.deleteWebhookSubscription(args.subscriptionId as string);
    case 'learningsuite_get_webhook_sample_data':
      return client.getWebhookSampleData(args.eventType as any);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ==================== Server Setup ====================

const server = new Server(
  {
    name: 'learningsuite-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall(name, args as Record<string, unknown>);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LearningSuite MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
