import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton
} from '@mui/material'
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useServices } from '../ServiceProvider'
import { Device } from '../api-client/types.gen'
import { getDeviceList } from '../api-client'
import { AddDevice } from './AddDevice'
import { DeviceDetails } from './DeviceDetails'

interface ViewDialog {
    open: boolean
    deviceId: string
}

export const DeviceList = () => {
    const navigate = useNavigate()
    const [addDeviceDialogOpen, setAddDeviceDialogOpen] =
        useState<boolean>(false)
    const [deviceDetailsDialogOpen, setDeviceDetailsDialogOpen] =
        useState<ViewDialog>({
            open: false,
            deviceId: ''
        })

    const { client, withAuthorizationHeader, useStateStream } = useServices()

    const [deviceList, setDeviceList] = useState<Device[]>()
    const active = useStateStream(() =>
        getDeviceList({
            client,
            ...withAuthorizationHeader()
        }).then((it) => setDeviceList(it.data?.items))
    )

    useEffect(() => {
        if (!addDeviceDialogOpen && !deviceDetailsDialogOpen.open) {
            getDeviceList({
                client,
                ...withAuthorizationHeader()
            }).then((it) => setDeviceList(it.data?.items))
        }
    }, [
        addDeviceDialogOpen,
        deviceDetailsDialogOpen.open,
        active,
        client,
        withAuthorizationHeader
    ])

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton
                        onClick={() => navigate('/home')}
                        sx={{
                            mr: 2,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        IoT Device Management
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Manage your IoT devices and monitor consumption
                </Typography>
            </Box>

            <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
                gap={3}
                sx={{ mb: 4 }}
            >
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{ color: 'primary.main', fontWeight: 700, mb: 1 }}
                    >
                        {deviceList?.length || 0}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                        Total Devices
                    </Typography>
                </Card>

                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{ color: 'success.main', fontWeight: 700, mb: 1 }}
                    >
                        {deviceList?.reduce(
                            (sum, device) => sum + device.numbers.length,
                            0
                        ) || 0}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                        Total Numbers
                    </Typography>
                </Card>

                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{ color: 'info.main', fontWeight: 700, mb: 1 }}
                    >
                        {deviceList?.length
                            ? Math.round(
                                  deviceList.reduce(
                                      (sum, device) =>
                                          sum + device.numbers.length,
                                      0
                                  ) / deviceList.length
                              )
                            : 0}
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                        Average Numbers
                    </Typography>
                </Card>
            </Box>

            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            p: 3,
                            pb: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Device Management
                        </Typography>
                        <Button
                            onClick={() => setAddDeviceDialogOpen(true)}
                            variant="contained"
                            sx={{
                                background:
                                    'linear-gradient(135deg, #6D4C93 0%, #E91E63 100%)',
                                '&:hover': {
                                    background:
                                        'linear-gradient(135deg, #5D3C83 0%, #D91153 100%)'
                                }
                            }}
                        >
                            Add Device
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Device Key</TableCell>
                                    <TableCell align="right">
                                        Customer Wallet
                                    </TableCell>
                                    <TableCell align="right">
                                        Numbers Count
                                    </TableCell>
                                    <TableCell align="right">
                                        Latest Numbers
                                    </TableCell>
                                    <TableCell align="center">
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {deviceList && deviceList.length > 0 ? (
                                    deviceList.map((device, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{
                                                '&:last-child td, &:last-child th':
                                                    { border: 0 },
                                                cursor: 'pointer'
                                            }}
                                            onClick={() =>
                                                setDeviceDetailsDialogOpen({
                                                    open: true,
                                                    deviceId: device['@id']
                                                })
                                            }
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    {device.key}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        fontFamily: 'monospace',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {device.customerWalletAddress.slice(
                                                        0,
                                                        8
                                                    )}
                                                    ...
                                                    {device.customerWalletAddress.slice(
                                                        -6
                                                    )}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: 'info.main'
                                                    }}
                                                >
                                                    {device.numbers.length}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography
                                                    variant="body2"
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    {device.numbers
                                                        .slice(-3)
                                                        .join(', ')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() =>
                                                        setDeviceDetailsDialogOpen(
                                                            {
                                                                open: true,
                                                                deviceId:
                                                                    device[
                                                                        '@id'
                                                                    ]
                                                            }
                                                        )
                                                    }
                                                    sx={{ mr: 1 }}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            align="center"
                                            sx={{ py: 8 }}
                                        >
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                            >
                                                No devices found. Add your first
                                                device to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            <AddDevice
                open={addDeviceDialogOpen}
                onClose={() => setAddDeviceDialogOpen(false)}
            />

            <DeviceDetails
                open={deviceDetailsDialogOpen.open}
                deviceId={deviceDetailsDialogOpen.deviceId}
                onClose={() =>
                    setDeviceDetailsDialogOpen({
                        open: false,
                        deviceId: ''
                    })
                }
            />
        </Container>
    )
}
