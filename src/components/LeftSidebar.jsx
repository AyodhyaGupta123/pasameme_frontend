import React, { useState } from "react";

const LeftSidebar = ({
  items = [],
  onItemClick = null,
  activeItem = null,
  theme = "dark",
  customColors = {},
}) => {
  // Default items if none provided
  const defaultItems = [
    {
      id: "chart",
      label: "Chart",
      href: "#",
      activeColor: "#FCD535",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path
            fillRule="evenodd"
            d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-10.28-.53a.75.75 0 000 1.06l2.25 2.25a.75.75 0 101.06-1.06L8.56 12l1.72-1.72a.75.75 0 10-1.06-1.06l-2.25 2.25z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "order",
      label: "Order",
      href: "#",
      activeColor: "#10B981",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
        </svg>
      ),
    },
    {
      id: "trade",
      label: "Trade",
      href: "#",
      activeColor: "#3B82F6",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      href: "#",
      activeColor: "#EC4899",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
  ];

  const sidebarItems = items.length > 0 ? items : defaultItems;
  const [internalActiveItem, setInternalActiveItem] = useState(
    sidebarItems[0]?.id || "chart",
  );
  const resolvedActiveItem = activeItem || internalActiveItem;

  // Theme colors
  const themeConfig = {
    dark: {
      desktopBg: "#0B0E11",
      mobileBg: "#15181C",
      border: "#262930",
      inactiveColor: "#94a3b8",
    },
    light: {
      desktopBg: "#F5F5F5",
      mobileBg: "#FFFFFF",
      border: "#E5E7EB",
      inactiveColor: "#9CA3AF",
    },
  };

  const colors = { ...themeConfig[theme], ...customColors };

  const handleItemClick = (itemId) => {
    setInternalActiveItem(itemId);
    if (onItemClick) {
      onItemClick(itemId);
    }
  };

  const SidebarIcon = ({ item, isMobile }) => {
    const isActive = resolvedActiveItem === item.id;
    const activeColor = item.activeColor || "#FCD535";
    const inactiveColor = colors.inactiveColor;

    return (
      <button
        type="button"
        onClick={() => handleItemClick(item.id)}
        className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          color: isActive ? activeColor : inactiveColor,
          focusRingColor: activeColor,
        }}
        title={item.label}
        aria-label={item.label}
        aria-pressed={isActive}
      >
        <div
          className={`transition-all duration-300 ${
            isActive ? "opacity-100 scale-110" : "opacity-60 hover:opacity-100"
          }`}
        >
          {item.icon}
        </div>
        {isMobile && (
          <span
            className={`text-[10px] text-center truncate w-full font-medium transition-opacity duration-300 ${
              isActive ? "opacity-100" : "opacity-60"
            }`}
          >
            {item.label}
          </span>
        )}
      </button>
    );
  };

  const renderSidebarIcons = (isMobile) => {
    const visibleItems = sidebarItems.filter(
      (item) => !item.mobileOnly || isMobile,
    );

    return visibleItems.map((item) => (
      <SidebarIcon key={item.id} item={item} isMobile={isMobile} />
    ));
  };

  return (
    <>
      {/* Desktop Sidebar (Left side) */}
      <aside
        className="hidden md:flex w-24 border-r flex-col items-center py-6 gap-4 shrink-0 overflow-y-auto"
        style={{
          backgroundColor: colors.desktopBg,
          borderColor: colors.border,
        }}
      >
        {renderSidebarIcons(false)}
      </aside>

      {/* Mobile Bottom Navigation */}
      <div
        className="md:hidden fixed bottom-0 left-0 w-full h-24 border-t flex items-center justify-around z-50 px-2"
        style={{
          backgroundColor: colors.mobileBg,
          borderColor: colors.border,
        }}
      >
        {renderSidebarIcons(true)}
      </div>
    </>
  );
};

export default LeftSidebar;
