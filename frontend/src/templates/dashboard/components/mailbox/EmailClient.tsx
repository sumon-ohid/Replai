import * as React from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import EmailSidebar from "./EmailSidebar";
import EmailHeader from "./EmailHeader";
import EmailList from "./EmailList";
import EmailDetailView from "./EmailDetailView";
import EmailMobileNav from "./EmailMobileNav";
import ComposeEmail from "./ComposeEmail";
import { useEmailClient, EmailAccount } from "./useEmailClient";

export default function EmailClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const { state, handlers, selectedEmail } = useEmailClient();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // Auto-collapse sidebar on smaller screens
  React.useEffect(() => {
    if (isTablet && !isMobile) {
      setSidebarCollapsed(true);
    } else if (!isTablet) {
      setSidebarCollapsed(false);
    }
  }, [isTablet, isMobile]);

  // Reset pagination when folder or search term changes
  React.useEffect(() => {
    setPage(0);
  }, [state.currentFolder, state.searchTerm]);

  // Show loading state for longer operations
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (state.loading) {
        console.log("Long running operation detected");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.loading]);

  // Handle errors
  React.useEffect(() => {
    if (state.error) {
      setError(state.error);
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  // Calculate paginated emails
  const paginatedEmails = React.useMemo(() => {
    const startIndex = page * rowsPerPage;
    return state.filteredEmails.slice(startIndex, startIndex + rowsPerPage);
  }, [state.filteredEmails, page, rowsPerPage]);

  // Handlers
  const handleToggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const handleToggleFullScreen = () => setIsFullScreen(prev => !prev);
  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? 72 : 280;

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isFullScreen ? "100vh" : "calc(100vh - 64px)",
        maxHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
        position: isFullScreen ? "fixed" : "relative",
        top: isFullScreen ? 0 : "auto",
        left: isFullScreen ? 0 : "auto",
        right: isFullScreen ? 0 : "auto",
        bottom: isFullScreen ? 0 : "auto",
        zIndex: isFullScreen ? 1300 : "auto",
        m: isFullScreen ? 0 : undefined,
        p: isFullScreen ? 0 : undefined,
      }}
    >
      {/* Mobile navigation */}
      {isMobile && (
        <EmailMobileNav
          currentFolder={state.currentFolder}
          onOpenSidebar={handlers.toggleMobileSidebar}
          unreadCount={state.unreadCount}
          onCompose={handlers.handleCompose}
        />
      )}

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={5000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Loading Overlay */}
        {state.loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0, 0, 0, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1400,
              backdropFilter: "blur(2px)",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Sidebar */}
        {!isMobile ? (
          <Box
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              borderColor: "divider",
              display: { xs: "none", md: "block" },
              transition: theme.transitions.create("width"),
              position: "relative",
            }}
          >
            <EmailSidebar
              accounts={state.accounts}
              selectedAccount={state.selectedAccount}
              currentFolder={state.currentFolder}
              unreadCounts={state.unreadCounts}
              onAccountChange={handlers.handleAccountChange}
              onFolderChange={handlers.handleFolderChange}
              onCompose={handlers.handleCompose}
              onCloseMobileSidebar={handlers.toggleMobileSidebar}
              isMobile={isMobile}
              collapsed={sidebarCollapsed}
            />
          </Box>
        ) : (
          <Drawer
            anchor="left"
            open={state.mobileSidebarOpen}
            onClose={handlers.toggleMobileSidebar}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: 280,
                boxSizing: "border-box",
                bgcolor: "background.paper",
              },
              display: { xs: "block", md: "none" },
              zIndex: 1500,
            }}
          >
            <EmailSidebar
              key={state.selectedAccount}
              accounts={state.accounts}
              selectedAccount={state.selectedAccount}
              currentFolder={state.currentFolder}
              unreadCounts={state.unreadCounts}
              onAccountChange={handlers.handleAccountChange}
              onFolderChange={(folder) => {
                handlers.handleFolderChange(folder);
                handlers.toggleMobileSidebar();
              }}
              onCompose={handlers.handleCompose}
              onCloseMobileSidebar={handlers.toggleMobileSidebar}
              isMobile={true}
              collapsed={false}
            />
          </Drawer>
        )}

        {/* Main content area */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            width: {
              xs: "100%",
              md: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
            },
            backgroundColor: "background.default",
            borderRadius: isFullScreen ? 0 : { xs: 1, md: 2 },
            border: isFullScreen ? 0 : 1,
            borderColor: "divider",
            mt: isFullScreen ? 0 : { xs: 1, md: 0 },
            transition: theme.transitions.create(["width", "margin", "border-radius"]),
          }}
        >
          {/* Header */}
          <EmailHeader
            searchTerm={state.searchTerm}
            onSearchChange={handlers.handleSearchChange}
            onClearSearch={handlers.handleClearSearch}
            onRefresh={handlers.handleRefresh}
            isLoading={state.loading}
            currentFolder={state.currentFolder}
            onMarkAllRead={handlers.handleMarkAllRead}
            onToggleSidebar={!isMobile ? handleToggleSidebar : undefined}
            isSidebarCollapsed={!isMobile ? sidebarCollapsed : false}
            isFullScreen={isFullScreen}
            onToggleFullScreen={handleToggleFullScreen}
          />

          {/* Content */}
          <Box
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              position: "relative",
              display: "flex",
            }}
          >
            {/* Email List */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: "auto",
                display: isMobile && state.detailViewOpen ? "none" : "block",
                width: isTablet && state.detailViewOpen ? "40%" : "100%",
                zIndex: 0,
              }}
            >
              <EmailList
                emails={paginatedEmails}
                loading={state.loading}
                onEmailClick={handlers.handleEmailSelect}
                onToggleStar={handlers.handleToggleStar}
                onToggleRead={handlers.handleToggleRead}
                onDelete={handlers.handleDeleteEmail}
                selectedEmailId={state.selectedEmailId}
                onEmailSelect={handlers.handleEmailSelect}
                searchTerm={state.searchTerm}
                currentFolder={state.currentFolder}
                totalCount={state.filteredEmails.length}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>

            {/* Email Detail View */}
            {state.detailViewOpen && selectedEmail && (
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  position: { xs: "absolute", md: "relative" },
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: "background.paper",
                  zIndex: 1,
                  ...(isTablet && !isMobile ? { width: "90%" } : {}),
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
                  onToggleStar={handlers.handleToggleStar}
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
        onSend={handlers.handleSendEmail}
        selectedAccount={state.accounts.find(
          (acc: EmailAccount) => acc.id === state.selectedAccount
        )}
      />
    </Box>
  );
}
