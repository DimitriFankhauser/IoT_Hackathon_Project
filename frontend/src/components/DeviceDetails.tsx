import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    IconButton,
    TextField
} from '@mui/material'
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import { useServices } from '../ServiceProvider'
import { Device } from '../api-client/types.gen'
import { getDeviceById, deviceSubmitEvent } from '../api-client'

interface DeviceDetailsProps {
    open: boolean
    deviceId: string
    onClose: () => void
}

export const DeviceDetails = ({
    open,
    deviceId,
    onClose
}: DeviceDetailsProps) => {
    const [device, setDevice] = useState<Device | null>(null)
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [newNumber, setNewNumber] = useState('')

    const { client, withAuthorizationHeader } = useServices()

    useEffect(() => {
        if (open && deviceId) {
            fetchDeviceDetails()
        }
    }, [open, deviceId])

    const fetchDeviceDetails = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await getDeviceById({
                client,
                path: { id: deviceId },
                ...withAuthorizationHeader()
            })
            setDevice(response.data || null)
        } catch (error: any) {
            setError(error.message || 'Failed to fetch device details')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitEvent = async () => {
        if (!device || !device['@actions']?.submitEvent || !newNumber) return

        setActionLoading(true)
        try {
            await deviceSubmitEvent({
                client,
                path: { id: deviceId },
                body: {
                    number: parseInt(newNumber)
                },
                ...withAuthorizationHeader()
            })
            setNewNumber('')
            await fetchDeviceDetails()
        } catch (error: any) {
            setError(error.message || 'Failed to submit event')
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                Device Details
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 4
                        }}
                    >
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : device ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}
                    >
                        <Box
                            display="grid"
                            gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                            gap={2}
                        >
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        Device Information
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Device Key
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {device.key}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Smart Contract
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {device.smartContract}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Customer Wallet
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                component="a"
                                                href={`https://subnets.avax.network/c-chain/address/${device.customerWalletAddress}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontFamily: 'monospace',
                                                    fontSize: '0.875rem',
                                                    textDecoration: 'none',
                                                    color: 'primary.main',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                {device.customerWalletAddress}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        Numbers Data
                                    </Typography>
                                    {device.numbers &&
                                    device.numbers.length > 0 ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1
                                            }}
                                        >
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Total Count
                                                </Typography>
                                                <Typography
                                                    variant="h4"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'info.main'
                                                    }}
                                                >
                                                    {device.numbers.length}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Latest Numbers
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    {device.numbers
                                                        .slice(-5)
                                                        .join(', ')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            No numbers data available
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>

                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2 }}
                                >
                                    Numbers History
                                </Typography>
                                {device.numbers && device.numbers.length > 0 ? (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="center">
                                                        Index
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        Number
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {device.numbers.map(
                                                    (number, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell
                                                                align="center"
                                                                sx={{
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                {number}
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        No numbers available
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Device not found
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                {device && device['@actions']?.submitEvent && (
                    <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
                        <TextField
                            label="Number"
                            type="number"
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                            size="small"
                            disabled={actionLoading}
                            sx={{ width: 120 }}
                        />
                        <Button
                            onClick={handleSubmitEvent}
                            variant="outlined"
                            color="primary"
                            disabled={actionLoading || !newNumber}
                            startIcon={
                                actionLoading ? (
                                    <CircularProgress size={16} />
                                ) : (
                                    <AddIcon />
                                )
                            }
                        >
                            Add Number
                        </Button>
                    </Box>
                )}
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}
