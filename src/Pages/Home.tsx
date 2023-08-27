import React from "react";
import MenuAppBar from "../Components/MenuAppBar";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Box from "@mui/material/Box";
import {Grid, Paper, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import {useAuth} from "../Components/AppContext";
import {Menus} from "../assets/Menus";
import HomeIcon from '@mui/icons-material/Home';
import {TextValue} from "../assets/TextValue";

export default function Home() {
    const {user} = useAuth();
    const theme = createTheme();
    const menus = Menus.GetMenus(user?.authorizations);
    return (
        <ThemeProvider theme={theme}>
            <MenuAppBar title={TextValue.Home} icon={<HomeIcon/>}></MenuAppBar>
            <Box sx={{paddingTop: theme.spacing(8), paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1)}}>
                <Typography variant="h2" style={{textAlign: 'center'}}>
                    {user?.branch}
                </Typography>
                <Grid container spacing={3}>
                    {menus.map(menu =>
                        (

                            <Grid item xs={6} style={{height: '100%'}}>
                                <Link to={menu.Link} style={{textDecoration: 'none', display: 'block', height: '100%'}}>
                                    <Paper elevation={4} style={{
                                        height: '100%',
                                        padding: theme.spacing(2),
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        color: theme.palette.text.secondary
                                    }}>
                                        <Box component="div" style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                            maxHeight: '6em', // This assumes a line-height of about 1.5, adjust as necessary
                                        }}>
                                            <menu.Icon style={{marginBottom: theme.spacing(1)}}/>
                                            {menu.Text}
                                        </Box>
                                    </Paper>
                                </Link>
                            </Grid>
                        ))}
                </Grid>
            </Box>
        </ThemeProvider>
    )
}
