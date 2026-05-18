import React, { useState } from "react";
import {
  CandlestickChart,
  BarChart3,
  ArrowLeftRight,
  UserRound,
} from "lucide-react";

const LeftSidebar = ({
  items = [],
  onItemClick = null,
  activeItem = null,
  theme = "dark",
  customColors = {},
}) => {
  const defaultItems = [
    {
      id: "chart",
      label: "Markets",
      href: "#",
      activeColor: "#FCD535",
      icon: <CandlestickChart className="w-5 h-5" />,
    },
    {
      id: "order",
      label: "Orders",
      href: "#",
      activeColor: "#0ECB81",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "trade",
      label: "Trade",
      href: "#",
      activeColor: "#3B82F6",
      icon: <ArrowLeftRight className="w-5 h-5" />,
    },
    {
      id: "profile",
      label: "Profile",
      href: "#",
      activeColor: "#F6465D",
      icon: <UserRound className="w-5 h-5" />,
    },
  ];

  const sidebarItems = items.length > 0 ? items : defaultItems;

  const [internalActiveItem, setInternalActiveItem] = useState(
    sidebarItems[0]?.id || "chart"
  );

  const resolvedActiveItem = activeItem || internalActiveItem;

  const themeConfig = {
    dark: {
      desktopBg: "#0B0E11",
      mobileBg: "#0F1318",
      inactiveColor: "#6B7280",
    },
    light: {
      desktopBg: "#F5F5F5",
      mobileBg: "#FFFFFF",
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

    return (
      <button
        type="button"
        onClick={() => handleItemClick(item.id)}
        className={`group relative flex flex-col items-center justify-center transition-all duration-300 active:scale-95 border-none bg-transparent cursor-pointer`}
        style={{
          width: isMobile ? "68px" : "56px",
          height: isMobile ? "58px" : "56px",
        }}
      >
        {isActive && (
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-20"
            style={{
              background: activeColor,
            }}
          />
        )}

        <div
          className={`relative flex items-center justify-center rounded-2xl transition-all duration-300 ${
            isActive
              ? "scale-110 shadow-lg"
              : "opacity-60 group-hover:opacity-100"
          }`}
          style={{
            width: isMobile ? 42 : 46,
            height: isMobile ? 42 : 46,
            background: isActive ? `${activeColor}15` : "transparent",
            color: isActive ? activeColor : colors.inactiveColor,
            boxShadow: isActive
              ? `0 10px 30px ${activeColor}20`
              : "none",
          }}
        >
          {item.icon}
        </div>

        {isMobile && (
          <span
            className={`mt-1 text-[10px] font-semibold tracking-wide transition-all duration-300 ${
              isActive ? "opacity-100" : "opacity-60"
            }`}
            style={{
              color: isActive ? activeColor : colors.inactiveColor,
            }}
          >
            {item.label}
          </span>
        )}
      </button>
    );
  };

  const renderSidebarIcons = (isMobile) => {
    const visibleItems = sidebarItems.filter(
      (item) => !item.mobileOnly || isMobile
    );

    return visibleItems.map((item) => (
      <SidebarIcon key={item.id} item={item} isMobile={isMobile} />
    ));
  };

  return (
    <>
      <aside
        className="hidden md:flex w-[88px] flex-col items-center py-5 gap-5 shrink-0 overflow-y-auto"
        style={{
          backgroundColor: colors.desktopBg,
        }}
      >
        <div className="flex flex-col items-center gap-5">
          {renderSidebarIcons(false)}
        </div>
      </aside>

      <div
        className="md:hidden fixed bottom-0 left-0 w-full h-[74px] flex items-center justify-around z-50 px-2 backdrop-blur-2xl"
        style={{
          background: "rgba(15,19,24,0.96)",
        }}
      >
        {renderSidebarIcons(true)}
      </div>
    </>
  );
};

export default LeftSidebar;