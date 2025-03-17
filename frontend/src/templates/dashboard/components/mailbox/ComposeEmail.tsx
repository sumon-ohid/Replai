import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Chip,
  InputAdornment,
  useTheme,
  alpha,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import { EmailData, EmailAccount } from "./useEmailClient";

interface ComposeEmailProps {
  open: boolean;
  onClose: () => void;
  replyTo: EmailData | null;
  forwardEmail: EmailData | null;
  onSend: (email: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    content: string;
    attachments: File[];
  }) => Promise<void>;
  selectedAccount: EmailAccount | undefined;
}

export default function ComposeEmail({
  open,
  onClose,
  replyTo,
  forwardEmail,
  onSend,
  selectedAccount,
}: ComposeEmailProps) {
  const theme = useTheme();
  const [minimized, setMinimized] = React.useState(false);
  const [maximized, setMaximized] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form state
  const [to, setTo] = React.useState<string>("");
  const [cc, setCc] = React.useState<string>("");
  const [bcc, setBcc] = React.useState<string>("");
  const [subject, setSubject] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [showCc, setShowCc] = React.useState(false);
  const [showBcc, setShowBcc] = React.useState(false);

  // Handle reply or forward
  React.useEffect(() => {
    if (replyTo) {
      setTo(replyTo.from.email);
      setSubject(`Re: ${replyTo.subject}`);
      setContent(
        `\n\n-------- Original Message --------\nFrom: ${replyTo.from.name} <${
          replyTo.from.email
        }>\nDate: ${new Date(replyTo.timestamp).toLocaleString()}\nSubject: ${
          replyTo.subject
        }\n\n${replyTo.content}`
      );
      setShowCc(!!replyTo.cc?.length);
      if (replyTo.cc?.length) {
        setCc(replyTo.cc.map((c) => c.email).join(", "));
      }
    } else if (forwardEmail) {
      setSubject(`Fwd: ${forwardEmail.subject}`);
      setContent(
        `\n\n-------- Forwarded Message --------\nFrom: ${
          forwardEmail.from.name
        } <${forwardEmail.from.email}>\nDate: ${new Date(
          forwardEmail.timestamp
        ).toLocaleString()}\nSubject: ${
          forwardEmail.subject
        }\nTo: ${forwardEmail.to.map((t) => t.email).join(", ")}\n\n${
          forwardEmail.content
        }`
      );
      if (forwardEmail.attachments?.length) {
        // In a real app, you'd handle transferring the attachments
      }
    }
  }, [replyTo, forwardEmail]);

  const handleSend = async () => {
    if (!to.trim()) {
      // Show validation error
      return;
    }

    setSending(true);
    try {
      await onSend({
        to: to.split(",").map((email) => email.trim()),
        cc: cc ? cc.split(",").map((email) => email.trim()) : [],
        bcc: bcc ? bcc.split(",").map((email) => email.trim()) : [],
        subject,
        content,
        attachments,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to send email:", error);
      // Show error message
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setTo("");
    setCc("");
    setBcc("");
    setSubject("");
    setContent("");
    setAttachments([]);
    setShowCc(false);
    setShowBcc(false);
    setMinimized(false);
    setMaximized(false);
    onClose();
  };

  const handleAttachFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(event.target.files!)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Dialog
        open={open && !minimized}
        onClose={handleClose}
        maxWidth={maximized ? false : "md"}
        fullWidth
        fullScreen={maximized}
        PaperProps={{
          sx: {
            borderRadius: maximized ? 0 : 2,
            overflow: "hidden",
            maxHeight: maximized ? "100%" : "80vh",
            minHeight: "60vh",
            m: maximized ? 0 : 2,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.default",
            backdropFilter: "blur(100px)",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: theme.palette.background.default,
            color: theme.palette.text.primary,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem", color: "text.primary" }}>
            {replyTo ? "Reply" : forwardEmail ? "Forward" : "New Message"}
            {selectedAccount && ` (${selectedAccount.email})`}
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Minimize">
              <IconButton
                size="small"
                onClick={() => setMinimized(true)}
                sx={{ color: "text.primary", opacity: 0.8 }}
              >
                <MinimizeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={maximized ? "Small screen" : "Full screen"}>
              <IconButton
                size="small"
                onClick={() => setMaximized(!maximized)}
                sx={{ color: "text.primary", opacity: 0.8 }}
              >
                <OpenInFullIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{ color: "text.primary", opacity: 0.8 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <DialogContent
          dividers
          sx={{ p: 0, display: "flex", flexDirection: "column", flexGrow: 1 }}
        >
          {/* Recipients and subject */}
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
            <TextField
              autoFocus
              margin="dense"
              placeholder="To"
              fullWidth
              variant="outlined"
              size="small"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{
                endAdornment: !showCc && (
                  <InputAdornment position="end">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowCc(true)}
                      sx={{ textTransform: "none", ml: 1, height: "30px", width: "auto" }}
                    >
                      Cc
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setShowBcc(true)}
                      sx={{ textTransform: "none", ml: 1, height: "30px", width: "auto" }}
                    >
                      Bcc
                    </Button>
                  </InputAdornment>
                ),
              }}
            />

            {showCc && (
              <TextField
                margin="dense"
                placeholder="Cc"
                fullWidth
                variant="outlined"
                size="small"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                sx={{ mb: 1 }}
              />
            )}

            {showBcc && (
              <TextField
                margin="dense"
                placeholder="Bcc"
                fullWidth
                variant="outlined"
                size="small"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                sx={{ mb: 1 }}
              />
            )}

            <TextField
              margin="dense"
              placeholder="Subject"
              fullWidth
              variant="outlined"
              size="small"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </Box>

          {/* Formatting toolbar */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              p: 0.7,
              pl: 2,
              alignContent: "center",
              borderColor: "divider",
              bgcolor: theme.palette.background.default,
              flexWrap: "wrap",
              justifyContent: "flex-start",
            }}
          >
            <Tooltip title="Bold">
              <IconButton size="small" sx={{height: "30px", width: "30px"}}>
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italic">
              <IconButton size="small" sx={{height: "30px", width: "30px"}}>
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Underline">
              <IconButton size="small" sx={{height: "30px", width: "30px"}}>
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Bullet list">
              <IconButton size="small" sx={{height: "30px", width: "30px"}}>
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Numbered list">
              <IconButton size="small" sx={{height: "30px", width: "30px"}}>
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Message content */}
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your message here..."
            sx={{
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                height: "100%",
                minHeight: "200px",
                alignItems: "flex-start",
                p: 2,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
            }}
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Attachments ({attachments.length})
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {attachments.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024).toFixed(0)} KB)`}
                    onDelete={() => handleRemoveAttachment(index)}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          <input
            type="file"
            ref={fileInputRef}
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </DialogContent>

        <DialogActions sx={{ p: 1.5, justifyContent: "space-between", bgcolor: "background.default" }}>
          <Button
            startIcon={<AttachFileIcon />}
            variant="outlined"
            onClick={handleAttachFiles}
            disabled={sending}
          >
            Attach
          </Button>
          <Box>
            <Button onClick={handleClose} sx={{ mr: 1 }} disabled={sending}>
              Discard
            </Button>
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!to.trim() || sending}
              startIcon={
                sending ? <CircularProgress size={16} /> : <SendIcon />
              }
            >
              Send
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Minimized compose box */}
      {open && minimized && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            width: 300,
            zIndex: 1300,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
            }}
            onClick={() => setMinimized(false)}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 500, ml: 1 }}>
              {subject || "New Message"}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              sx={{ color: "inherit", opacity: 0.8 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
