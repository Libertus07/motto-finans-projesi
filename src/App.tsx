import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';

import QrMenu from './pages/QrMenu/QrMenu';
import KitchenDisplay from './pages/KitchenDisplay';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Debts = lazy(() => import('./pages/Debts'));
const Products = lazy(() => import('./pages/Products'));
const Recipe = lazy(() => import('./pages/Recipe'));
const Investments = lazy(() => import('./pages/Investments'));
const Stats = lazy(() => import('./pages/Stats'));
const Assistant = lazy(() => import('./pages/Assistant'));
const Settings = lazy(() => import('./pages/Settings'));
const CashierPOS = lazy(() => import('./pages/CashierPOS'));
const Tables = lazy(() => import('./pages/Tables'));
const CashierSettings = lazy(() => import('./pages/CashierSettings'));
const ZReport = lazy(() => import('./pages/ZReport'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Staff = lazy(() => import('./pages/Staff'));
const CustomerDirectory = lazy(() => import('./pages/CustomerDirectory'));

const ReloadPrompt = lazy(() => import('./components/ReloadPrompt'));

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={null}>
                <ReloadPrompt />
            </Suspense>
            <Routes>
                {/* Public / Standalone Routes */}

                <Route path="/qr-menu" element={<QrMenu />} />
                <Route path="/kitchen" element={<KitchenDisplay />} />

                {/* Dashboard Layout Routes */}
                <Route path="/pos" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pos" element={<CashierPOS />} />
                    <Route path="tables" element={<Tables />} />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="debts" element={<Debts />} />
                    <Route path="customerDirectory" element={<CustomerDirectory />} />
                    <Route path="products" element={<Products />} />
                    <Route path="inventory" element={<Inventory />} />
                    <Route path="recipe" element={<Recipe />} />
                    <Route path="investments" element={<Investments />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="assistant" element={<Assistant />} />
                    <Route path="staff" element={<Staff />} />
                    <Route path="zreport" element={<ZReport />} />
                    <Route path="settings" element={<Settings />} />
                </Route>

                {/* Catch-all Redirect */}
                <Route path="/" element={<Navigate to="/pos" replace />} />
                <Route path="*" element={<Navigate to="/pos" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
