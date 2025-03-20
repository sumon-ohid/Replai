import * as React from "react";
import axios from "axios";
import { dA } from "@fullcalendar/core/internal-common";

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
        console.log(`API URL: ${apiBaseUrl}/api/emails/${accountEmail}/emails?folder=${folder}`);

        const response = await api.get(`/api/emails/${accountEmail}/emails`, {
          params: { folder, timestamp: now }
        });

        // Handle the new response format where emails are wrapped in an object
        const responseData = response.data;
        let emailsData: EmailResponse[] = [];
        
        if (responseData && typeof responseData === 'object') {
          // Check if response has emails array property
          if (Array.isArray(responseData.emails)) {
            emailsData = responseData.emails;
            debug(`Received ${emailsData.length} emails in pagination format`);
          } 
          // Fallback to check if response itself is an array
          else if (Array.isArray(responseData)) {
            emailsData = responseData;
            debug(`Received ${emailsData.length} emails directly as array`);
          }
          // If we have pagination data, log it
          if (responseData.pagination) {
            debug('Pagination info:', responseData.pagination);
          }
        } else {
          debug("Unexpected response format", responseData);
          throw new Error("Unexpected response format from email API");
        }

        debug(`Processing ${emailsData.length} emails for ${accountEmail} in ${folder}`);

        const emails: EmailData[] = emailsData.map(email => ({
          id: email._id,
          subject: email.subject || "(No Subject)",
          from: {
            name: email.from?.name || email.from?.email?.split("@")[0] || "Unknown",
            email: email.from?.email || "",
            avatar: email.from?.name ? email.from.name.charAt(0).toUpperCase() : "?",
          },
          to: email.to.map(t => ({
            name: t.name || t.email.split("@")[0],
            email: t.email,
          })),
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
            url: `${apiBaseUrl}/api/emails/attachments/${email._id}/${att.id || att._id}`,
          })),
          labels: email.labels || [],
          folder: email.folder || folder,
        }));

        // Calculate unread counts for all folders
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
          await api.post(`/api/emails/mark-read/${emailId}`);
          debug("Marked email as read", emailId);

          const updatedEmails = state.emails.map(email =>
            email.id === emailId ? { ...email, isRead: true } : email
          );

          setState(prev => ({
            ...prev,
            emails: updatedEmails,
            filteredEmails: prev.searchTerm
              ? updatedEmails.filter(email =>
                  email.subject.toLowerCase().includes(prev.searchTerm.toLowerCase())
                )
              : updatedEmails,
            unreadCount: prev.unreadCount > 0 ? prev.unreadCount - 1 : 0,
          }));
        } catch (error) {
          handleError(error, "Failed to mark email as read");
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
        await api.post(`/api/emails/toggle-star/${emailId}`);
        const updatedEmails = state.emails.map(email =>
          email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
        );

        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
        }));
      } catch (error) {
        handleError(error, "Failed to update star status");
      }
    },

    handleToggleRead: async (emailId: string) => {
      const emailToUpdate = state.emails.find(email => email.id === emailId);
      if (!emailToUpdate) return;

      try {
        await api.post(`/api/emails/mark-${emailToUpdate.isRead ? 'unread' : 'read'}/${emailId}`);
        const updatedEmails = state.emails.map(email =>
          email.id === emailId ? { ...email, isRead: !email.isRead } : email
        );

        setState(prev => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: updatedEmails,
          unreadCount: prev.unreadCount + (emailToUpdate.isRead ? 1 : -1),
        }));
      } catch (error) {
        handleError(error, "Failed to update read status");
      }
    },

    handleMarkAllRead: async () => {
      if (!state.selectedAccountEmail) {
        debug("No account email selected");
        setState(prev => ({ ...prev, error: "No email account selected" }));
        return;
      }

      try {
        await api.post(`/api/emails/mark-all-read/${state.selectedAccountEmail}`, {
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
        await api.delete(`/api/emails/delete/${emailId}`);
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

        await api.post(`/api/emails/send/${state.selectedAccountEmail}`, data);
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
