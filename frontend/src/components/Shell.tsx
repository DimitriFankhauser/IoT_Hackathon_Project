import {
    Box,
    CssBaseline,
    Menu,
    MenuItem,
    styled,
    ThemeProvider,
    Toolbar,
    Typography
} from '@mui/material'
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import theme from '../theme.ts'
import { useMe } from '../UserProvider'
import { useKeycloak } from '@react-keycloak/web'
import { useRuntimeConfiguration } from '../ConfigurationProvider.tsx'
import { useDirectOidc } from '../auth/DirectOidcProvider'

const drawerWidth = 0

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean
}>(() => ({
    flexGrow: 1,
    marginLeft: `${drawerWidth}px`,
    paddingLeft: '24px'
}))

interface AppBarProps extends MuiAppBarProps {
    open?: boolean
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open'
})<AppBarProps>(({ theme, open }) => ({
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
        })
    })
}))

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end'
}))

export default function Shell() {
    const { name, email, role } = useMe()
    const { loginMode } = useRuntimeConfiguration()
    const isKeycloak = loginMode === 'KEYCLOAK'
    const isDirectOidc = loginMode === 'CUSTOM_OIDC'
    const { keycloak } = isKeycloak ? useKeycloak() : { keycloak: null }
    const { logout: oidcLogout } = isDirectOidc
        ? useDirectOidc()
        : { logout: () => {} }

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const open = Boolean(anchorEl)

    const handlePortraitClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    }

    const logout = async () => {
        if (isKeycloak) {
            await keycloak!.logout()
        } else if (isDirectOidc) {
            oidcLogout()
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                elevation={0}
            >
                <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                    ></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            onClick={handlePortraitClick}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                bgcolor: theme.palette.primary.main,
                                borderRadius: '20px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: theme.palette.primary.dark
                                }
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ color: 'white', fontWeight: 500 }}
                            >
                                {name}
                            </Typography>
                        </Box>
                        <Menu
                            id="basic-menu"
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right'
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right'
                            }}
                            anchorEl={anchorEl}
                            open={open}
                            onClose={() => setAnchorEl(null)}
                            slotProps={{
                                paper: {
                                    sx: {
                                        borderRadius: '8px',
                                        boxShadow:
                                            '0 4px 20px rgba(0, 0, 0, 0.7)',
                                        border: `1px solid ${theme.palette.divider}`,
                                        minWidth: '250px'
                                    }
                                }
                            }}
                        >
                            <MenuItem
                                sx={{
                                    opacity: 1,
                                    cursor: 'default',
                                    backgroundColor: 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            >
                                <Box sx={{ py: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.primary'
                                        }}
                                    >
                                        {name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            display: 'block'
                                        }}
                                    >
                                        {email}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: 'text.secondary',
                                            display: 'block',
                                            mt: 0.5
                                        }}
                                    >
                                        Roles: {role.join(', ')}
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem
                                onClick={logout}
                                sx={{ fontSize: '0.875rem' }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Main open={false}>
                <DrawerHeader />
                <Outlet></Outlet>
            </Main>
        </ThemeProvider>
    )
}
