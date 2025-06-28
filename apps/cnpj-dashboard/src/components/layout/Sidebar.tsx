import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Drawer as MuiDrawer,
  List,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

interface SidebarProps {
  open: boolean;
  toggleDrawer: () => void;
}

const Sidebar = ({ open, toggleDrawer }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path.startsWith('/empresas')) return 1;
    if (path.startsWith('/estabelecimentos')) return 2;
    if (path.startsWith('/socios')) return 3;
    if (path.startsWith('/simples')) return 4;
    if (path.startsWith('/search')) return 5;
    if (path.startsWith('/about')) return 6;
    return 0;
  });

  const handleListItemClick = (index: number, path: string) => {
    setSelectedIndex(index);
    navigate(path);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Empresas', icon: <BusinessIcon />, path: '/empresas' },
    { text: 'Estabelecimentos', icon: <StoreIcon />, path: '/estabelecimentos' },
    { text: 'Sócios', icon: <PeopleIcon />, path: '/socios' },
    { text: 'Simples Nacional', icon: <ReceiptIcon />, path: '/simples' },
    { text: 'Busca CNPJ', icon: <SearchIcon />, path: '/search' },
    { text: 'Sobre', icon: <InfoIcon />, path: '/about' },
  ];

  return (
    <Drawer variant="permanent" open={open}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List component="nav">
        {menuItems.map((item, index) => (
          <Tooltip
            key={item.text}
            title={open ? '' : item.text}
            placement="right"
            arrow
          >
            <ListItemButton
              selected={selectedIndex === index}
              onClick={() => handleListItemClick(index, item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
