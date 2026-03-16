import Sidebar from "./sidebar";
import { Outlet } from "react-router";

const Layout= ()=>{
    return(
       <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
        <Outlet /> {/* This is where your routed pages will render */}
      </main>
    </div>
    )
}

export default Layout