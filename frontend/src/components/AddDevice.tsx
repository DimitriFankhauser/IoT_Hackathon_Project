import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material'
import { useState } from 'react'
import { useServices } from '../ServiceProvider'
import { createDevice } from '../api-client'
import { DeviceCreate, Party } from '../api-client/types.gen'

interface AddDeviceProps {
    open: boolean
    onClose: () => void
}

export const AddDevice = ({ open, onClose }: AddDeviceProps) => {
    const [deviceKey, setDeviceKey] = useState('')
    const [smartContract, setSmartContract] = useState('')
    const [customerWalletAddress, setCustomerWalletAddress] = useState('')
    const [deviceManagerEmail, setDeviceManagerEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { client, withAuthorizationHeader } = useServices()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const deviceManager: Party = {
                entity: {
                    role: ['deviceManager'],
                    email: [deviceManagerEmail]
                },
                access: {}
            }

            const iotDevice: Party = {
                entity: { role: ['IoTDevice'] },
                access: {}
            }

            const blockchain_worker: Party = {
                entity: { role: ['worker'] },
                access: {}
            }

            const deviceData: DeviceCreate = {
                key: deviceKey,
                smartContract: smartContract,
                customerWalletAddress: customerWalletAddress,
                '@parties': {
                    deviceManager,
                    iotDevice,
                    blockchain_worker
                }
            }

            await createDevice({
                client,
                body: deviceData,
                ...withAuthorizationHeader()
            })

            setDeviceKey('')
            setSmartContract('')
            setCustomerWalletAddress('')
            setDeviceManagerEmail('')
            onClose()
        } catch (error: any) {
            setError(error.message || 'Failed to create device')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setDeviceKey('')
            setSmartContract('')
            setCustomerWalletAddress('')
            setDeviceManagerEmail('')
            setError(null)
            onClose()
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            mt: 1
                        }}
                    >
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Typography variant="body2" color="text.secondary">
                            Configure your new IoT device with smart contract
                            and wallet settings.
                        </Typography>

                        <TextField
                            label="Device Key"
                            value={deviceKey}
                            onChange={(e) => setDeviceKey(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            helperText="Unique identifier for the device"
                            disabled={loading}
                        />

                        <TextField
                            label="Smart Contract Reference"
                            value={smartContract}
                            onChange={(e) => setSmartContract(e.target.value)}
                            required
                            fullWidth
                            variant="outlined"
                            helperText="Reference to the smart contract"
                            disabled={loading}
                        />

                        <TextField
                            label="Customer Wallet Address"
                            value={customerWalletAddress}
                            onChange={(e) =>
                                setCustomerWalletAddress(e.target.value)
                            }
                            required
                            fullWidth
                            variant="outlined"
                            helperText="Blockchain wallet address for the customer"
                            disabled={loading}
                        />

                        <TextField
                            label="Device Manager Email"
                            type="email"
                            value={deviceManagerEmail}
                            onChange={(e) =>
                                setDeviceManagerEmail(e.target.value)
                            }
                            required
                            fullWidth
                            variant="outlined"
                            helperText="Email address of the device manager"
                            disabled={loading}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            loading ||
                            !deviceKey ||
                            !smartContract ||
                            !customerWalletAddress ||
                            !deviceManagerEmail
                        }
                        sx={{
                            background:
                                'linear-gradient(135deg, #6D4C93 0%, #E91E63 100%)',
                            '&:hover': {
                                background:
                                    'linear-gradient(135deg, #5D3C83 0%, #D91153 100%)'
                            }
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Add Device'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
