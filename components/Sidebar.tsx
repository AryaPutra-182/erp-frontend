'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
// Import Icons dari Lucide untuk desain yang bersih
import { ChevronDown, ChevronRight, LayoutDashboard, ShoppingCart, Factory, Users, DollarSign, Box, FileText, Truck, Home } from 'lucide-react';

const navGroups = [
  {
    name: 'General',
    icon: <LayoutDashboard size={18} />,
    links: [{ title: 'Dashboard', href: '/' }],
  },
  {
    name: 'Operations & Inventory', // Supply Chain & Manufacturing
    icon: <Factory size={18} />,
    links: [
      { title: 'Inventory', href: '/inventory', icon: <Box size={16} /> },
      { 
        title: 'Manufacturing', 
        href: '/manufacturing',
        icon: <Home size={16} />,
        children: [
          { name: 'BOM Recipes', href: '/manufacturing/bom' },
          { name: 'MO List', href: '/manufacturing/orders/list' },
          { name: 'Create Product', href: '/products' },
        ],
      },
    ],
  },
  {
    name: 'Procurement (Buy)', // Procurement is an essential business function
    icon: <ShoppingCart size={18} />,
    links: [
      { title: 'Purchasing', href: '/purchasing', icon: <FileText size={16} /> },
      // { title: 'Vendors', href: '/purchasing/vendors', icon: <Users size={16} /> },
    ],
  },
  {
    name: 'Sales & Distribution',
    icon: <Truck size={18} />,
    links: [
      { title: 'Customers', href: '/customers', icon: <Users size={16} /> },
      { title: 'Quotations', href: '/quotations', icon: <FileText size={16} /> },
      { title: 'Sales Orders', href: '/sales-orders', icon: <FileText size={16} /> },
      { title: 'Delivery Orders', href: '/delivery-orders', icon: <Truck size={16} /> },
    ],
  },
  {
    name: 'Finance & HR', // Finance and Human Resources are core ERP functions
    icon: <DollarSign size={18} />,
    links: [
      { title: 'Invoices', href: '/invoices', icon: <DollarSign size={16} /> },
      { 
        title: 'Employees', 
        href: '/employees',
        icon: <Users size={16} />,
        children: [
          { name: 'Employee List', href: '/employees' },
          { name: 'Departments', href: '/employees/departments' },
          { name: 'Positions', href: '/employees/positions' },
        ],
      },
    ],
  },
];

// Sub-Component untuk Link Normal dan Sub-Menu
const NavItem = ({ item, pathname }: { item: any; pathname: string }) => {
    const isExactActive = pathname === item.href;
    // Cek jika rute saat ini dimulai dengan link, menandakan parent aktif
    const isParentActive = item.children 
        ? item.children.some((child: any) => pathname.startsWith(child.href)) || pathname === item.href
        : pathname.startsWith(item.href) && item.href !== '/'; // Khusus '/' hanya jika exact

    const [openSub, setOpenSub] = useState(isParentActive);
    
    // Default URL for parent button click
    const parentHref = item.children && item.href ? item.href : '#';

    // Link normal atau header sub-menu
    const LinkContent = (
        <div 
            onClick={(e) => { 
                if (item.children) {
                    setOpenSub(!openSub);
                } else {
                    // Jika link non-dropdown, navigasi
                    e.currentTarget.click(); 
                }
            }}
            className={clsx(
                "flex items-center w-full px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer",
                isParentActive
                    ? "bg-cyan-500/80 text-slate-900 font-semibold"
                    : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
            )}
        >
            {item.icon && <span className='mr-3'>{item.icon}</span>}
            <span className='flex-grow'>{item.title || item.name}</span>
            {item.children && (
                openSub ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
        </div>
    );


    return (
        <div className='w-full'>
            {item.children ? (
                // Parent Link (as button/div for toggle)
                <div className='space-y-1'>
                    {LinkContent}
                    
                    {/* Submenu Links */}
                    <div 
                        className={clsx(
                            "transition-all duration-300 overflow-hidden",
                            openSub ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child: any) => (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    className={clsx(
                                        "block px-3 py-2 rounded-md text-sm transition",
                                        pathname === child.href
                                            ? "bg-cyan-400/80 text-slate-900 font-medium"
                                            : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
                                    )}
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // Normal Link
                <Link
                    href={item.href}
                    className={clsx(
                        "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition",
                        isExactActive && item.href !== '/'
                            ? "bg-cyan-500/80 text-slate-900 font-semibold shadow-md"
                            : "text-cyan-200 hover:bg-slate-800 hover:text-cyan-100"
                    )}
                >
                   {item.icon && <span className='mr-3'>{item.icon}</span>}
                   {item.title}
                </Link>
            )}
        </div>
    );
};


export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-[#111827] border-r border-slate-800 flex flex-col fixed top-0 left-0 z-50">
            
            {/* HEADER */}
            <div className="px-6 py-5">
                <h1 className="text-cyan-300 text-3xl font-extrabold tracking-wide">
                    MAJU MUNDUR
                </h1>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-4 py-2 overflow-y-auto space-y-6">

                {navGroups.map((group) => (
                    <div key={group.name}>
                        <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                           {group.icon} {group.name}
                        </h3>
                        <div className="space-y-1">
                            {group.links.map((item) => (
                                <NavItem key={item.href || item.title} item={item} pathname={pathname} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-slate-800 text-slate-500 text-sm">
                v1.0.0 (Core Logic: Procurement, Finance, HR, Supply Chain)
            </div>
        </aside>
    );
}