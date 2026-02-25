type Bounds = {
  x: number
  y: number
  width: number
  height: number
}

const MIN_VISIBLE_EDGE = 100

function getIntersection(windowBounds: Bounds, displayBounds: Bounds) {
  const left = Math.max(windowBounds.x, displayBounds.x)
  const right = Math.min(
    windowBounds.x + windowBounds.width,
    displayBounds.x + displayBounds.width
  )

  const top = Math.max(windowBounds.y, displayBounds.y)
  const bottom = Math.min(
    windowBounds.y + windowBounds.height,
    displayBounds.y + displayBounds.height
  )

  return {
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function hasVisibleWindowEdge(windowBounds: Bounds, displayBounds: Bounds) {
  const { width, height } = getIntersection(windowBounds, displayBounds)

  return width >= MIN_VISIBLE_EDGE && height >= MIN_VISIBLE_EDGE
}

function centerWindowOnDisplay(windowBounds: Bounds, displayBounds: Bounds): Bounds {
  const width = Math.min(windowBounds.width, displayBounds.width)
  const height = Math.min(windowBounds.height, displayBounds.height)

  return {
    width,
    height,
    x: displayBounds.x + Math.floor((displayBounds.width - width) / 2),
    y: displayBounds.y + Math.floor((displayBounds.height - height) / 2),
  }
}

export function resolveWindowBounds(
  windowBounds: Bounds,
  displayBounds: Bounds[],
  primaryDisplayBounds: Bounds
) {
  if (displayBounds.some((display) => hasVisibleWindowEdge(windowBounds, display))) {
    return windowBounds
  }

  return centerWindowOnDisplay(windowBounds, primaryDisplayBounds)
}
