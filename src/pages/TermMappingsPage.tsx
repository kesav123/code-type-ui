import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  fetchTermMappings,
  updateTermMapping,
 
} from "../api";
import type { TermMapping } from "../api";

const STATUS_OPTIONS = [
  "Pending",
  "In Review",
  "Reviewed",
  "Rejected",
];

function TermMappingsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

const agencyName = searchParams.get("agencyName") ?? "";
const haCodeList = searchParams.get("haCodeList") ?? "";
const internalCodeList = searchParams.get("internalCodeList") ?? "";
const codeListIdParam = searchParams.get("codeListId");
const codeListId = codeListIdParam ? Number(codeListIdParam) : undefined;


  const [rows, setRows] = useState<TermMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<TermMapping | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editComments, setEditComments] = useState<string>("");
  const [editReviewer, setEditReviewer] = useState<string>("kesav");
  const [saving, setSaving] = useState(false);

  const headerTitle = useMemo(
    () => `${agencyName || "Agency"} – ${haCodeList || "Code list"}`,
    [agencyName, haCodeList]
  );

  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!agencyName) {
        throw new Error("agencyName is required in query parameters");
      }
      const data = await fetchTermMappings({
        agencyName,
        codeListId,
      });
      setRows(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error loading term mappings");
      }
    } finally {
      setLoading(false);
    }
  };
  load();
}, [agencyName, codeListId]);




  const handleOpenEdit = (row: TermMapping) => {
    setEditRow(row);
    setEditStatus(row.CurrentStatus ?? "");
    setEditComments(row.ReviewerComments ?? "");
    setEditReviewer(row.ReviewedBy ?? "kesav");
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditRow(null);
    setSaving(false);
  };

   const handleSaveEdit = async () => {
    if (!editRow) return;

    try {
      setSaving(true);
      await updateTermMapping(editRow.TermMappingID, {
        currentStatus: editStatus || undefined,
        reviewerComments: editComments || undefined,
        reviewedBy: editReviewer || undefined,
      });

      setRows((prev) =>
        prev.map((r) =>
          r.TermMappingID === editRow.TermMappingID
            ? {
                ...r,
                CurrentStatus: editStatus,
                ReviewerComments: editComments,
                ReviewedBy: editReviewer,
              }
            : r
        )
      );

      handleCloseEdit();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Error saving changes");
      }
      setSaving(false);
    }
  };


  const handleBack = () => {
    navigate("/");
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mb={2}
      >
        <IconButton onClick={handleBack} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">{headerTitle}</Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Internal code list: <strong>{internalCodeList || "-"}</strong> | Mapping
        ID: <strong>{id}</strong>
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {!loading && !error && (
        <Paper elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>HA Term</TableCell>
                <TableCell>Reg App Term</TableCell>
                <TableCell>Code System</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reviewer Comments</TableCell>
                <TableCell align="right">Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.TermMappingID} hover>
                  <TableCell>{row.HA_Term}</TableCell>
                  <TableCell>{row.Reg_App_Term}</TableCell>
                  <TableCell>{row.CodeSystemName}</TableCell>
                  <TableCell>
                    {row.CurrentStatus ? (
                      <Chip
                        label={row.CurrentStatus}
                        size="small"
                        color={
                          row.CurrentStatus.toLowerCase() === "reviewed"
                            ? "success"
                            : row.CurrentStatus.toLowerCase() === "pending"
                            ? "warning"
                            : "default"
                        }
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="Not set"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.ReviewerComments || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(row)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      No term mappings found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Mapping</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {editRow?.HA_Term} → {editRow?.Reg_App_Term}
          </Typography>
          <Stack spacing={2}>
            <TextField
              select
              label="Current Status"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              fullWidth
              size="small"
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Reviewer Comments"
              value={editComments}
              onChange={(e) => setEditComments(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              size="small"
            />

            <TextField
              label="Reviewed By"
              value={editReviewer}
              onChange={(e) => setEditReviewer(e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TermMappingsPage;
