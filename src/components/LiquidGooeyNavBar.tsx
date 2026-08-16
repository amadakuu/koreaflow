import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'motion/react';
import { 
  Home, 
  BookMarked, 
  PlusCircle, 
  BrainCircuit, 
  BookOpen, 
} from 'lucide-react';
import { ActiveTab } from '../types';
import { startWindSound, updateWindSound, stopWindSound, playSnapPopSound } from '../utils/sound';

interface LiquidGooeyNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

interface NavTheme {
  primary: string;
  glow: string;
  textAccent: string;
  iconColor: string;
  pitchOffset: number;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  displayTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  theme: NavTheme;
}

// Ordered strictly: Kamus (Kiri 1), Tambah (Kiri 2), Beranda (TENGAH), Latihan (Kanan 1), Cerita (Kanan 2)
const navItems: NavItem[] = [
  { 
    id: 'dictionary', 
    label: 'Kamus', 
    displayTitle: 'Kamus Flashcard SRS', 
    icon: BookMarked,
    theme: {
      primary: '#0ea5e9', // Sky Blue
      glow: '0 8px 24px -2px rgba(14, 165, 233, 0.7)',
      textAccent: 'text-sky-400',
      iconColor: '#032b42',
      pitchOffset: 60,
    }
  },
  { 
    id: 'add-word', 
    label: 'Tambah', 
    displayTitle: 'Tambah Kosakata AI', 
    icon: PlusCircle, 
    badge: 'AI',
    theme: {
      primary: '#a855f7', // Purple
      glow: '0 8px 24px -2px rgba(168, 85, 247, 0.7)',
      textAccent: 'text-purple-400',
      iconColor: '#2b0947',
      pitchOffset: 120,
    }
  },
  { 
    id: 'dashboard', 
    label: 'Beranda', 
    displayTitle: 'Beranda Progres', 
    icon: Home,
    theme: {
      primary: '#10b981', // Emerald
      glow: '0 8px 24px -2px rgba(168, 85, 247, 0.7)',
      textAccent: 'text-emerald-400',
      iconColor: '#042f21',
      pitchOffset: 0,
    }
  },
  { 
    id: 'quiz', 
    label: 'Latihan', 
    displayTitle: 'Latihan Soal Adaptif', 
    icon: BrainCircuit,
    theme: {
      primary: '#f59e0b', // Amber
      glow: '0 8px 24px -2px rgba(245, 158, 11, 0.7)',
      textAccent: 'text-amber-400',
      iconColor: '#3d2003',
      pitchOffset: 180,
    }
  },
  { 
    id: 'story', 
    label: 'Cerita', 
    displayTitle: 'Cerita SPOK Interaktif', 
    icon: BookOpen,
    theme: {
      primary: '#f43f5e', // Rose
      glow: '0 8px 24px -2px rgba(244, 63, 94, 0.7)',
      textAccent: 'text-rose-400',
      iconColor: '#3b0613',
      pitchOffset: 90,
    }
  },
];

export const LiquidGooeyNavBar: React.FC<LiquidGooeyNavBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tabCenters, setTabCenters] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(440);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSlimeMoving, setIsSlimeMoving] = useState<boolean>(false);
  const [moveDirection, setMoveDirection] = useState<number>(0);
  const prevIndexRef = useRef<number>(2);

  // If activeTab is 'settings', fallback to dashboard index for navbar indicator
  const effectiveTab = activeTab === 'settings' ? 'dashboard' : activeTab;
  const activeIndex = Math.max(0, navItems.findIndex((item) => item.id === effectiveTab));
  const currentItem = navItems[activeIndex] || navItems[2];
  const currentTheme = currentItem.theme;

  // Real-time animated coordinate for the ball and concave scoop
  const [currentX, setCurrentX] = useState<number>(220);

  // Measure tab button centers within container
  const measureTabs = useCallback(() => {
    if (!containerRef.current) return;
    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('.liquid-nav-btn');
    const containerRect = containerRef.current.getBoundingClientRect();
    setContainerWidth(containerRect.width || 440);

    const centers: number[] = [];
    buttons.forEach((btn) => {
      const btnRect = btn.getBoundingClientRect();
      centers.push(btnRect.left - containerRect.left + btnRect.width / 2);
    });

    if (centers.length === navItems.length) {
      setTabCenters(centers);
      if (!isDragging && centers[activeIndex] !== undefined) {
        setCurrentX(centers[activeIndex]);
      }
    }
  }, [activeIndex, isDragging]);

  useEffect(() => {
    measureTabs();
    window.addEventListener('resize', measureTabs);
    return () => window.removeEventListener('resize', measureTabs);
  }, [measureTabs]);

  // When activeIndex changes programmatically or via tap
  useEffect(() => {
    if (tabCenters[activeIndex] !== undefined && !isDragging) {
      const targetCenter = tabCenters[activeIndex];
      const dir = activeIndex > prevIndexRef.current ? 1 : activeIndex < prevIndexRef.current ? -1 : 0;
      setMoveDirection(dir);
      prevIndexRef.current = activeIndex;

      setCurrentX(targetCenter);
      setIsSlimeMoving(true);

      const timer = setTimeout(() => {
        setIsSlimeMoving(false);
      }, 250); // Faster duration for snappier feedback

      return () => clearTimeout(timer);
    }
  }, [activeIndex, tabCenters, isDragging]);

  const handleSelectTab = (item: NavItem) => {
    if (isDragging) return;
    playSnapPopSound(item.theme.pitchOffset);
    setActiveTab(item.id);
  };

  // Drag Handlers for Drag-to-Slide gesture
  const handleDragStart = () => {
    setIsDragging(true);
    setIsSlimeMoving(true);
    startWindSound();
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = info.point.x - containerRect.left;
    const clampedX = Math.max(24, Math.min(containerWidth - 24, relativeX));
    
    setCurrentX(clampedX);
    updateWindSound(info.velocity.x);

    // Determine direction
    if (info.velocity.x > 50) setMoveDirection(1);
    else if (info.velocity.x < -50) setMoveDirection(-1);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    stopWindSound();

    if (!containerRef.current || tabCenters.length === 0) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const dropX = info.point.x - containerRect.left;

    // Find nearest tab index
    let closestIdx = 0;
    let minDistance = Infinity;
    tabCenters.forEach((center, idx) => {
      const dist = Math.abs(center - dropX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    const targetItem = navItems[closestIdx];
    playSnapPopSound(targetItem.theme.pitchOffset);
    setActiveTab(targetItem.id);
    setCurrentX(tabCenters[closestIdx]);

    setTimeout(() => {
      setIsSlimeMoving(false);
    }, 240);
  };

  const ActiveIcon = currentItem.icon;

  // Generate dynamic SVG concave notch path that dips down smoothly under currentX
  const notchWidth = 34; // half-width of the dip
  const notchDepth = 20; // depth of the concave scoop
  const cornerRadius = 24;
  const dockHeight = 58;
  const w = containerWidth || 440;
  const cx = currentX || w / 2;

  const svgConcavePath = `
    M 0,${cornerRadius}
    Q 0,0 ${cornerRadius},0
    L ${Math.max(cornerRadius, cx - notchWidth - 12)},0
    C ${cx - notchWidth + 4},0 ${cx - notchWidth + 8},${notchDepth} ${cx},${notchDepth}
    C ${cx + notchWidth - 8},${notchDepth} ${cx + notchWidth - 4},0 ${Math.min(w - cornerRadius, cx + notchWidth + 12)},0
    L ${w - cornerRadius},0
    Q ${w},0 ${w},${cornerRadius}
    L ${w},${dockHeight - cornerRadius}
    Q ${w},${dockHeight} ${w - cornerRadius},${dockHeight}
    L ${cornerRadius},${dockHeight}
    Q 0,${dockHeight} 0,${dockHeight - cornerRadius}
    Z
  `;

  return (
    <>
      {/* Floating Minimalist Slime Navigation Dock Container */}
      <div 
        id="liquid-gooey-nav-container" 
        className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto w-full max-w-md px-3 sm:px-4 z-40 flex flex-col items-center pointer-events-none"
      >
        {/* Main Dock Container */}
        <div 
          ref={containerRef}
          className="relative pointer-events-auto w-full h-[58px] flex items-center justify-between touch-none select-none"
        >
          {/* Dynamic Concave Fluid Background SVG */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <svg 
              className="w-full h-[58px] overflow-visible drop-shadow-[0_16px_35px_rgba(0,0,0,0.92)]"
              viewBox={`0 0 ${w} ${dockHeight}`}
              preserveAspectRatio="none"
            >
              <path
                d={svgConcavePath}
                fill="#101015"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                className={isDragging ? '' : 'transition-all duration-200 ease-out'}
              />
              <path
                d={svgConcavePath}
                fill="none"
                stroke="url(#dockTopHighlight)"
                strokeWidth="1.2"
                className="opacity-60"
              />
              <defs>
                <linearGradient id="dockTopHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset={`${Math.max(0, ((cx - 36) / w) * 100)}%`} stopColor="transparent" />
                  <stop offset={`${(cx / w) * 100}%`} stopColor={currentTheme.primary} stopOpacity="0.9" />
                  <stop offset={`${Math.min(100, ((cx + 36) / w) * 100)}%`} stopColor="transparent" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Draggable Minimalist Slime Ball Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <motion.div
              drag="x"
              dragConstraints={containerRef}
              dragElastic={0.06}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="pointer-events-auto absolute top-0 -translate-y-1/2 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-30"
              animate={{
                x: cx - 23,
                scaleX: isSlimeMoving ? 1.38 : 1,
                scaleY: isSlimeMoving ? 0.72 : 1,
                rotate: isSlimeMoving ? moveDirection * 9 : 0,
                y: isSlimeMoving ? -3 : 0,
              }}
              transition={{
                type: 'spring',
                stiffness: 680, // Snappy & fast
                damping: 28,
                mass: 0.45,
              }}
              style={{
                width: 46,
                height: 46,
                backgroundColor: currentTheme.primary,
                boxShadow: `${currentTheme.glow}, inset 0 2px 3px rgba(255, 255, 255, 0.5)`,
                transition: 'background-color 0.22s ease, box-shadow 0.22s ease',
              }}
            >
              {/* Minimalist Centered Icon Inside the Slime Ball */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={effectiveTab}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 650, damping: 25 }}
                  className="flex items-center justify-center w-full h-full pointer-events-none"
                >
                  <ActiveIcon 
                    className="w-4.5 h-4.5 stroke-[2.5] transition-colors"
                    style={{ color: currentTheme.iconColor }}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* 5 Nav Items: Dictionary (L), Add-Word (L), Dashboard (C), Quiz (R), Story (R) */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = effectiveTab === item.id;

            return (
              <button
                key={item.id}
                id={`liquid-nav-btn-${item.id}`}
                onClick={() => handleSelectTab(item)}
                className={`liquid-nav-btn relative z-10 flex-1 h-full flex flex-col items-center justify-center pt-2 pb-1 transition-all duration-150 cursor-pointer select-none group ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {/* Icon Placeholder (Only visible when NOT active) */}
                <div className="relative flex items-center justify-center h-5">
                  {!isActive ? (
                    <Icon className="w-5 h-5 text-white/45 group-hover:text-white/80 stroke-[1.8] transition-colors" />
                  ) : (
                    <div className="w-5 h-5" />
                  )}

                  {item.badge && !isActive && (
                    <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-purple-500/90 text-[8px] font-bold text-white rounded-full leading-tight">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Minimalist Label */}
                <span 
                  className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-150 ${
                    isActive 
                      ? `${item.theme.textAccent} font-bold drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]` 
                      : 'text-white/40 group-hover:text-white/70'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
