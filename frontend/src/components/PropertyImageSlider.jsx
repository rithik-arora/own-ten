import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PropertyImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0)

  if (!images || images.length === 0) return null

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length)
  }

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="relative w-full mb-4 group">
      {/* Image with fade transition */}
      <div className="relative h-72 rounded-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index].url}
            alt="property"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? 'w-4 bg-indigo-500'
                  : 'w-2 bg-zinc-500/50 hover:bg-zinc-400'
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PropertyImageSlider