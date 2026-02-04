import { superAdminAxios } from './super-admin-auth-service'

export interface EmailAddress {
  name?: string
  address: string
}

export interface EmailDto {
  id: string
  subject: string
  bodyPreview: string
  body: string
  bodyContentType: string
  from?: EmailAddress
  toRecipients: EmailAddress[]
  ccRecipients: EmailAddress[]
  receivedDateTime: string
  sentDateTime?: string
  isRead: boolean
  hasAttachments: boolean
  importance: string
  webLink?: string
}

export interface SendEmailRequest {
  to: string[]
  cc?: string[]
  subject: string
  body: string
  isHtml?: boolean
}

export interface UserInfoDto {
  id: string
  displayName: string
  email?: string
  userPrincipalName: string
  givenName?: string
  surname?: string
  jobTitle?: string
  department?: string
  officeLocation?: string
  mobilePhone?: string
  accountEnabled: boolean
}

export interface CreateUserRequest {
  displayName: string
  givenName?: string
  surname?: string
  userPrincipalName: string
  password: string
  mailNickname?: string
  jobTitle?: string
  department?: string
  officeLocation?: string
  mobilePhone?: string
  forceChangePasswordNextSignIn?: boolean
}

export interface CreateUserResponse {
  success: boolean
  userId?: string
  userPrincipalName?: string
  email?: string
  message?: string
}

export const microsoftGraphService = {
  getEmails: async (
    userEmail: string,
    top: number = 50,
    unreadOnly: boolean = false
  ): Promise<EmailDto[]> => {
    const params = new URLSearchParams()
    params.append('top', top.toString())
    if (unreadOnly) params.append('unreadOnly', 'true')

    const response = await superAdminAxios.get(
      `/email/${encodeURIComponent(userEmail)}?${params.toString()}`
    )
    return response.data
  },

  getEmailById: async (userEmail: string, messageId: string): Promise<EmailDto> => {
    const response = await superAdminAxios.get(
      `/email/${encodeURIComponent(userEmail)}/messages/${messageId}`
    )
    return response.data
  },

  sendEmail: async (userEmail: string, request: SendEmailRequest): Promise<void> => {
    await superAdminAxios.post(
      `/email/${encodeURIComponent(userEmail)}/send`,
      request
    )
  },

  markAsRead: async (userEmail: string, messageId: string): Promise<void> => {
    await superAdminAxios.post(
      `/email/${encodeURIComponent(userEmail)}/messages/${messageId}/read`
    )
  },

  searchEmails: async (
    userEmail: string,
    query: string,
    top: number = 50
  ): Promise<EmailDto[]> => {
    const params = new URLSearchParams()
    params.append('query', query)
    params.append('top', top.toString())

    const response = await superAdminAxios.get(
      `/email/${encodeURIComponent(userEmail)}/search?${params.toString()}`
    )
    return response.data
  },

  getUsers: async (top: number = 100): Promise<UserInfoDto[]> => {
    const response = await superAdminAxios.get(`/email/users?top=${top}`)
    return response.data
  },

  getUserById: async (userIdOrEmail: string): Promise<UserInfoDto> => {
    const response = await superAdminAxios.get(
      `/email/users/${encodeURIComponent(userIdOrEmail)}`
    )
    return response.data
  },

  createUser: async (request: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await superAdminAxios.post('/email/users', request)
    return response.data
  },

  updateUser: async (userId: string, request: Partial<CreateUserRequest>): Promise<void> => {
    await superAdminAxios.put(`/email/users/${userId}`, request)
  },

  deleteUser: async (userId: string): Promise<void> => {
    await superAdminAxios.delete(`/email/users/${userId}`)
  },

  resetPassword: async (userId: string): Promise<{ password: string }> => {
    const response = await superAdminAxios.post(
      `/email/users/${userId}/reset-password`
    )
    return response.data
  },

  getDomains: async (): Promise<string[]> => {
    const response = await superAdminAxios.get('/email/domains')
    return response.data
  },
}

export default microsoftGraphService
