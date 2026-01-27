/**
 * LearningSuite API Client
 * API Version: 1.16.0
 * Base URL: https://api.learningsuite.io/api/v1
 */

const BASE_URL = 'https://api.learningsuite.io/api/v1';

export class LearningSuiteClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    queryParams?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    let url = `${BASE_URL}${path}`;

    if (queryParams) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  // ==================== Auth ====================

  /**
   * Check authorization (dummy endpoint)
   */
  async checkAuth(): Promise<{ name?: string }> {
    return this.request('GET', '/auth');
  }

  // ==================== Members ====================

  /**
   * Get all members with optional filtering
   */
  async getMembers(params?: {
    includeGroups?: boolean;
    days_not_logged_in_gte?: number;
    include_never_logged_in?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/members', undefined, params as any);
  }

  /**
   * Create a new member
   */
  async createMember(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    about?: string;
    position?: string;
    city?: string;
    password?: string;
    disableLoginEmail?: boolean;
    doNotRequirePasswordChange?: boolean;
    locale?: 'de' | 'en';
    ignoreIfAlreadyExists?: boolean;
  }): Promise<any> {
    return this.request('POST', '/members', data);
  }

  /**
   * Get a member by email
   */
  async getMemberByEmail(email: string, includeGroups?: boolean): Promise<any> {
    return this.request('GET', '/members/by-email', undefined, { email, includeGroups });
  }

  /**
   * Get a member by ID
   */
  async getMember(memberId: string, includeGroups?: boolean): Promise<any> {
    return this.request('GET', `/members/${memberId}`, undefined, { includeGroups });
  }

  /**
   * Update a member
   */
  async updateMember(memberId: string, data: {
    enabled?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    about?: string;
    position?: string;
    city?: string;
    email?: string;
    locale?: 'de' | 'en';
  }): Promise<any> {
    return this.request('PUT', `/members/${memberId}`, data);
  }

  /**
   * Delete a member
   */
  async deleteMember(memberId: string): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/members/${memberId}`);
  }

  // ==================== Member Courses ====================

  /**
   * Get all courses for a member with access and progress information
   */
  async getMemberCourses(memberId: string, params?: {
    dateForAccessCheck?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', `/members/${memberId}/courses`, undefined, params as any);
  }

  /**
   * Add a member to courses
   */
  async addMemberToCourses(memberId: string, data: {
    courseIds: string[];
    accessGivenAt?: string;
    disableAccessNotificationEmail?: boolean;
    sendLoginLinkInCourseEmail?: boolean;
  }): Promise<{ ok: boolean }> {
    return this.request('PUT', `/members/${memberId}/courses`, data);
  }

  /**
   * Remove a member from courses
   */
  async removeMemberFromCourses(memberId: string, courseIds: string[]): Promise<{ removed: number }> {
    return this.request('DELETE', `/members/${memberId}/courses`, { courseIds });
  }

  /**
   * Get a member's access and progress information for a course
   */
  async getMemberCourseInfo(memberId: string, courseId: string, dateForAccessCheck?: string): Promise<any> {
    return this.request('GET', `/members/${memberId}/course-info/${courseId}`, undefined, { dateForAccessCheck });
  }

  // ==================== Member Bundles ====================

  /**
   * Get all bundles of a member with access information
   */
  async getMemberBundles(memberId: string): Promise<any[]> {
    return this.request('GET', `/members/${memberId}/bundles`);
  }

  /**
   * Add a member to bundles
   */
  async addMemberToBundles(memberId: string, data: {
    bundles: string[];
    accessGivenAtOverride?: string;
    accessUntilOverride?: string;
    unlimitedAccess?: boolean;
    disableAccessNotificationEmail?: boolean;
  }): Promise<{ ok: boolean }> {
    return this.request('PUT', `/members/${memberId}/bundles`, data);
  }

  /**
   * Remove a member from bundles
   */
  async removeMemberFromBundles(memberId: string, bundleIds: string[]): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/members/${memberId}/bundles`, { bundleIds });
  }

  // ==================== Team Members ====================

  /**
   * Get team members (admin zone access users)
   */
  async getTeamMembers(params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/team-members', undefined, params as any);
  }

  /**
   * Get a team member by email
   */
  async getTeamMemberByEmail(email: string): Promise<any> {
    return this.request('GET', '/team-members/by-email', undefined, { email });
  }

  /**
   * Get a team member by ID
   */
  async getTeamMember(userId: string): Promise<any> {
    return this.request('GET', `/team-members/${userId}`);
  }

  // ==================== Groups ====================

  /**
   * Get all groups
   */
  async getGroups(params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/groups', undefined, params as any);
  }

  /**
   * Create a group
   */
  async createGroup(data: {
    name: string;
    description?: string;
  }): Promise<any> {
    return this.request('POST', '/groups', data);
  }

  /**
   * Find groups by name
   */
  async findGroupsByName(name: string): Promise<any[]> {
    return this.request('GET', '/groups/find-by-name', undefined, { name });
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/group/${groupId}`);
  }

  /**
   * Get all courses of a group
   */
  async getGroupCourses(groupId: string): Promise<any[]> {
    return this.request('GET', `/group/${groupId}/courses`);
  }

  /**
   * Add courses to a group
   */
  async addCoursesToGroup(groupId: string, courseIds: string[]): Promise<{ ok: boolean }> {
    return this.request('PUT', `/group/${groupId}/courses`, { courseIds });
  }

  /**
   * Remove courses from a group
   */
  async removeCoursesFromGroup(groupId: string, courseIds: string[]): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/group/${groupId}/courses`, { courseIds });
  }

  /**
   * Add bundles to a group
   */
  async addBundlesToGroup(groupId: string, bundleIds: string[]): Promise<{ ok: boolean }> {
    return this.request('PUT', `/group/${groupId}/bundles`, { bundleIds });
  }

  /**
   * Add members to groups (batch operation)
   */
  async addMembersToGroups(data: {
    memberIds: string[];
    groupIds: string[];
  }): Promise<any> {
    return this.request('PUT', '/add-members-to-groups', data);
  }

  /**
   * Add members to groups with summary response
   */
  async addMembersToGroupsSummary(data: {
    memberIds: string[];
    groupIds: string[];
  }): Promise<any> {
    return this.request('PUT', '/add-members-to-groups-summary', data);
  }

  /**
   * Remove members from groups (batch operation)
   */
  async removeMembersFromGroups(data: {
    memberIds: string[];
    groupIds: string[];
  }): Promise<any> {
    return this.request('DELETE', '/remove-members-from-groups', data);
  }

  // ==================== Courses ====================

  /**
   * Get published courses
   */
  async getPublishedCourses(): Promise<any[]> {
    return this.request('GET', '/courses/published');
  }

  /**
   * Get all modules of a course
   */
  async getCourseModules(courseId: string): Promise<any[]> {
    return this.request('GET', `/courses/${courseId}/modules`);
  }

  /**
   * Get all modules of a course with visibility info for a member
   */
  async getCourseModulesForMember(courseId: string, memberId: string): Promise<any[]> {
    return this.request('GET', `/courses/${courseId}/modules/${memberId}`);
  }

  /**
   * Get members for a course with access and optional progress info
   */
  async getCourseMembers(courseId: string, params?: {
    limit?: number;
    offset?: number;
    includeProgress?: boolean;
  }): Promise<{ users: any[] }> {
    return this.request('GET', `/courses/${courseId}/members`, undefined, params as any);
  }

  /**
   * Get access requests for a course
   */
  async getCourseAccessRequests(courseId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', `/courses/${courseId}/access-requests`, undefined, params as any);
  }

  /**
   * Get all submissions in a course
   */
  async getCourseSubmissions(courseId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', `/courses/${courseId}/submissions`, undefined, params as any);
  }

  /**
   * Create a lesson in a course section
   */
  async createLesson(courseId: string, sectionId: string, data: {
    name: string;
    htmlContent?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    timestampInSecondsToGenerateThumbnail?: number;
    immediatelyPublishCourse?: boolean;
    lessonSortPosition?: 'first' | 'last';
  }): Promise<{
    relativePath: string;
    absolutePath: string;
    lessonId: string;
  }> {
    return this.request('POST', `/courses/${courseId}/create-lesson/${sectionId}`, data);
  }

  // ==================== Modules & Lessons ====================

  /**
   * Get sections of a module
   */
  async getModuleSections(moduleId: string): Promise<any[]> {
    return this.request('GET', `/modules/${moduleId}/sections`);
  }

  /**
   * Get lessons for a module
   */
  async getModuleLessons(moduleId: string): Promise<any[]> {
    return this.request('GET', `/modules/${moduleId}/lessons`);
  }

  /**
   * Create module unlock override
   */
  async createModuleUnlockOverride(data: {
    memberId: string;
    moduleId: string;
    unlockAt?: string;
  }): Promise<any> {
    return this.request('POST', '/create-module-unlock-override', data);
  }

  // ==================== Bundles ====================

  /**
   * Get all bundles
   */
  async getBundles(): Promise<any[]> {
    return this.request('GET', '/bundles');
  }

  /**
   * Get members of a bundle with access info
   */
  async getBundleMembers(bundleId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', `/bundle/${bundleId}/members`, undefined, params as any);
  }

  // ==================== Hubs ====================

  /**
   * Get published hubs
   */
  async getHubs(): Promise<any[]> {
    return this.request('GET', '/hubs');
  }

  /**
   * Create a hub
   */
  async createHub(data: {
    name: string;
    hubTemplateId: string;
    variables?: Record<string, any>;
  }): Promise<any> {
    return this.request('POST', '/hub', data);
  }

  /**
   * Get hub templates
   */
  async getHubTemplates(): Promise<any[]> {
    return this.request('GET', '/hub-templates');
  }

  /**
   * Get hub template variables
   */
  async getHubTemplateVariables(hubTemplateId: string): Promise<any[]> {
    return this.request('GET', `/hub-template/${hubTemplateId}/variables`);
  }

  /**
   * Add hub accesses
   */
  async addHubAccesses(hubId: string, data: {
    memberIds?: string[];
    groupIds?: string[];
    bundleIds?: string[];
  }): Promise<{ ok: boolean }> {
    return this.request('PUT', `/hub/${hubId}/access`, data);
  }

  /**
   * Remove hub accesses
   */
  async removeHubAccesses(hubId: string, data: {
    memberIds?: string[];
    groupIds?: string[];
    bundleIds?: string[];
  }): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/hub/${hubId}/access`, data);
  }

  // ==================== Community ====================

  /**
   * Get community areas
   */
  async getCommunityAreas(): Promise<any[]> {
    return this.request('GET', '/community/areas');
  }

  /**
   * Get community forums
   */
  async getCommunityForums(params?: {
    areaId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/community/forums', undefined, params as any);
  }

  /**
   * Get community posts
   */
  async getCommunityPosts(params?: {
    forumId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/community/posts', undefined, params as any);
  }

  /**
   * Comment on a community post
   */
  async commentOnPost(postId: string, data: {
    content: string;
    parentCommentId?: string;
  }): Promise<any> {
    return this.request('POST', `/community/posts/${postId}/comments`, data);
  }

  /**
   * Get community badges
   */
  async getCommunityBadges(): Promise<any[]> {
    return this.request('GET', '/community/badges');
  }

  /**
   * Assign badges to a user
   */
  async assignBadgesToUser(data: {
    userId: string;
    badgeIds: string[];
  }): Promise<{ ok: boolean }> {
    return this.request('PUT', '/community/badges/user', data);
  }

  /**
   * Remove badges from a user
   */
  async removeBadgesFromUser(data: {
    userId: string;
    badgeIds: string[];
  }): Promise<{ ok: boolean }> {
    return this.request('DELETE', '/community/badges/user', data);
  }

  // ==================== Popups ====================

  /**
   * Get popups
   */
  async getPopups(params?: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    return this.request('GET', '/popups', undefined, params as any);
  }

  /**
   * Get a popup by ID
   */
  async getPopup(popupId: string): Promise<any> {
    return this.request('GET', `/popups/${popupId}`);
  }

  /**
   * Trigger a popup for a member
   */
  async triggerPopup(popupId: string, memberId: string): Promise<{ ok: boolean }> {
    return this.request('POST', `/popups/${popupId}/trigger/${memberId}`);
  }

  /**
   * Remove a popup trigger for a member
   */
  async removePopupTrigger(popupId: string, memberId: string): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/popups/${popupId}/trigger/${memberId}`);
  }

  // ==================== Push Notifications ====================

  /**
   * Send push notifications
   */
  async sendPushNotifications(data: {
    userIds?: string[];
    groupIds?: string[];
    title?: string;
    body?: string;
    linkUrl: string;
    publicImageUrl?: string;
  }): Promise<{ successCount: number; failureCount: number }> {
    return this.request('POST', '/user/push-notifications/send', data);
  }

  // ==================== Roles ====================

  /**
   * Get all roles
   */
  async getRoles(): Promise<any[]> {
    return this.request('GET', '/user/roles');
  }

  // ==================== Webhooks ====================

  /**
   * Get all webhook subscriptions
   */
  async getWebhookSubscriptions(): Promise<any[]> {
    return this.request('GET', '/webhooks/subscription');
  }

  /**
   * Create a webhook subscription
   */
  async createWebhookSubscription(data: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<any> {
    return this.request('POST', '/webhooks/subscription', data);
  }

  /**
   * Get a webhook subscription
   */
  async getWebhookSubscription(subscriptionId: string): Promise<any> {
    return this.request('GET', `/webhooks/subscription/${subscriptionId}`);
  }

  /**
   * Update a webhook subscription
   */
  async updateWebhookSubscription(subscriptionId: string, data: {
    url?: string;
    events?: string[];
    secret?: string;
    enabled?: boolean;
  }): Promise<any> {
    return this.request('PUT', `/webhooks/subscription/${subscriptionId}`, data);
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhookSubscription(subscriptionId: string): Promise<{ ok: boolean }> {
    return this.request('DELETE', `/webhooks/subscription/${subscriptionId}`);
  }

  /**
   * Get sample data for webhook events
   */
  async getWebhookSampleData(eventType:
    | 'community-post-commented-events'
    | 'community-post-created-events'
    | 'community-post-moderated-events'
    | 'course-member-added-events'
    | 'course-updated-events'
    | 'custom-popup-interaction-events'
    | 'exam-completed-events'
    | 'exam-graded-events'
    | 'feedback-events'
    | 'group-user-access-changed-events'
    | 'lesson-completed-events'
    | 'new-login-events'
    | 'progress-changed-events'
  ): Promise<any> {
    return this.request('GET', `/webhooks/sample-data/${eventType}`);
  }
}
