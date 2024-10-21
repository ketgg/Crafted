"use client"

import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type BackdropProps = {
  backdropUrl: string
  className?: string
}

const Backdrop = ({ backdropUrl, className }: BackdropProps) => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "center start"], // Start when div tocuhes the top, end when it leaves
  })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  return (
    <motion.div
      ref={ref}
      style={{ scale }}
      className={cn(
        "absolute top-0 left-0 flex flex-col w-full h-full -z-10",
        className
      )}
    >
      <motion.div
        key={backdropUrl}
        initial={{ opacity: 0 }}
        animate={{ opacity: backdropUrl ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        style={{
          backgroundImage: `url(${backdropUrl})`,
        }}
        className={cn(
          "absolute left-0 flex flex-col w-full h-full bg-center bg-cover bg-no-repeat"
        )}
      >
        <div className="absolute top-0 left-0 flex flex-col w-full h-full backdrop-overlay"></div>
      </motion.div>
    </motion.div>
  )
}

export default Backdrop
