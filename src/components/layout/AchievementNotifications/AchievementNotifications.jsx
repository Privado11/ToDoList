import { useNotification } from "@/context";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FilePlus,
  CheckCircle,
  PlusCircle,
  Edit3,
  Star,
  Target,
  Award,
  Zap,
  Crown,
  UserPlus,
  UserCheck,
  Trophy,
  X,
  Sparkles,
} from "lucide-react";

const getBadgeIcon = (iconName) => {
  const icons = {
    FilePlus,
    PlusCircle,
    Edit3,
    Star,
    CheckCircle,
    Target,
    Zap,
    Trophy,
    Crown,
    Users,
    UserPlus,
    UserCheck,
    Award,
  };
  return icons[iconName] || Star;
};

const gradientMap = {
  gray: "from-gray-500 to-gray-700",
  blue: "from-blue-500 to-blue-700",
  purple: "from-purple-500 to-purple-700",
  green: "from-green-500 to-green-700",
  emerald: "from-emerald-500 to-emerald-700",
  gold: "from-yellow-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-700",
};

function AchievementNotifications() {
  const [achievement, setAchievement] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { notifications, markAsRead } = useNotification();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const checkForNewAchievements = async () => {
      if (!notifications || notifications.length === 0) return;
      if (isProcessingRef.current) return;

      isProcessingRef.current = true;

      try {
        const unshownAchievements = notifications.filter(
          (notification) =>
            notification.type === "badge_earned" && !notification.is_read
        );

        if (unshownAchievements.length > 0 && !achievement) {
          const newAchievement = unshownAchievements[0];
          setAchievement(newAchievement);

          await markAsRead(newAchievement.id);
        }
      } finally {
        isProcessingRef.current = false;
      }
    };

    checkForNewAchievements();
  }, [notifications, achievement, markAsRead]);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      const autoClose = setTimeout(() => {
        onClose();
      }, 7000);

      return () => {
        clearTimeout(timer);
        clearTimeout(autoClose);
      };
    }
  }, [achievement]);

  const onClose = () => {
    setAchievement(null);
  };

  if (!achievement) return null;

  const IconComponent = getBadgeIcon(
    achievement.content?.icon || achievement.icon
  );
  const gradientClass =
    gradientMap[achievement.content?.color || achievement.color] ||
    gradientMap.gold;
  const achievementData = achievement.content || achievement;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/30 backdrop-blur-md"
          onClick={onClose}
        />

        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                  scale: Math.random() * 0.8 + 0.5,
                }}
                animate={{
                  opacity: 0,
                  y: window.innerHeight + 100,
                  rotate: 360 + Math.random() * 360,
                  scale: 0,
                }}
                transition={{
                  duration: 3.5,
                  delay: Math.random() * 1.2,
                  ease: "easeOut",
                }}
                className={`absolute w-4 h-4 ${
                  i % 4 === 0
                    ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                    : i % 4 === 1
                    ? "bg-gradient-to-r from-pink-400 to-purple-400"
                    : i % 4 === 2
                    ? "bg-gradient-to-r from-blue-400 to-cyan-400"
                    : "bg-gradient-to-r from-green-400 to-emerald-400"
                } rounded-full shadow-lg`}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{
            scale: 0,
            rotate: -15,
            opacity: 0,
            y: -100,
          }}
          animate={{
            scale: 1,
            rotate: 0,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.8,
            opacity: 0,
            y: 50,
            rotate: 5,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            duration: 0.8,
          }}
          className="relative z-10"
        >
          <Card className="relative overflow-hidden bg-white/95 dark:bg-gray-900/95 shadow-2xl border-2 border-white/30 max-w-md w-full backdrop-blur-xl">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5`}
            />

            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20 blur-xl`}
            />

            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20 rounded-lg" />

            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 0.5, 1, 0],
                    scale: [0, 1, 0.8, 1.2, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                  className="absolute"
                  style={{
                    left: `${15 + (i % 4) * 25}%`,
                    top: `${15 + Math.floor(i / 4) * 25}%`,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-400 drop-shadow-lg" />
                </motion.div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 hover:bg-white/30 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="relative p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.3,
                }}
                className="mb-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} blur-sm`}
                  />

                  <div
                    className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} shadow-2xl border-4 border-white/30`}
                  >
                    <IconComponent className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>

                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-tr from-white/40 via-transparent to-transparent" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="mb-4">
                  <motion.span
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.7,
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                    }}
                    className="inline-block px-4 py-2 text-sm font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white rounded-full mb-4 shadow-lg border border-white/30"
                  >
                    🎉 Achievement unlocked!
                  </motion.span>
                </div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent mb-3"
                >
                  {achievementData.name}
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-gray-600 dark:text-gray-300 text-base leading-relaxed font-medium"
                >
                  {achievementData.description}
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br ${gradientClass} pointer-events-none -z-10`}
              />

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.8, 0.8],
                  opacity: [0, 0.1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br ${gradientClass} pointer-events-none -z-10`}
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AchievementNotifications;
