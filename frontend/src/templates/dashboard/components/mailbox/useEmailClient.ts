import * as React from "react";
import axios from "axios";

// Types
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
  to: {
    name: string;
    email: string;
  }[];
  cc?: {
    name: string;
    email: string;
  }[];
  bcc?: {
    name: string;
    email: string;
  }[];
  content: string;
  preview: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  labels?: string[];
  folder: string;
}

// State type
interface EmailClientState {
  accounts: EmailAccount[];
  selectedAccount: string;
  emails: EmailData[];
  filteredEmails: EmailData[];
  loading: boolean;
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

// Hook to manage email client state and actions
export const useEmailClient = () => {
  const [state, setState] = React.useState<EmailClientState>({
    accounts: [], // We'll fetch real accounts
    selectedAccount: "",
    emails: [],
    filteredEmails: [],
    loading: true,
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

  // Function to get JWT token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Create axios instance with auth headers
  const api = React.useMemo(() => {
    return axios.create({
      baseURL: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  }, [apiBaseUrl]);

  // Fetch user's email accounts
  const fetchAccounts = React.useCallback(async () => {
    try {
      const response = await api.get("/api/emails/auth/connected");
      const accounts = (response.data as any[]).map((account: any) => ({
        id: account._id,
        name: account.name || account.email.split("@")[0],
        email: account.email,
        avatar: account.avatar || account.email.charAt(0).toUpperCase(),
        provider: account.provider,
      }));

      if (accounts.length > 0) {
        setState((prev) => ({
          ...prev,
          accounts,
          selectedAccount: accounts[0].id,
          loading: false,
        }));

        // Fetch emails for the first account
        // fetchEmails(accounts[0].id, state.currentFolder);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching email accounts:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [api]);

  // Initialize by fetching accounts
  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Selected email calculation (keep as is)
  const selectedEmail = React.useMemo(() => {
    if (!state.selectedEmailId) return null;
    return (
      state.emails.find((email) => email.id === state.selectedEmailId) || null
    );
  }, [state.emails, state.selectedEmailId]);

  // Calculate navigation state (keep as is)
  React.useEffect(() => {
    if (state.selectedEmailId) {
      const currentIndex = state.filteredEmails.findIndex(
        (email) => email.id === state.selectedEmailId
      );
      const hasPrevious = currentIndex > 0;
      const hasNext =
        currentIndex < state.filteredEmails.length - 1 && currentIndex !== -1;

      setState((prev) => ({
        ...prev,
        hasPreviousEmail: hasPrevious,
        hasNextEmail: hasNext,
      }));
    }
  }, [state.selectedEmailId, state.filteredEmails]);

  // Fetch emails based on selected account and folder
  const fetchEmails = React.useCallback(
    async (
      accountId: string = state.selectedAccount,
      folder: string = state.currentFolder
    ) => {
      if (!accountId) return;

      setState((prev) => ({ ...prev, loading: true }));

      try {
        // Make real API call to fetch emails
        const email = state.accounts.find((a) => a.id === accountId)?.email;
        if (!email) {
          throw new Error("Email account not found");
          // Don't forget to set loading to false on error
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        // Updated to match backend route /api/emails/v2/list/:email
        const response = await api.get(`/api/emails/v2/list/${email}`, {
          params: { folder },
        });

        // Transform API data to match our format
        const emails: EmailData[] = (response.data as any[]).map(
          (email: any) => ({
            id: email._id,
            subject: email.subject || "(No Subject)",
            from: {
              name:
                email.from?.name ||
                email.from?.email.split("@")[0] ||
                "Unknown",
              email: email.from?.email || "",
              avatar: email.from?.name
                ? email.from.name.charAt(0).toUpperCase()
                : "?",
            },
            to: Array.isArray(email.to)
              ? email.to.map((t: any) => ({
                  name: t.name || t.email.split("@")[0],
                  email: t.email,
                }))
              : [],
            cc: Array.isArray(email.cc)
              ? email.cc.map((c: any) => ({
                  name: c.name || c.email.split("@")[0],
                  email: c.email,
                }))
              : [],
            bcc: Array.isArray(email.bcc)
              ? email.bcc.map((b: any) => ({
                  name: b.name || b.email.split("@")[0],
                  email: b.email,
                }))
              : [],
            content: email.body?.html || email.body?.text || "",
            preview: email.snippet || "",
            date: new Date(email.date).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: new Date(email.date).getTime(),
            isRead: email.read === true,
            isStarred: email.starred === true,
            hasAttachments:
              Array.isArray(email.attachments) && email.attachments.length > 0,
            attachments: Array.isArray(email.attachments)
              ? email.attachments.map((att: any) => ({
                  id: att.id || att._id,
                  name: att.filename,
                  size: att.size || 0,
                  type: att.contentType,
                  url: `${apiBaseUrl}/api/emails/attachments/${email._id}/${att.id}`,
                }))
              : [],
            labels: Array.isArray(email.labels) ? email.labels : [],
            folder: email.folder || folder,
          })
        );

        // Calculate unread counts
        const unreadCounts: Record<string, number> = {
          inbox: emails.filter((e) => e.folder === "inbox" && !e.isRead).length,
          drafts: emails.filter((e) => e.folder === "drafts").length,
          sent: 0,
          starred: emails.filter((e) => e.isStarred).length,
          trash: 0,
        };

        setState((prev) => ({
          ...prev,
          emails,
          filteredEmails: emails,
          loading: false,
          unreadCounts,
          unreadCount: unreadCounts.inbox,
        }));
      } catch (error) {
        console.error("Error fetching emails:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    },
    [api, apiBaseUrl, state.accounts]
  );

  // Initialize with emails (only if account is selected)
  React.useEffect(() => {
    if (state.selectedAccount && state.accounts.length > 0) {
      fetchEmails(state.selectedAccount, state.currentFolder);
    }
  }, [state.selectedAccount, state.currentFolder, state.accounts.length, fetchEmails]);

  // Apply search filter (keep as is)
  React.useEffect(() => {
    if (state.searchTerm === "") {
      setState((prev) => ({ ...prev, filteredEmails: prev.emails }));
      return;
    }

    const term = state.searchTerm.toLowerCase();
    const filtered = state.emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(term) ||
        email.from.name.toLowerCase().includes(term) ||
        email.from.email.toLowerCase().includes(term) ||
        email.to.some(
          (to) =>
            to.name.toLowerCase().includes(term) ||
            to.email.toLowerCase().includes(term)
        ) ||
        email.preview.toLowerCase().includes(term)
    );

    setState((prev) => ({ ...prev, filteredEmails: filtered }));
  }, [state.searchTerm, state.emails]);

  // Update the handlers to use real API calls
  const handlers = {
    handleAccountChange: (accountId: string) => {
      setState((prev) => ({ ...prev, selectedAccount: accountId }));
      fetchEmails(accountId, state.currentFolder);
    },

    handleFolderChange: (folder: string) => {
      setState((prev) => ({
        ...prev,
        currentFolder: folder,
        selectedEmailId: null,
        detailViewOpen: false,
      }));
      fetchEmails(state.selectedAccount, folder);
    },

    handleEmailSelect: async (emailId: string) => {
      // Mark email as read when selected
      const emailToUpdate = state.emails.find((email) => email.id === emailId);

      if (emailToUpdate && !emailToUpdate.isRead) {
        try {
          // Call API to mark as read
          await api.post(`/api/emails/v2/mark-read/${emailId}`);

          const updatedEmails = state.emails.map((email) =>
            email.id === emailId ? { ...email, isRead: true } : email
          );

          setState((prev) => ({
            ...prev,
            emails: updatedEmails,
            filteredEmails: prev.searchTerm
              ? updatedEmails.filter(
                  (email) =>
                    email.subject
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase()) ||
                    email.from.name
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase()) ||
                    email.preview
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase())
                )
              : updatedEmails,
            unreadCount: prev.unreadCount > 0 ? prev.unreadCount - 1 : 0,
            unreadCounts: {
              ...prev.unreadCounts,
              inbox:
                prev.unreadCounts.inbox > 0 ? prev.unreadCounts.inbox - 1 : 0,
            },
          }));
        } catch (error) {
          console.error("Error marking email as read:", error);
        }
      }

      setState((prev) => ({
        ...prev,
        selectedEmailId: emailId,
        detailViewOpen: true,
      }));
    },

    handleCloseDetailView: () => {
      setState((prev) => ({
        ...prev,
        selectedEmailId: null,
        detailViewOpen: false,
      }));
    },

    handleToggleStar: async (
      emailId: string,
      starredOrEvent?: boolean | React.MouseEvent
    ) => {
      // Get current star state
      const email = state.emails.find((e) => e.id === emailId);
      if (!email) return;

      const newStarred =
        typeof starredOrEvent === "boolean" ? starredOrEvent : !email.isStarred;

      try {
        // Call API to toggle star
        await api.post(`/api/emails/v2/star/${emailId}`, {
          starred: newStarred,
        });

        // Update local state
        const updatedEmails = state.emails.map((email) =>
          email.id === emailId ? { ...email, isStarred: newStarred } : email
        );

        setState((prev) => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: prev.searchTerm
            ? updatedEmails.filter(
                (email) =>
                  email.subject
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase()) ||
                  email.from.name
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase()) ||
                  email.preview
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase())
              )
            : updatedEmails,
        }));
      } catch (error) {
        console.error("Error toggling star:", error);
      }
    },

    handleToggleStarEmail: (emailId: string) => {
      handlers.handleToggleStar(emailId);
    },

    handleToggleRead: async (
      emailId: string,
      isRead: boolean,
      event?: React.MouseEvent
    ) => {
      if (event) event.stopPropagation();

      try {
        // Call API to mark as read/unread
        if (isRead) {
          await api.post(`/api/emails/v2/mark-read/${emailId}`);
        } else {
          await api.post(`/api/emails/v2/mark-unread/${emailId}`);
        }

        const emailToUpdate = state.emails.find(
          (email) => email.id === emailId
        );
        if (!emailToUpdate) return;

        const wasUnread = !emailToUpdate.isRead;
        const updatedEmails = state.emails.map((email) =>
          email.id === emailId ? { ...email, isRead } : email
        );

        setState((prev) => {
          const unreadDelta =
            wasUnread && isRead ? -1 : !wasUnread && !isRead ? 1 : 0;

          return {
            ...prev,
            emails: updatedEmails,
            filteredEmails: prev.searchTerm
              ? updatedEmails.filter(
                  (email) =>
                    email.subject
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase()) ||
                    email.from.name
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase()) ||
                    email.preview
                      .toLowerCase()
                      .includes(prev.searchTerm.toLowerCase())
                )
              : updatedEmails,
            unreadCount: Math.max(0, prev.unreadCount + unreadDelta),
            unreadCounts: {
              ...prev.unreadCounts,
              inbox: Math.max(0, prev.unreadCounts.inbox + unreadDelta),
            },
          };
        });
      } catch (error) {
        console.error("Error toggling read status:", error);
      }
    },

    handleToggleReadEmail: (emailId: string) => {
      const email = state.emails.find((email) => email.id === emailId);
      if (email) {
        handlers.handleToggleRead(emailId, !email.isRead);
      }
    },

    handleDelete: async (emailId: string, event?: React.MouseEvent) => {
      if (event) event.stopPropagation();

      try {
        // Call API to delete email (or move to trash)
        await api.delete(`/api/emails/v2/delete/${emailId}`);

        const emailToDelete = state.emails.find(
          (email) => email.id === emailId
        );
        if (!emailToDelete) return;

        const wasUnread = !emailToDelete.isRead;

        const updatedEmails = state.emails.filter(
          (email) => email.id !== emailId
        );

        setState((prev) => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: prev.filteredEmails.filter(
            (email) => email.id !== emailId
          ),
          unreadCount:
            wasUnread && emailToDelete.folder === "inbox"
              ? Math.max(0, prev.unreadCount - 1)
              : prev.unreadCount,
          unreadCounts: {
            ...prev.unreadCounts,
            inbox:
              wasUnread && emailToDelete.folder === "inbox"
                ? Math.max(0, prev.unreadCounts.inbox - 1)
                : prev.unreadCounts.inbox,
          },
        }));

        // If the deleted email was selected, close the detail view
        if (state.selectedEmailId === emailId) {
          handlers.handleCloseDetailView();
        }
      } catch (error) {
        console.error("Error deleting email:", error);
      }
    },

    handleDeleteEmail: (emailId: string) => {
      handlers.handleDelete(emailId);
    },

    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value;
      setState((prev) => ({ ...prev, searchTerm: term }));
    },

    handleClearSearch: () => {
      setState((prev) => ({ ...prev, searchTerm: "" }));
    },

    handleRefresh: () => {
      fetchEmails(state.selectedAccount, state.currentFolder);
    },

    handleMarkAllRead: async () => {
      try {
        const email = state.accounts.find(
          (a) => a.id === state.selectedAccount
        )?.email;
        if (!email) return;
        // Call API to mark all as read
        await api.post(`/api/emails/v2/mark-all-read/${email}`, {
          folder: state.currentFolder,
        });

        const updatedEmails = state.emails.map((email) =>
          email.folder === state.currentFolder && !email.isRead
            ? { ...email, isRead: true }
            : email
        );

        setState((prev) => ({
          ...prev,
          emails: updatedEmails,
          filteredEmails: prev.searchTerm
            ? updatedEmails.filter(
                (email) =>
                  email.subject
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase()) ||
                  email.from.name
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase()) ||
                  email.preview
                    .toLowerCase()
                    .includes(prev.searchTerm.toLowerCase())
              )
            : updatedEmails,
          unreadCount: state.currentFolder === "inbox" ? 0 : prev.unreadCount,
          unreadCounts: {
            ...prev.unreadCounts,
            inbox:
              state.currentFolder === "inbox" ? 0 : prev.unreadCounts.inbox,
          },
        }));
      } catch (error) {
        console.error("Error marking all as read:", error);
      }
    },

    // Navigation methods remain the same
    handlePreviousEmail: () => {
      if (!state.hasPreviousEmail) return;

      const currentIndex = state.filteredEmails.findIndex(
        (email) => email.id === state.selectedEmailId
      );
      if (currentIndex > 0) {
        const previousEmail = state.filteredEmails[currentIndex - 1];
        handlers.handleEmailSelect(previousEmail.id);
      }
    },

    handleNextEmail: () => {
      if (!state.hasNextEmail) return;

      const currentIndex = state.filteredEmails.findIndex(
        (email) => email.id === state.selectedEmailId
      );
      if (
        currentIndex !== -1 &&
        currentIndex < state.filteredEmails.length - 1
      ) {
        const nextEmail = state.filteredEmails[currentIndex + 1];
        handlers.handleEmailSelect(nextEmail.id);
      }
    },

    handleCompose: () => {
      setState((prev) => ({
        ...prev,
        composeOpen: true,
        replyTo: null,
        forwardEmail: null,
      }));
    },

    handleReplyEmail: (email: EmailData) => {
      setState((prev) => ({
        ...prev,
        composeOpen: true,
        replyTo: email,
        forwardEmail: null,
      }));
    },

    handleForwardEmail: (email: EmailData) => {
      setState((prev) => ({
        ...prev,
        composeOpen: true,
        replyTo: null,
        forwardEmail: email,
      }));
    },

    handleCloseCompose: () => {
      setState((prev) => ({
        ...prev,
        composeOpen: false,
        replyTo: null,
        forwardEmail: null,
      }));
    },

    toggleMobileSidebar: () => {
      setState((prev) => ({
        ...prev,
        mobileSidebarOpen: !prev.mobileSidebarOpen,
      }));
    },

    closeMobileSidebar: () => {
      setState((prev) => ({
        ...prev,
        mobileSidebarOpen: false,
      }));
    },

    handleSendEmail: async (data: any) => {
      try {
        const email = state.accounts.find(
          (a) => a.id === state.selectedAccount
        )?.email;
        if (!email) return;

        // Update to use the correct send endpoint
        await api.post(`/api/emails/v2/send/${email}`, {
          to: data.to,
          cc: data.cc,
          bcc: data.bcc,
          subject: data.subject,
          body: data.body,
          attachments: data.attachments,
        });

        setState((prev) => ({
          ...prev,
          composeOpen: false,
          replyTo: null,
          forwardEmail: null,
        }));

        // Refresh the sent folder if we're in it
        if (state.currentFolder === "sent") {
          fetchEmails(state.selectedAccount, "sent");
        }
      } catch (error) {
        console.error("Error sending email:", error);
        alert("Failed to send email. Please try again.");
      }
    },
  };

  return { state, handlers, selectedEmail };
};
