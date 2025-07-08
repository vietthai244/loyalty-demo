import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  CardGiftcard as ProgramIcon,
} from "@mui/icons-material";
import "./App.css";
import ProgramDashboard from "./pages/program/page";
import ProgramCanvas from "./pages/program/ProgramCanvas";

const drawerWidth = 240;

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false); // Close mobile drawer after navigation
  };

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Program", icon: <ProgramIcon />, path: "/program" },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List sx={{ color: 'white' }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={location.pathname === item.path}
              sx={{
                color: 'white',
                "&.Mui-selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh" }}>
      <CssBaseline />

      {/* Left Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow: "none",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "transparent",
              border: "none",
              boxShadow: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          flexGrow: 1,
          backgroundColor: "transparent",
        }}
      >
        {/* Top AppBar */}
        <Toolbar sx={{ color: 'white' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" }, color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
            SSI Loyalty
          </Typography>
        </Toolbar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "white",
            borderRadius: 4,
            border: "1px solid #e0e0e0",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
            m: 1
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/program" element={<ProgramDashboard />} />
            <Route path="/program/create" element={<ProgramCanvas />} />
            <Route path="/program/edit/:id" element={<ProgramCanvas />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

function Home() {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <Typography variant="body1">
        Welcome to the SSI Loyalty application!
      </Typography>
    </div>
  );
}

export default App;
