import { Routes, Route } from "react-router-dom";
import "./styles/app.sass";
import Page from "./components/Page";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./screens/Home";
import ProductsDashboard from "./screens/ProductsDashboard";
import NewProduct from "./screens/NewProduct";
import Drafts from "./screens/Drafts";
import Released from "./screens/Released";
import Comments from "./screens/Comments";
import Scheduled from "./screens/Scheduled";
import Customers from "./screens/Customers";
import CustomerList from "./screens/CustomerList";
import Promote from "./screens/Promote";
import Notification from "./screens/Notification";
import Settings from "./screens/Settings";
import UpgradeToPro from "./screens/UpgradeToPro";
import MessageCenter from "./screens/MessageCenter";
import ExploreCreators from "./screens/ExploreCreators";
import AffiliateCenter from "./screens/AffiliateCenter";
import SignUp from "./screens/SignUp";
import SignIn from "./screens/SignIn";
import Earning from "./screens/Earning";
import Refunds from "./screens/Refunds";
import Payouts from "./screens/Payouts";
import Statements from "./screens/Statements";
import Shop from "./screens/Shop";
import PageList from "./screens/PageList";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/">
                    <Route
                        index
                        element={
                            <PrivateRoute>
                                <Page title="Dashboard">
                                    <Home />
                                </Page>
                            </PrivateRoute>
                        }
                    />
                <Route
                    path="products/dashboard"
                    element={
                        <PrivateRoute>
                            <Page title="Products dashboard">
                                <ProductsDashboard />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="products/add"
                    element={
                        <PrivateRoute>
                            <Page title="New product">
                                <NewProduct />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="products/drafts"
                    element={
                        <PrivateRoute>
                            <Page title="Drafts">
                                <Drafts />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="products/released"
                    element={
                        <PrivateRoute>
                            <Page title="Released">
                                <Released />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="products/comments"
                    element={
                        <PrivateRoute>
                            <Page title="Comments">
                                <Comments />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="products/scheduled"
                    element={
                        <PrivateRoute>
                            <Page title="Scheduled">
                                <Scheduled />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="customers/overview"
                    element={
                        <PrivateRoute>
                            <Page title="Customers">
                                <Customers />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="customers/customer-list"
                    element={
                        <PrivateRoute>
                            <Page title="Customer list">
                                <CustomerList />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="shop"
                    element={
                        <PrivateRoute>
                            <Page wide>
                                <Shop />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="income/earning"
                    element={
                        <PrivateRoute>
                            <Page title="Earning">
                                <Earning />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="income/refunds"
                    element={
                        <PrivateRoute>
                            <Page title="Refunds">
                                <Refunds />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="income/payouts"
                    element={
                        <PrivateRoute>
                            <Page title="Payouts">
                                <Payouts />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="income/statements"
                    element={
                        <PrivateRoute>
                            <Page title="Statements">
                                <Statements />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="promote"
                    element={
                        <PrivateRoute>
                            <Page title="Promote">
                                <Promote />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="notification"
                    element={
                        <PrivateRoute>
                            <Page title="Notification">
                                <Notification />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="settings"
                    element={
                        <PrivateRoute>
                            <Page title="Settings">
                                <Settings />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="upgrade-to-pro"
                    element={
                        <PrivateRoute>
                            <Page title="Upgrade to Pro">
                                <UpgradeToPro />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="message-center"
                    element={
                        <PrivateRoute>
                            <Page title="Message center">
                                <MessageCenter />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="explore-creators"
                    element={
                        <PrivateRoute>
                            <Page title="Explore creators">
                                <ExploreCreators />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="affiliate-center"
                    element={
                        <PrivateRoute>
                            <Page title="Affiliate center">
                                <AffiliateCenter />
                            </Page>
                        </PrivateRoute>
                    }
                />
                <Route path="sign-up" element={<SignUp />} />
                <Route path="sign-in" element={<SignIn />} />
                <Route path="pagelist" element={<PageList />} />
            </Route>
        </Routes>
        </AuthProvider>
    );
}

export default App;
