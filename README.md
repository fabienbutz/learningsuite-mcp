# LearningSuite MCP Server

A Model Context Protocol (MCP) server that provides tools for interacting with the [LearningSuite](https://learningsuite.io) API. This server enables AI assistants like Claude to manage members, courses, groups, bundles, hubs, community features, and more.

## Features

- **Member Management**: Create, update, delete, and query members
- **Course Management**: List courses, manage enrollments, track progress
- **Group Management**: Create groups, manage memberships and course access
- **Bundle Management**: Manage product bundles and member access
- **Hub Management**: Create and manage hubs from templates
- **Community Features**: Manage forums, posts, comments, and badges
- **Webhooks**: Create and manage webhook subscriptions
- **Push Notifications**: Send notifications to users (requires custom app)

## Prerequisites

- Node.js 18 or higher
- A LearningSuite account with API access
- LearningSuite API key

## Installation

1. Clone this repository:
```bash
git clone https://github.com/fabienbutz/mcp-server-learningsuite.git
cd mcp-server-learningsuite
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file or set the environment variable:

```bash
LEARNINGSUITE_API_KEY=your_api_key_here
```

You can get your API key from the LearningSuite Admin Dashboard.

### Claude Desktop Configuration

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "learningsuite": {
      "command": "node",
      "args": ["/path/to/mcp-server-learningsuite/dist/index.js"],
      "env": {
        "LEARNINGSUITE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Authentication
- `learningsuite_check_auth` - Verify API key validity

### Members
- `learningsuite_list_members` - List all members with filtering options
- `learningsuite_create_member` - Create a new member
- `learningsuite_get_member` - Get member by ID
- `learningsuite_get_member_by_email` - Get member by email
- `learningsuite_update_member` - Update member information
- `learningsuite_delete_member` - Delete a member

### Member Courses
- `learningsuite_get_member_courses` - Get courses for a member
- `learningsuite_add_member_to_courses` - Enroll member in courses
- `learningsuite_remove_member_from_courses` - Remove member from courses
- `learningsuite_get_member_course_info` - Get member's course progress

### Member Bundles
- `learningsuite_get_member_bundles` - Get member's bundles
- `learningsuite_add_member_to_bundles` - Add member to bundles
- `learningsuite_remove_member_from_bundles` - Remove member from bundles

### Team Members
- `learningsuite_list_team_members` - List admin users
- `learningsuite_get_team_member` - Get team member by ID
- `learningsuite_get_team_member_by_email` - Get team member by email

### Groups
- `learningsuite_list_groups` - List all groups
- `learningsuite_create_group` - Create a new group
- `learningsuite_find_groups_by_name` - Search groups by name
- `learningsuite_delete_group` - Delete a group
- `learningsuite_get_group_courses` - Get group's courses
- `learningsuite_add_courses_to_group` - Add courses to group
- `learningsuite_remove_courses_from_group` - Remove courses from group
- `learningsuite_add_bundles_to_group` - Add bundles to group
- `learningsuite_add_members_to_groups` - Batch add members to groups
- `learningsuite_remove_members_from_groups` - Batch remove members from groups

### Courses
- `learningsuite_list_published_courses` - List all published courses
- `learningsuite_get_course_modules` - Get course modules
- `learningsuite_get_course_modules_for_member` - Get modules with member visibility
- `learningsuite_get_course_members` - Get course enrollments
- `learningsuite_get_course_access_requests` - Get pending access requests
- `learningsuite_get_course_submissions` - Get course submissions
- `learningsuite_create_lesson` - Create a new lesson

### Modules & Lessons
- `learningsuite_get_module_sections` - Get module sections
- `learningsuite_get_module_lessons` - Get module lessons
- `learningsuite_create_module_unlock_override` - Override module unlock timing

### Bundles
- `learningsuite_list_bundles` - List all bundles
- `learningsuite_get_bundle_members` - Get bundle members

### Hubs
- `learningsuite_list_hubs` - List all published hubs
- `learningsuite_create_hub` - Create hub from template
- `learningsuite_list_hub_templates` - List available templates
- `learningsuite_get_hub_template_variables` - Get template variables
- `learningsuite_add_hub_accesses` - Grant hub access
- `learningsuite_remove_hub_accesses` - Revoke hub access

### Community
- `learningsuite_list_community_areas` - List community areas
- `learningsuite_list_community_forums` - List forums
- `learningsuite_list_community_posts` - List posts
- `learningsuite_comment_on_post` - Comment on a post
- `learningsuite_list_community_badges` - List badges
- `learningsuite_assign_badges_to_user` - Assign badges
- `learningsuite_remove_badges_from_user` - Remove badges

### Popups
- `learningsuite_list_popups` - List all popups
- `learningsuite_get_popup` - Get popup by ID
- `learningsuite_trigger_popup` - Trigger popup for member
- `learningsuite_remove_popup_trigger` - Remove popup trigger

### Push Notifications
- `learningsuite_send_push_notifications` - Send push notifications

### Roles
- `learningsuite_list_roles` - List all roles

### Webhooks
- `learningsuite_list_webhook_subscriptions` - List subscriptions
- `learningsuite_create_webhook_subscription` - Create subscription
- `learningsuite_get_webhook_subscription` - Get subscription by ID
- `learningsuite_update_webhook_subscription` - Update subscription
- `learningsuite_delete_webhook_subscription` - Delete subscription
- `learningsuite_get_webhook_sample_data` - Get sample webhook payload

## Development

Watch mode for development:
```bash
npm run dev
```

Build:
```bash
npm run build
```

## API Documentation

This server wraps the LearningSuite API v1.16.0. For detailed API documentation, visit the [LearningSuite Developer Portal](https://learningsuite.io).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
