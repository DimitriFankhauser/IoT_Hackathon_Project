import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    Grid
} from '@mui/material'
import {
    DevicesOther as DevicesIcon,
    AccountBalance as ContractIcon,
    Launch as LaunchIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useServices } from '../ServiceProvider'
import { getSmartContractList } from '../api-client'

export const HomePage = () => {
    const navigate = useNavigate()
    const { client, withAuthorizationHeader } = useServices()

    const handleViewSmartContract = async () => {
        try {
            const response = await getSmartContractList({
                client,
                ...withAuthorizationHeader()
            })

            if (response.data?.items && response.data.items.length > 0) {
                const firstContract = response.data.items[0]
                const contractAddress = firstContract.tokenContractAddress

                if (contractAddress) {
                    window.open(
                        `https://testnet.snowtrace.io/address/${contractAddress}`,
                        '_blank'
                    )
                }
            }
        } catch (error) {
            console.error('Failed to fetch smart contract list:', error)
        }
    }

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                    IoT Steering Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your IoT devices and smart contracts
                </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 4 }} justifyContent="center">
                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                        onClick={() => navigate('/devices')}
                    >
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <DevicesIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'primary.main',
                                    mb: 2
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, mb: 2 }}
                            >
                                Device Management
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 3 }}
                            >
                                Monitor and manage your IoT devices, submit
                                numbers, and control device operations.
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    background:
                                        'linear-gradient(135deg, #6D4C93 0%, #E91E63 100%)',
                                    '&:hover': {
                                        background:
                                            'linear-gradient(135deg, #5D3C83 0%, #D91153 100%)'
                                    }
                                }}
                            >
                                Manage Devices
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card
                        sx={{
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                            }
                        }}
                    >
                        <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <ContractIcon
                                sx={{
                                    fontSize: 80,
                                    color: 'info.main',
                                    mb: 2
                                }}
                            />
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, mb: 2 }}
                            >
                                Smart Contract
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ mb: 3 }}
                            >
                                View the deployed smart contract on the
                                blockchain explorer to monitor transactions and
                                contract state.
                            </Typography>
                            <Button
                                variant="contained"
                                color="info"
                                size="large"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewSmartContract()
                                }}
                                startIcon={<LaunchIcon />}
                            >
                                View on Blockchain
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}
