import { AppBar, Toolbar, Typography, IconButton, Badge, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

interface HeaderProps {
  open: boolean;
  toggleDrawer: () => void;
}

const Header = ({ open, toggleDrawer }: HeaderProps) => {
  return (
    <StyledAppBar position="absolute" open={open}>
      <Toolbar
        sx={{
          pr: '24px',
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={toggleDrawer}
          sx={{
            marginRight: '36px',
            ...(open && { display: 'none' }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          component={Link}
          to="/"
          variant="h6"
          color="inherit"
          noWrap
          sx={{ flexGrow: 1 }}
        >
          CNPJ Dashboard
        </Typography>
        <IconButton color="inherit" component={Link} to="/search">
          <SearchIcon />
        </IconButton>
        <IconButton color="inherit">
          <Badge badgeContent={4} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton color="inherit" sx={{ ml: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>U</Avatar>
        </IconButton>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
