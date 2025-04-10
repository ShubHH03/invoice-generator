import React, { useState,useMemo, useEffect } from "react";
import {  LayoutDashboard, FilePlus2, ShoppingBag, UserPlus, LayoutList, Import } from "lucide-react";
import ReportGenerator from "../components/MainDashboardComponents/Invoice";
import { cn } from "../lib/utils";
import { ScrollArea } from "../components/ui/scroll-area";
import Sidebar from "../components/Sidebar";
import MainDashboard from "../components/MainDashboardComponents/MainDashboard";
import Eligibility from "../components/MainDashboardComponents/Items";
import { Toaster } from "../components/ui/toaster";
import Customers from "../components/MainDashboardComponents/Customers";
import { BreadcrumbDynamic } from "../components/BreadCrumb";
import { useBreadcrumb } from '../contexts/BreadcrumbContext';
import { useParams } from "react-router-dom";
import Company from "../components/MainDashboardComponents/Company";
import TallyDirectImport from "../components/ImportToTally/TallyDirectImport";

const Dashboard = () => {
  
  const { breadcrumbs, setMainDashboard } = useBreadcrumb();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const {defaultTab} = useParams();


  
  // const navItems = [
  //   // { name: 'Dashboard', icon: LayoutDashboard, id: 'Dashboard' },
  //   // { name: 'Generate Report', icon: Files, id: 'report' }
  //   {text: 'Dashboard', icon: LayoutDashboard},
  //   {text: 'Generate Report', icon: Files}
  // ];

  

  const navItems = [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
    },  
    {
      title: "Invoice",
      url: "#",
      icon: FilePlus2 ,
    },  
    {
      title: "Company",
      url: "#",
      icon: LayoutList,
    },
    {
      title: "Customers",
      url: "#",
      icon: UserPlus,
    },
    {
      title: "Items",
      url: "#",
      icon: ShoppingBag,
    },
    // {
    //   title: "Import to Tally",
    //   url: "#",
    //   icon: Import,
    // },
  ];
  useEffect(() => {
      if (!defaultTab || defaultTab==="defaultTab") setActiveTab(navItems[0].title);
      else setActiveTab(defaultTab);
  }, []);

  useEffect(() => {
    setMainDashboard(activeTab,`/${activeTab}`);
  }, [activeTab]);

  // const breadcrumbItems = [
  //   {
  //     label: "Home",
  //     href: "/"
  //   },
  //   {
  //     label: "...",
  //     dropdown: [
  //       { label: "Documentation", href: "/docs" },
  //       { label: "Themes", href: "/themes" },
  //       { label: "GitHub", href: "/github" }
  //     ]
  //   },
  //   {
  //     label: "Components",
  //     href: "/docs/components"
  //   },
  //   {
  //     label: "Breadcrumb",
  //     isCurrentPage: true
  //   }
  // ];

  return (
    <>
      <div className={cn("h-full w-full flex bg-background")}>
        <Sidebar
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <ScrollArea className="w-full">
          <BreadcrumbDynamic items={breadcrumbs} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1">
              {activeTab === "Dashboard" && <MainDashboard />}
              {activeTab === "Customers" && <Customers />}
              {activeTab === "Items" && <Eligibility />}
              {activeTab === "Invoice" && <ReportGenerator />}
              {activeTab === "Company" && <Company />}
              {/* {activeTab === "Import to Tally" && <TallyDirectImport />} */}
              </main>
          </div>
        </ScrollArea>
        <Toaster />
      </div>
    </>
  );
};

export default Dashboard;
