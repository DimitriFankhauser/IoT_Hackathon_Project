import { createBrowserRouter, Navigate } from 'react-router-dom'
import Shell from './components/Shell.tsx'
import { HomePage } from './components/HomePage.tsx'
import { DeviceList } from './components/DeviceList.tsx'

export const router = () => {
    return createBrowserRouter([
        {
            element: <Shell></Shell>,
            children: [
                {
                    path: '/',
                    element: <Navigate to="/home" replace />
                },
                {
                    path: '/home',
                    element: <HomePage />
                },
                {
                    path: '/devices',
                    element: <DeviceList />
                },
                {
                    path: '*',
                    element: <Navigate to="/home" replace />
                }
            ]
        }
    ])
}
