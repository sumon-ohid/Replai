import * as React from 'react';
import { Box, useTheme, useMediaQuery, Drawer } from '@mui/material';
import { motion } from 'framer-motion';
import EmailSidebar from './EmailSidebar';
import EmailHeader from './EmailHeader';
import EmailList from './EmailList';
import EmailDetailView from './EmailDetailView';
import EmailMobileNav from './EmailMobileNav';
import { useEmailClient } from './useEmailClient';
import ComposeEmail from './ComposeEmail';

export default function EmailClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { 
    state, 
    handlers,
    selectedEmail,
  } = useEmailClient();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Mobile navigation - only visible on mobile */}
      {isMobile && <EmailMobileNav 
        currentFolder={state.currentFolder} 
        onOpenSidebar={handlers.toggleMobileSidebar}
        unreadCount={state.unreadCount}
      />}

      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {/* Sidebar - hidden on mobile, shown in drawer instead */}
        {!isMobile ? (
          <Box 
            sx={{ 
              width: 280, 
              flexShrink: 0,
              // border: '1px solid',
              borderColor: 'divider',
              display: { xs: 'none', md: 'block' }
            }}
          >
            <EmailSidebar
              accounts={state.accounts}
              selectedAccount={state.selectedAccount}
              currentFolder={state.currentFolder}
              unreadCounts={state.unreadCounts}
              onAccountChange={handlers.handleAccountChange}
              onFolderChange={handlers.handleFolderChange}
              onComposeClick={handlers.handleCompose}
              onCompose={handlers.handleCompose}
              onCloseMobileSidebar={handlers.toggleMobileSidebar}
              isMobile={isMobile}
            />
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={state.mobileSidebarOpen}
            onClose={handlers.toggleMobileSidebar}
            sx={{
              '& .MuiDrawer-paper': { 
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <EmailSidebar
              accounts={state.accounts}
              selectedAccount={state.selectedAccount}
              currentFolder={state.currentFolder}
              unreadCounts={state.unreadCounts}
              onAccountChange={handlers.handleAccountChange}
              onFolderChange={handlers.handleFolderChange}
              onComposeClick={handlers.handleCompose}
              onCompose={handlers.handleCompose}
              onCloseMobileSidebar={handlers.toggleMobileSidebar}
              isMobile={isMobile}
            />
          </Drawer>
        )}

        {/* Main content area */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: { xs: '100%', md: 'calc(100% - 280px)' }, 
          ...(isMobile ? { width: '100%' } : {}),
          backgroundColor: 'background.default',
          borderRadius: { xs: 2, md: 2 },
          border: 1,
          borderColor: 'divider',
          mt: { xs: 1, md: 0 },
        }}>
          {/* Header with search and actions */}
          <EmailHeader
            searchTerm={state.searchTerm}
            onSearchChange={handlers.handleSearchChange}
            onClearSearch={handlers.handleClearSearch}
            onRefresh={handlers.handleRefresh}
            isLoading={state.loading}
            currentFolder={state.currentFolder}
            onMarkAllRead={() => handlers.handleMarkAllRead()}
          />

          {/* Content: Either email list or email detail */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'hidden',
            position: 'relative',
            display: 'flex'
          }}>
            {/* Email List - hidden when viewing email on mobile */}
            <Box 
              sx={{ 
                flexGrow: 1,
                overflow: 'auto',
                display: (isMobile && state.detailViewOpen) ? 'none' : 'block',
                width: (isTablet && state.detailViewOpen) ? '40%' : '100%',
              }}
            >
              <EmailList
                emails={state.filteredEmails}
                loading={state.loading}
                onEmailClick={handlers.handleEmailSelect}
                onToggleStar={handlers.handleToggleStarEmail}
                onToggleRead={handlers.handleToggleRead}
                onDelete={handlers.handleDeleteEmail}
                selectedEmailId={state.selectedEmailId}
                onEmailSelect={handlers.handleEmailSelect}
                searchTerm={state.searchTerm}
                currentFolder={state.currentFolder}
              />
            </Box>

            {/* Email Detail View - shown when email selected */}
            {state.detailViewOpen && selectedEmail && (
              <Box 
                sx={{ 
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: { xs: 'absolute', md: 'relative' },
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'background.paper',
                  zIndex: 1,
                  ...(isTablet && !isMobile ? { width: '90%' } : {})
                }}
              >
                <EmailDetailView
                  email={selectedEmail}
                  onClose={handlers.handleCloseDetailView}
                  onPrevious={handlers.handlePreviousEmail}
                  onNext={handlers.handleNextEmail}
                  hasPrevious={state.hasPreviousEmail}
                  hasNext={state.hasNextEmail}
                  onReply={handlers.handleReplyEmail}
                  onForward={handlers.handleForwardEmail}
                  onDelete={handlers.handleDeleteEmail}
                  onToggleStar={handlers.handleToggleStar as any}
                  onToggleRead={handlers.handleToggleRead}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Compose Email Modal */}
      <ComposeEmail
        open={state.composeOpen}
        onClose={handlers.handleCloseCompose}
        replyTo={state.replyTo}
        forwardEmail={state.forwardEmail}
        onSend={handlers.handleSendEmail as any}
        selectedAccount={state.accounts.find(acc => acc.id === state.selectedAccount)}
      />
    </Box>
  );
}
