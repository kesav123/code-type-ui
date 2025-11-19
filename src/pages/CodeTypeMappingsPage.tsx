import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import type{  CodeTypeMapping } from "../api";
import { fetchCodeTypeMappings} from "../api";

function CodeTypeMappingsPage() {
  const [rows, setRows] = useState<CodeTypeMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCodeTypeMappings();
        setRows(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error loading code type mappings");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleViewDetails = (row: CodeTypeMapping) => {
  const params = new URLSearchParams({
    agencyName: row.AgencyName,
    haCodeList: row.HA_Code_List,
    internalCodeList: row.Reg_App_Code_List,
    codeListId: row.HA_CodeListID.toString(),
  }).toString();

  navigate(`/mapping/${row.CodeTypeMappingID}?${params}`);
};


  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Code Type Mappings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select an Agency / Code List to view and update detailed term
        mappings.
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
        <TableContainer component={Paper} elevation={2}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Agency</TableCell>
                <TableCell>HA Code List</TableCell>
                <TableCell>Internal Code List</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.CodeTypeMappingID} hover>
                  <TableCell>
                    <Typography variant="body2">{row.AgencyName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.AgencyAbbreviation}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.HA_Code_List}</TableCell>
                  <TableCell>{row.Reg_App_Code_List}</TableCell>
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
                      <Chip label="Not set" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(row)}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      align="center"
                    >
                      No mappings found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default CodeTypeMappingsPage;
