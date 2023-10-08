import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Menu from '@mui/material/Menu';
import {useAuth} from "./AppContext";
import {useLocation, useNavigate} from "react-router-dom";
import {TextValue} from "../assets/TextValue";
import {Menus} from "../assets/Menus";
import HomeIcon from '@mui/icons-material/Home';

interface MenuAppBarProps {
    title: string,
    icon?: React.ReactElement,
}

const MenuAppBar: React.FC<MenuAppBarProps> = ({title, icon}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {logout, user} = useAuth();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menus = Menus.GetMenus(user?.authorizations);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);

    const handleLogout = function () {
        logout();
    };

    const handleClose = function () {
        setAnchorEl(null);
    };

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={handleMenu}
                        sx={{mr: 2}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        <Box style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
                            {icon}
                            {title}
                        </Box>
                    </Typography>
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            color="inherit"
                            onClick={handleLogout}
                        >
                            <ExitToAppIcon/>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => navigate("/")}
                                      disabled={location.pathname === '/'}>
                                <HomeIcon/> {TextValue.Home}
                            </MenuItem>
                            {menus.map(menu => (
                                <MenuItem key={menu.Text} onClick={() => navigate(menu.Link)}
                                          disabled={location.pathname === menu.Link}>
                                    <menu.Icon/>
                                    {menu.Text}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default MenuAppBar;