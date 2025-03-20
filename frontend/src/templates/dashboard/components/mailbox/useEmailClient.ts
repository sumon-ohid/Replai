import * as React from "react";
import axios from "axios";

// Debug utility
const debug = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(`[EmailClient] ${message}`, ...args);
  }
};

// API Types
interface EmailAccountResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

interface EmailResponse {
  _id: string;
  subject: string;
  from?: {
    name?: string;
    email: string;
  };
  to: Array<{
    name?: string;
    email: string;
  }>;
  body?: {
    html?: string;
    text?: string;
  };
  snippet?: string;
  date: string;
  read: boolean;
  starred: boolean;
  attachments?: Array<{
    id?: string;
    _id?: string;
    filename: string;
    size?: number;
    contentType: string;
  }>;
  labels?: string[];
  folder?: string;
}

// Client Types
export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

export interface EmailData {
  id: string;
  subject: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: Array<{
    name: string;
    email: string;
  }>;
  content: string;
  preview: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>;
  labels?: string[];
  folder: string;
}

interface EmailClientState {
  accounts: EmailAccount[];
  selectedAccount: string; // Still using ID as identifier for account selection
  selectedAccountEmail: string; // New field to track the selected account email
  emails: EmailData[];
  filteredEmails: EmailData[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  currentFolder: string;
  selectedEmailId: string | null;
  composeOpen: boolean;
  replyTo: EmailData | null;
  forwardEmail: EmailData | null;
  detailViewOpen: boolean;
  mobileSidebarOpen: boolean;
  unreadCounts: Record<string, number>;
  unreadCount: number;
  hasPreviousEmail: boolean;
  hasNextEmail: boolean;
}

// Return type for useEmailClient hook
interface UseEmailClientReturn {
  state: EmailClientState;
  handlers: {
    handleAccountChange: (accountId: string) => void;
    handleFolderChange: (folder: string) => void;
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleClearSearch: () => void;
    handleRefresh: () => void;
    handleEmailSelect: (emailId: string) => Promise<void>;
    handleCloseDetailView: () => void;
    handleToggleStar: (emailId: string) => Promise<void>;
    handleToggleRead: (emailId: string) => Promise<void>;
    handleMarkAllRead: () => Promise<void>;
    toggleMobileSidebar: () => void;
    handleCompose: () => void;
    handleCloseCompose: () => void;
    handleReplyEmail: (email: EmailData) => void;
    handleForwardEmail: (email: EmailData) => void;
    handleDeleteEmail: (emailId: string) => Promise<void>;
    handlePreviousEmail: () => void;
    handleNextEmail: () => void;
    handleSendEmail: (data: any) => Promise<void>;
  };
  selectedEmail: EmailData | null;
}

export const useEmailClient = (): UseEmailClientReturn => {
  const [state, setState] = React.useState<EmailClientState>({
    accounts: [],
    selectedAccount: "",
    selectedAccountEmail: "", // Initialize the new field
    emails: [],
    filteredEmails: [],
    loading: true,
    error: null,
    searchTerm: "",
    currentFolder: "inbox",
    selectedEmailId: null,
    composeOpen: false,
    replyTo: null,
    forwardEmail: null,
    detailViewOpen: false,
    mobileSidebarOpen: false,
    unreadCounts: {},
    unreadCount: 0,
    hasPreviousEmail: false,
    hasNextEmail: false,
  });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const initialized = React.useRef(false);
  const lastFetchRef = React.useRef({ accountId: "", folder: "", timestamp: 0 });

  const getAuthToken = () => localStorage.getItem("token");

  const api = React.useMemo(() => {
    debug("Creating API instance");
    return axios.create({
      baseURL: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  }, [apiBaseUrl]);

  const handleError = (error: any, message: string) => {
    console.error(message, error);
    setState(prev => ({ ...prev, error: message }));
  };

  const fetchEmails = React.useCallback(
    async (accountEmail: string, folder: string, force = false) => {
      const now = Date.now();
      const lastFetch = lastFetchRef.current;
      
      if (!accountEmail) {
        debug("Error: No account email provided");
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: "No email account email provided" 
        }));
        return;
      }
      
      if (!force && 
          lastFetch.accountId === accountEmail && 
          lastFetch.folder === folder && 
          now - lastFetch.timestamp < 5000) {
        debug("Skipping fetch - too soon", { accountEmail, folder });
        return;
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        debug(`Fetching emails for ${accountEmail}`, { folder });
        
        // Use the correct endpoint based on folder
        let endpoint = '';
        let params = {};
        
        switch(folder) {
          case 'drafts':
            endpoint = `/api/emails/v2/${accountEmail}/drafts`;
            break;
          case 'sent':
            endpoint = `/api/emails/v2/${accountEmail}/sent`;
            break;
          default:
            endpoint = `/api/emails/v2/${accountEmail}/emails`;
            params = { folder, timestamp: now };
        }
        
        console.log(`API URL: ${apiBaseUrl}${endpoint}`, params);
        
        const response = await api.get(endpoint, { params });
        
        // Handle the response safely
        const responseData = response.data;
        let emailsData: EmailResponse[] = [];
        
        // Safely handle different response formats
        if (responseData) {
          if (Array.isArray(responseData)) {
            // Direct array response
            emailsData = responseData;
            debug(`Received ${emailsData.length} emails directly as array`);
          } 
          else if (typeof responseData === 'object') {
            // Object with emails property
            if ('emails' in responseData && Array.isArray(responseData.emails)) {
              emailsData = responseData.emails;
              debug(`Received ${emailsData.length} emails in pagination format`);
              
              // Log pagination info if present
              if ('pagination' in responseData) {
                debug('Pagination info:', responseData.pagination);
              }
            }
            // For drafts folder special case
            else if ('drafts' in responseData && Array.isArray(responseData.drafts)) {
              emailsData = responseData.drafts;
              debug(`Received ${emailsData.length} drafts`);
            }
            // Single email response
            else if ('_id' in responseData) {
              emailsData = [responseData as EmailResponse];
              debug(`Received a single email`);
            }
            else {
              // If we didn't find any emails but the response is valid, just use an empty array
              debug("Response format recognized but no emails found", responseData);
              emailsData = [];
            }
          }
          else {
            debug("Unexpected response format", responseData);
            throw new Error("Unexpected response format from email API");
          }
        }
        
        debug(`Processing ${emailsData.length} emails for ${accountEmail} in ${folder}`);

        // Map emails safely - handle empty array case
        const emails: EmailData[] = Array.isArray(emailsData) && emailsData.length > 0 
          ? emailsData.map(email => ({
              id: email._id,
              subject: email.subject || "(No Subject)",
              from: {
                name: email.from?.name || email.from?.email?.split("@")[0] || "Unknown",
                email: email.from?.email || "",
                avatar: email.from?.name ? email.from.name.charAt(0).toUpperCase() : "?",
              },
              to: Array.isArray(email.to) ? email.to.map(t => ({
                name: t.name || t.email.split("@")[0],
                email: t.email,
              })) : [],
              content: email.body?.html || email.body?.text || "",
              preview: email.snippet || "",
              date: new Date(email.date).toLocaleString(),
              timestamp: new Date(email.date).getTime(),
              isRead: email.read === true,
              isStarred: email.starred === true,
              hasAttachments: Array.isArray(email.attachments) && email.attachments.length > 0,
              attachments: email.attachments?.map(att => ({
                id: att.id || att._id || "",
                name: att.filename,
                size: att.size || 0,
                type: att.contentType,
                url: `${apiBaseUrl}/api/emails/v2/${accountEmail}/emails/${email._id}/attachments/${att.id || att._id}`,
              })),
              labels: email.labels || [],
              folder: email.folder || folder,
            }))
          : [];

        // Calculate unread counts
        const unreadCounts = {
          inbox: emails.filter(e => e.folder === "inbox" && !e.isRead).length,
          drafts: emails.filter(e => e.folder === "drafts").length,
          sent: emails.filter(e => e.folder === "sent").length,
          starred: emails.filter(e => e.isStarred).length,
          trash: emails.filter(e => e.folder === "trash").length,
        };

        lastFetchRef.current = { accountId: accountEmail, folder, timestamp: now };

        debug("Setting state with fetched emails", { 
          account: accountEmail,
          folder,
          total: emails.length,
          unread: unreadCounts.inbox 
        });

        setState(prev => ({
          ...prev,
          emails,
          filteredEmails: prev.searchTerm 
            ? emails.filter(email => 
                [
                  email.subject,
                  email.from.name,
                  email.from.email,
                  email.preview,
                  ...(email.to.map(to => `${to.name} ${to.email}`)),
                ].some(field => field.toLowerCase().includes(prev.searchTerm.toLowerCase()))
              )
            : emails,
          loading: false,
          unreadCounts,
          unreadCount: unreadCounts.inbox,
          error: null,
        }));

      } catch (error) {
        console.error("Error fetching emails:", error);
        setState(prev => ({ 
          ...prev, 
          loading: false,
          emails: [],
          filteredEmails: [],
          error: error instanceof Error ? error.message : "Failed to fetch emails"
        }));
      }
    },
    [api, apiBaseUrl]
  );

  const initialize = React.useCallback(async () => {
    if (initialized.current) {
      debug("Already initialized, skipping");
      return;
    }

    debug("Initializing email client");
    initialized.current = true;

    try {
      const { data } = await api.get<EmailAccountResponse[]>("/api/emails/auth/connected");
      debug("Received accounts", data);

      if (!Array.isArray(data) || data.length === 0) {
        debug("No accounts found");
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const accounts = data.map(account => ({
        id: account._id,
        name: account.name || account.email.split("@")[0],
        email: account.email,
        avatar: account.avatar || account.email.charAt(0).toUpperCase(),
        provider: account.provider,
      }));

      debug("Transformed accounts", accounts);

      if (accounts.length > 0) {
        const firstAccount = accounts[0];
        debug("Setting first account as active", firstAccount);

        // Always check for email instead of ID
        if (!firstAccount.email) {
          debug("First account has no email address", firstAccount);
          setState(prev => ({ 
            ...prev, 
            accounts,
            loading: false,
            error: "Account has no email address"
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          accounts,
          selectedAccount: firstAccount.id || "default-id",
          selectedAccountEmail: firstAccount.email,
          loading: true,
        }));

        // Use firstAccount.id for consistency in the app, but it will look up the email when needed
        await fetchEmails(firstAccount.email, "inbox", true);
      }
    } catch (error) {
      console.error("Error initializing email client:", error);
      handleError(error, "Failed to initialize email client");
    }
  }, [api, fetchEmails]);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  // Search effect
  React.useEffect(() => {
    if (!state.searchTerm) {
      setState(prev => ({ ...prev, filteredEmails: prev.emails }));
      return;
    }

    const term = state.searchTerm.toLowerCase();
    const filtered = state.emails.filter(email =>
      [
        email.subject,
        email.from.name,
        email.from.email,
        email.preview,
        ...(email.to.map(to => `${to.name} ${to.email}`)),
      ].some(field => field.toLowerCase().includes(term))
    );

    setState(prev => ({ ...prev, filteredEmails: filtered }));
  }, [state.searchTerm, state.emails]);

  // Navigation state effect
  React.useEffect(() => {
    if (state.selectedEmailId) {
      const currentIndex = state.filteredEmails.findIndex(
        email => email.id === state.selectedEmailId
      );
      setState(prev => ({
        ...prev,
        hasPreviousEmail: currentIndex > 0,
        hasNextEmail: currentIndex < state.filteredEmails.length - 1,
      }));
    }
  }, [state.selectedEmailId, state.filteredEmails]);

  const handlers = {
    handleAccountChange: (accountId: string) => {
      debug("Changing account", accountId);
      
      const account = state.accounts.find(a => a.id === accountId);
      
      if (!account) {
        debug("Error: No matching account found for ID", accountId);
        setState(prev => ({ ...prev, error: "Invalid account ID" }));
        return;
      }
      
      if (!account.email) {
        debug("Error: Account has no email address", account);
        setState(prev => ({ ...prev, error: "Selected account has no email address" }));
        return;
      }
      
      if (accountId === state.selectedAccount && !state.loading) {
        debug("Account already selected, refreshing emails");
        fetchEmails(account.email, state.currentFolder, true);
        return;
      }
      
      setState(prev => ({
        ...prev,
        selectedAccount: accountId,
        selectedAccountEmail: account.email,
        currentFolder: "inbox",
        selectedEmailId: null,
        detailViewOpen: false,
        searchTerm: "",
        emails: [],
        filteredEmails: [],
        loading: true,
        error: null,
      }));
      
      fetchEmails(account.email, "inbox", true);
    },

    handleFolderChange: (folder: string) => {
      debug("Changing folder", folder);
      setState(prev => ({
        ...prev,
        currentFolder: folder,
        selectedEmailId: null,
        detailViewOpen: false,
        loading: true,
      }));
      fetchEmails(state.selectedAccountEmail, folder);
    },

    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setState(prev => ({ ...prev, searchTerm: event.target.value }));
    },

    handleClearSearch: () => {
      setState(prev => ({ ...prev, searchTerm: "" }));
    },

    handleRefresh: () => {
      debug("Manual refresh requested");
      if (!state.selectedAccountEmail) {
        debug("No account selected, cannot refresh");
        setState(prev => ({ ...prev, error: "No email account selected" }));
        return;
      }
      fetchEmails(state.selectedAccountEmail, state.currentFolder, true);
    },

    handleEmailSelect: async (emailId: string) => {
      debug("Selecting email", emailId);
      const emailToUpdate = state.emails.find(email => email.id === emailId);

      if (emailToUpdate && !emailToUpdate.isRead) {
        try {
          if (!state.selectedAccountEmail) {
            throw new Error("No account email selected");
          }
          
          // Silently mark as read in UI even if API fails
          const updatedEmails = state.emails.map(email =>
            email.id === emailId ? { ...email, isRead: true } : email
          );

          setState(prev => ({
            ...prev,
            emails: updatedEmails,
            filteredEmails: prev.searchTerm
              ? updatedEmails.filter(email =>
                  [
                    email.subject,
                    email.from.name,
                    email.from.email,
                    email.preview,
                    ...(email.to.map(to => `${to.name} ${to.email}`)),
                  ].some(field => field.toLowerCase().includes(prev.searchTerm.toLowerCase()))
                )
              : updatedEmails,
            unreadCount: prev.unreadCount > 0 ? prev.unreadCount - 1 : 0,
          }));
          
          // Try the API call - but don't await it to prevent blocking UI
          api.patch(`/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}/read`)
            .catch(error => {
              console.warn("Failed to mark email as read on server, but UI was updated", error);
            });

        } catch (error) {
          console.warn("Error updating read status locally:", error);
          // Don't display error to user - just continue with the UI flow
        }
      }

      setState(prev => ({
        ...prev,
        selectedEmailId: emailId,
        detailViewOpen: true,
      }));
    },

    handleCloseDetailView: () => {
      setState(prev => ({
        ...prev,
        selectedEmailId: null,
        detailViewOpen: false,
      }));
    },

    handleToggleStar: async (emailId: string) => {
      const emailToUpdate = state.emails.find(email => email.id === emailId);
      if (!emailToUpdate) return;

      try {
        if (!state.selectedAccountEmail) {
          throw new Error("No account email selected");
        }
        
        // Update UI optimistically
        const updatedEmails = state.emails.map(email =>
          email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
        );

        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
        }));
        
        // Try multiple endpoints - the first one that works will be used
        const endpoints = [
          `/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}/star`,
          `/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}`,
          `/api/emails/${state.selectedAccountEmail}/emails/${emailId}/star`,
        ];
        
        let success = false;
        
        for (const endpoint of endpoints) {
          try {
            if (endpoint.includes('/star')) {
              await api.patch(endpoint);
            } else {
              await api.patch(endpoint, { starred: !emailToUpdate.isStarred });
            }
            success = true;
            debug(`Star toggled using endpoint: ${endpoint}`);
            break;
          } catch (err) {
            console.warn(`Failed to toggle star using endpoint: ${endpoint}`, err);
            // Continue trying other endpoints
          }
        }
        
        if (!success) {
          console.error("All star endpoints failed, but UI was updated");
        }
      } catch (error) {
        console.warn("Error updating star status:", error);
        // Leave the optimistic UI update in place
      }
    },

    handleToggleRead: async (emailId: string) => {
      const emailToUpdate = state.emails.find(email => email.id === emailId);
      if (!emailToUpdate) return;

      try {
        if (!state.selectedAccountEmail) {
          throw new Error("No account email selected");
        }
        
        // Update UI optimistically
        const updatedEmails = state.emails.map(email =>
          email.id === emailId ? { ...email, isRead: !email.isRead } : email
        );

        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
          unreadCount: prev.unreadCount + (emailToUpdate.isRead ? 1 : -1),
        }));
        
        // Try multiple endpoints - the first one that works will be used
        const endpoints = [
          emailToUpdate.isRead 
            ? `/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}/unread` 
            : `/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}/read`,
          `/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}`,
          `/api/emails/${state.selectedAccountEmail}/emails/${emailId}/read`,
        ];
        
        let success = false;
        
        for (const endpoint of endpoints) {
          try {
            if (endpoint.includes('/read') || endpoint.includes('/unread')) {
              await api.patch(endpoint);
            } else {
              await api.patch(endpoint, { read: !emailToUpdate.isRead });
            }
            success = true;
            debug(`Read status toggled using endpoint: ${endpoint}`);
            break;
          } catch (err) {
            console.warn(`Failed to toggle read status using endpoint: ${endpoint}`, err);
            // Continue trying other endpoints
          }
        }
        
        if (!success) {
          console.error("All read status endpoints failed, but UI was updated");
        }
      } catch (error) {
        console.warn("Error updating read status:", error);
        // Leave the optimistic UI update in place
      }
    },

    handleMarkAllRead: async () => {
      if (!state.selectedAccountEmail) {
        debug("No account email selected");
        setState(prev => ({ ...prev, error: "No email account selected" }));
        return;
      }

      try {
        // There's no specific endpoint for marking all as read in the router
        // This endpoint may need to be adjusted based on your backend implementation
        await api.patch(`/api/emails/v2/${state.selectedAccountEmail}/mark-all-read`, {
          folder: state.currentFolder,
        });

        const updatedEmails = state.emails.map(email =>
          email.folder === state.currentFolder ? { ...email, isRead: true } : email
        );

        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
          unreadCount: 0,
        }));
      } catch (error) {
        handleError(error, "Failed to mark all as read");
      }
    },

    toggleMobileSidebar: () => {
      setState(prev => ({
        ...prev,
        mobileSidebarOpen: !prev.mobileSidebarOpen,
      }));
    },

    handleCompose: () => {
      setState(prev => ({
        ...prev,
        composeOpen: true,
        replyTo: null,
        forwardEmail: null,
      }));
    },

    handleCloseCompose: () => {
      setState(prev => ({
        ...prev,
        composeOpen: false,
        replyTo: null,
        forwardEmail: null,
      }));
    },

    handleReplyEmail: (email: EmailData) => {
      setState(prev => ({
        ...prev,
        composeOpen: true,
        replyTo: email,
        forwardEmail: null,
      }));
    },

    handleForwardEmail: (email: EmailData) => {
      setState(prev => ({
        ...prev,
        composeOpen: true,
        replyTo: null,
        forwardEmail: email,
      }));
    },

    handleDeleteEmail: async (emailId: string) => {
      try {
        if (!state.selectedAccountEmail) {
          throw new Error("No account email selected");
        }
        
        // Use the correct endpoint pattern
        await api.delete(`/api/emails/v2/${state.selectedAccountEmail}/emails/${emailId}`);
        
        const updatedEmails = state.emails.filter(email => email.id !== emailId);
        
        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
          selectedEmailId: null,
          detailViewOpen: false,
        }));
      } catch (error) {
        handleError(error, "Failed to delete email");
      }
    },

    handlePreviousEmail: () => {
      if (!state.selectedEmailId || !state.hasPreviousEmail) return;
      
      const currentIndex = state.filteredEmails.findIndex(
        email => email.id === state.selectedEmailId
      );
      
      if (currentIndex > 0) {
        const previousEmail = state.filteredEmails[currentIndex - 1];
        handlers.handleEmailSelect(previousEmail.id);
      }
    },

    handleNextEmail: () => {
      if (!state.selectedEmailId || !state.hasNextEmail) return;
      
      const currentIndex = state.filteredEmails.findIndex(
        email => email.id === state.selectedEmailId
      );
      
      if (currentIndex < state.filteredEmails.length - 1) {
        const nextEmail = state.filteredEmails[currentIndex + 1];
        handlers.handleEmailSelect(nextEmail.id);
      }
    },

    handleSendEmail: async (data: any) => {
      try {
        if (!state.selectedAccountEmail) {
          debug("No account email selected");
          setState(prev => ({ ...prev, error: "No email account selected" }));
          return;
        }

        // Update with the correct endpoint for sending emails
        await api.post(`/api/emails/v2/${state.selectedAccountEmail}/send`, data);
        handlers.handleCloseCompose();
        
        if (state.currentFolder === "sent") {
          handlers.handleRefresh();
        }
      } catch (error) {
        handleError(error, "Failed to send email");
      }
    },
  };

  const selectedEmail = state.selectedEmailId 
    ? state.emails.find(email => email.id === state.selectedEmailId) || null
    : null;

  return {
    state,
    handlers,
    selectedEmail,
  };
};
