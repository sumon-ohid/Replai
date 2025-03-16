import * as React from 'react';
import axios from 'axios';

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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Demo accounts
const demoAccounts: EmailAccount[] = [
  { id: '1', name: 'Work Account', email: 'work@example.com', avatar: '💼', provider: 'gmail' },
  { id: '2', name: 'Personal Email', email: 'personal@example.com', avatar: '👤', provider: 'outlook' },
  { id: '3', name: 'Freelance', email: 'freelance@example.com', avatar: '🚀', provider: 'proton' },
];

// Generate demo emails
const generateDemoEmails = (accountId: string, folder: string): EmailData[] => {
  const account = demoAccounts.find(a => a.id === accountId);
  const emails: EmailData[] = [];
  
  const count = folder === 'inbox' ? 25 : folder === 'sent' ? 15 : folder === 'drafts' ? 8 : 10;
  
  for (let i = 0; i < count; i++) {
    const id = `${folder}-${accountId}-${i}`;
    const timestamp = Date.now() - i * 3600000 * (Math.random() * 24 + 1);
    const date = new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let from, to;
    if (folder === 'sent') {
      from = { name: account?.name || 'Me', email: account?.email || 'me@example.com' };
      to = [{ name: `Recipient ${i + 1}`, email: `recipient${i + 1}@example.com` }];
    } else {
      from = { 
        name: `Contact ${i + 1}`, 
        email: `contact${i + 1}@example.com`,
        avatar: `Contact ${i + 1}`.charAt(0).toUpperCase(),
      };
      to = [{ name: account?.name || 'Me', email: account?.email || 'me@example.com' }];
    }

    const isRead = folder === 'inbox' ? Math.random() > 0.35 : true;
    
    const subjects = [
      'Project update for Q2',
      'Meeting notes from yesterday',
      'Important: Please review by EOD',
      'New feature rollout scheduled',
      'Weekend team-building event',
      'Client feedback on latest design',
      'Reminder: Performance reviews due',
      'Office closure notification',
      'Budget approval needed',
      'Training opportunity available'
    ];

    emails.push({
      id,
      subject: folder === 'drafts' ? `Draft: ${subjects[i % subjects.length]}` : subjects[i % subjects.length],
      from,
      to,
      content: `<p>Hello,</p><p>This is a sample email content for demonstration purposes.</p><p>This would contain the full message body with formatting, links, and possibly inline images.</p><p>Best regards,<br>${from.name}</p>`,
      preview: "This is a sample email content for demonstration purposes. This would contain the beginning of the message...",
      date,
      timestamp,
      isRead,
      isStarred: Math.random() > 0.8,
      hasAttachments: Math.random() > 0.7,
      attachments: Math.random() > 0.7 ? [
        {
          id: `att-${id}-1`,
          name: 'document.pdf',
          size: 1240000,
          type: 'application/pdf',
          url: '#',
        },
        {
          id: `att-${id}-2`,
          name: 'image.jpg',
          size: 540000,
          type: 'image/jpeg',
          url: '#',
        }
      ] : undefined,
      labels: Math.random() > 0.6 ? ['important'] : [],
      folder,
    });
  }

  return emails;
};

export const useEmailClient = () => {
  const [state, setState] = React.useState<EmailClientState>({
    accounts: demoAccounts,
    selectedAccount: '1',
    emails: [],
    filteredEmails: [],
    loading: true,
    searchTerm: '',
    currentFolder: 'inbox',
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

  // Selected email calculation
  const selectedEmail = React.useMemo(() => {
    if (!state.selectedEmailId) return null;
    return state.emails.find(email => email.id === state.selectedEmailId) || null;
  }, [state.emails, state.selectedEmailId]);

  // Calculate navigation state
  React.useEffect(() => {
    if (state.selectedEmailId) {
      const currentIndex = state.filteredEmails.findIndex(email => email.id === state.selectedEmailId);
      const hasPrevious = currentIndex > 0;
      const hasNext = currentIndex < state.filteredEmails.length - 1 && currentIndex !== -1;
      
      setState(prev => ({
        ...prev,
        hasPreviousEmail: hasPrevious,
        hasNextEmail: hasNext,
      }));
    }
  }, [state.selectedEmailId, state.filteredEmails]);

  // Fetch emails based on selected account and folder
  const fetchEmails = React.useCallback(async (accountId: string = state.selectedAccount, folder: string = state.currentFolder) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Replace this with your actual API call
      // const response = await axios.get(`${apiBaseUrl}/api/emails`, {
      //   params: { accountId, folder },
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // const emails = response.data;
      
      // For demo purposes, use generated data
      const emails = generateDemoEmails(accountId, folder);
      
      // Calculate unread counts
      const unreadCounts: Record<string, number> = { 
        inbox: emails.filter(e => e.folder === 'inbox' && !e.isRead).length,
        drafts: emails.filter(e => e.folder === 'drafts').length,
        sent: 0,
        starred: emails.filter(e => e.isStarred).length,
        trash: 0
      };
      
      setState(prev => ({ 
        ...prev, 
        emails: emails, 
        filteredEmails: emails,
        loading: false,
        unreadCounts,
        unreadCount: unreadCounts.inbox
      }));
    } catch (error) {
      console.error('Error fetching emails:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.selectedAccount, state.currentFolder]);

  // Initialize with emails
  React.useEffect(() => {
    fetchEmails(state.selectedAccount, state.currentFolder);
  }, [state.selectedAccount, state.currentFolder]);

  // Apply search filter
  React.useEffect(() => {
    if (state.searchTerm === '') {
      setState(prev => ({ ...prev, filteredEmails: prev.emails }));
      return;
    }
    
    const term = state.searchTerm.toLowerCase();
    const filtered = state.emails.filter(email => 
      email.subject.toLowerCase().includes(term) ||
      email.from.name.toLowerCase().includes(term) ||
      email.from.email.toLowerCase().includes(term) ||
      email.to.some(to => to.name.toLowerCase().includes(term) || to.email.toLowerCase().includes(term)) ||
      email.preview.toLowerCase().includes(term)
    );
    
    setState(prev => ({ ...prev, filteredEmails: filtered }));
  }, [state.searchTerm, state.emails]);

  // Handlers
  const handlers = {
    handleAccountChange: (accountId: string) => {
      setState(prev => ({ ...prev, selectedAccount: accountId }));
      fetchEmails(accountId, state.currentFolder);
    },
    
    handleFolderChange: (folder: string) => {
      setState(prev => ({ 
        ...prev, 
        currentFolder: folder,
        selectedEmailId: null,
        detailViewOpen: false
      }));
      fetchEmails(state.selectedAccount, folder);
    },
    
    handleEmailSelect: (emailId: string) => {
      // Mark email as read when selected
      const emailToUpdate = state.emails.find(email => email.id === emailId);
      
      if (emailToUpdate && !emailToUpdate.isRead) {
        const updatedEmails = state.emails.map(email => 
          email.id === emailId ? { ...email, isRead: true } : email
        );
        
        setState(prev => ({ 
          ...prev, 
          emails: updatedEmails,
          filteredEmails: prev.searchTerm ? 
            updatedEmails.filter(email => 
              email.subject.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.from.name.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.preview.toLowerCase().includes(prev.searchTerm.toLowerCase())
            ) : updatedEmails,
          unreadCount: prev.unreadCount > 0 ? prev.unreadCount - 1 : 0,
          unreadCounts: {
            ...prev.unreadCounts,
            inbox: prev.unreadCounts.inbox > 0 ? prev.unreadCounts.inbox - 1 : 0
          }
        }));
      }
      
      setState(prev => ({ 
        ...prev, 
        selectedEmailId: emailId,
        detailViewOpen: true
      }));
    },
    
    handleCloseDetailView: () => {
      setState(prev => ({ 
        ...prev, 
        selectedEmailId: null,
        detailViewOpen: false
      }));
    },
    
    handleToggleStar: (emailId: string, event?: React.MouseEvent) => {
      if (event) event.stopPropagation();
      
      const updatedEmails = state.emails.map(email => 
        email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
      );
      
      setState(prev => ({ 
        ...prev, 
        emails: updatedEmails,
        filteredEmails: prev.searchTerm ? 
          updatedEmails.filter(email => 
            email.subject.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
            email.from.name.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
            email.preview.toLowerCase().includes(prev.searchTerm.toLowerCase())
          ) : updatedEmails
      }));
    },
    
    handleToggleStarEmail: (emailId: string) => {
      handlers.handleToggleStar(emailId);
    },
    
    handleToggleRead: (emailId: string, isRead: boolean, event?: React.MouseEvent) => {
      if (event) event.stopPropagation();
      
      const emailToUpdate = state.emails.find(email => email.id === emailId);
      if (!emailToUpdate) return;
      
      const wasUnread = !emailToUpdate.isRead;
      const updatedEmails = state.emails.map(email => 
        email.id === emailId ? { ...email, isRead } : email
      );
      
      setState(prev => {
        const unreadDelta = wasUnread && isRead ? -1 : !wasUnread && !isRead ? 1 : 0;
        
        return { 
          ...prev, 
          emails: updatedEmails,
          filteredEmails: prev.searchTerm ? 
            updatedEmails.filter(email => 
              email.subject.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.from.name.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.preview.toLowerCase().includes(prev.searchTerm.toLowerCase())
            ) : updatedEmails,
          unreadCount: Math.max(0, prev.unreadCount + unreadDelta),
          unreadCounts: {
            ...prev.unreadCounts,
            inbox: Math.max(0, prev.unreadCounts.inbox + unreadDelta)
          }
        };
      });
    },
    
    handleToggleReadEmail: (emailId: string) => {
      const email = state.emails.find(email => email.id === emailId);
      if (email) {
        handlers.handleToggleRead(emailId, !email.isRead);
      }
    },
    
    handleDelete: (emailId: string, event?: React.MouseEvent) => {
      if (event) event.stopPropagation();
      
      const emailToDelete = state.emails.find(email => email.id === emailId);
      if (!emailToDelete) return;
      
      const wasUnread = !emailToDelete.isRead;
      
      const updatedEmails = state.emails.filter(email => email.id !== emailId);
      
      setState(prev => ({
        ...prev,
        emails: updatedEmails,
        filteredEmails: prev.filteredEmails.filter(email => email.id !== emailId),
        unreadCount: wasUnread && emailToDelete.folder === 'inbox' 
          ? Math.max(0, prev.unreadCount - 1)
          : prev.unreadCount,
        unreadCounts: {
          ...prev.unreadCounts,
          inbox: wasUnread && emailToDelete.folder === 'inbox'
            ? Math.max(0, prev.unreadCounts.inbox - 1)
            : prev.unreadCounts.inbox
        }
      }));
      
      // If the deleted email was selected, close the detail view
      if (state.selectedEmailId === emailId) {
        handlers.handleCloseDetailView();
      }
    },
    
    handleDeleteEmail: (emailId: string) => {
      handlers.handleDelete(emailId);
    },
    
    // handleSearchChange: (term: string) => {
    //   setState(prev => ({ ...prev, searchTerm: term }));
    // },
    
    handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setState(prev => ({ ...prev, searchTerm: term }));
      },

    handleClearSearch: () => {
      setState(prev => ({ ...prev, searchTerm: '' }));
    },
    
    handleRefresh: () => {
      fetchEmails(state.selectedAccount, state.currentFolder);
    },
    
    handleMarkAllRead: () => {
      const updatedEmails = state.emails.map(email => 
        email.folder === state.currentFolder && !email.isRead 
          ? { ...email, isRead: true }
          : email
      );
      
      setState(prev => ({
        ...prev,
        emails: updatedEmails,
        filteredEmails: prev.searchTerm 
          ? updatedEmails.filter(email => 
              email.subject.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.from.name.toLowerCase().includes(prev.searchTerm.toLowerCase()) ||
              email.preview.toLowerCase().includes(prev.searchTerm.toLowerCase())
            )
          : updatedEmails,
        unreadCount: state.currentFolder === 'inbox' ? 0 : prev.unreadCount,
        unreadCounts: {
          ...prev.unreadCounts,
          inbox: state.currentFolder === 'inbox' ? 0 : prev.unreadCounts.inbox
        }
      }));
    },
    
    handlePreviousEmail: () => {
      if (!state.hasPreviousEmail) return;
      
      const currentIndex = state.filteredEmails.findIndex(email => email.id === state.selectedEmailId);
      if (currentIndex > 0) {
        const previousEmail = state.filteredEmails[currentIndex - 1];
        handlers.handleEmailSelect(previousEmail.id);
      }
    },
    
    handleNextEmail: () => {
      if (!state.hasNextEmail) return;
      
      const currentIndex = state.filteredEmails.findIndex(email => email.id === state.selectedEmailId);
      if (currentIndex !== -1 && currentIndex < state.filteredEmails.length - 1) {
        const nextEmail = state.filteredEmails[currentIndex + 1];
        handlers.handleEmailSelect(nextEmail.id);
      }
    },
    
    handleCompose: () => {
      setState(prev => ({ 
        ...prev, 
        composeOpen: true,
        replyTo: null,
        forwardEmail: null
      }));
    },
    
    handleReplyEmail: (email: EmailData) => {
      setState(prev => ({ 
        ...prev, 
        composeOpen: true,
        replyTo: email,
        forwardEmail: null
      }));
    },
    
    handleForwardEmail: (email: EmailData) => {
      setState(prev => ({ 
        ...prev, 
        composeOpen: true,
        replyTo: null,
        forwardEmail: email
      }));
    },
    
    handleCloseCompose: () => {
      setState(prev => ({ 
        ...prev, 
        composeOpen: false,
        replyTo: null,
        forwardEmail: null
      }));
    },
    
    toggleMobileSidebar: () => {
      setState(prev => ({ 
        ...prev, 
        mobileSidebarOpen: !prev.mobileSidebarOpen 
      }));
    },
    
    closeMobileSidebar: () => {
      setState(prev => ({ 
        ...prev, 
        mobileSidebarOpen: false
      }));
    },

    handleSendEmail: (data: any) => {
        console.log('Sending email:', data);
        // Replace this with your actual API call
        // axios.post(`${apiBaseUrl}/api/send-email`, data, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        // });
        
        setState(prev => ({ 
            ...prev, 
            composeOpen: false,
            replyTo: null,
            forwardEmail: null
        }));
    },
  };

  return { state, handlers, selectedEmail };
};