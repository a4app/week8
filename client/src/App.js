import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/pages/Signup";
import Home from "./components/pages/Home";
import Vehicles from "./components/pages/admin/Vehicles";
import AddVehicle from "./components/pages/admin/AddVehicle";
import AdminBooking from "./components/pages/admin/AdminBooking";
import EditVehicle from "./components/pages/admin/EditVehicle";
import User from "./components/pages/user/User";
import Login from "./components/pages/Login";
import Signin from "./components/pages/Signin";
import AdminProfile from "./components/pages/admin/Profile";
import UserBooking from "./components/pages/user/UserBooking";
import Customers from "./components/pages/admin/Customers";
import Payments from "./components/pages/admin/Payments";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/signin" element={<Signin />} />

				<Route path="/admin/vehicles" element={<Vehicles />} />
				<Route path="/admin/profile" element={<AdminProfile />} />
				<Route path="/admin/add-vehicle" element={<AddVehicle />} />
				<Route path="/admin/edit-vehicle" element={<EditVehicle />} />
				<Route path="/admin/booking" element={<AdminBooking />} />
				<Route path="/admin/customers" element={<Customers />} />
				<Route path="/admin/payments" element={<Payments />} />

				<Route path="/user/:id" element={<User />} />
				<Route path="/user/booking" element={<UserBooking />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
