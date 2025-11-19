import { Outlet, Link, useLocation } from "react-router-dom";
import {

  Typography,
  Container,
  Breadcrumbs,
} from "@mui/material";

function App() {
  const location = useLocation();
  const isDetailPage = location.pathname.startsWith("/mapping/");

  return (
    <>
    

      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            Code Types
          </Link>
          {isDetailPage && <Typography>Term Mapping</Typography>}
        </Breadcrumbs>

        {/* This renders the active page */}
        <Outlet />
      </Container>
    </>
  );
}

export default App;
